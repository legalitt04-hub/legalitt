const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

const { callAI, DISCLAIMER } = require('../services/aiService');
const ChatHistory = require('../models/ChatHistory');



const { aiRateLimiter } = require('../middlewares/rateLimiter');

// GET /api/ai/history - Get user's chat history with auto-title backfill
router.get('/history', protect, async (req, res, next) => {
  try {
    const history = await ChatHistory.find({ user: req.user.id }).sort({ lastUpdated: -1 });
    
    // Backfill titles for old chats asynchronously
    history.forEach(async (chat) => {
      if (chat.title === 'New Consultation' || chat.title.endsWith('...') || chat.title.length > 40) {
        if (chat.messages.length > 0) {
          try {
            const firstMsg = chat.messages.find(m => m.role === 'user')?.content || chat.messages[0].content;
            const newTitle = await callAI([
              { role: 'user', content: `Generate a 3-5 word concise title for this legal query: "${firstMsg}". Respond with ONLY the title text, no quotes or punctuation.` }
            ]);
            if (newTitle) {
              chat.title = newTitle.replace(/["']/g, '').trim();
              await chat.save();
            }
          } catch (e) { console.log('Backfill title failed for:', chat._id); }
        }
      }
    });

    res.json({ success: true, data: history });
  } catch (err) { next(err); }
});

// POST /api/ai/chat - Send message and save history
router.post('/chat', protect, aiRateLimiter, async (req, res, next) => {
  try {
    const { messages, conversationId: reqConversationId } = req.body;
    let conversationId = reqConversationId;
    
    console.log('📬 AI Chat Request - ConvID:', conversationId || 'NEW CHAT');
    console.log('💬 Messages count:', messages?.length);

    if (!messages?.length) return next(new AppError('Messages are required.', 400));

    const userMessage = messages[messages.length - 1].content;
    const systemMsg = 'You are a helpful legal assistant specializing in Indian law. Provide clear, practical guidance. Always add a disclaimer that this is not legal advice.';

    const contextMessages = messages.slice(-5);
    if (contextMessages.length > 0) {
      contextMessages[0].content = systemMsg + '\n\n' + contextMessages[0].content;
    }

    // Call AI
    const rawReply = await callAI(contextMessages);

    const replyWithDisclaimer = rawReply + DISCLAIMER;

    // Save to Database
    let chat;
    if (conversationId) {
      chat = await ChatHistory.findById(conversationId);
      if (!chat) console.log('⚠️ Chat not found for ID:', conversationId);
    }

    if (!chat) {
      // Generate a catchy title using AI for new chats
      let generatedTitle = userMessage.substring(0, 30) + '...';
      try {
        const titleResponse = await callAI([
          { role: 'user', content: `Generate a 3-5 word concise title for this legal query: "${userMessage}". Respond with ONLY the title text, no quotes or punctuation.` }
        ]);
        if (titleResponse) generatedTitle = titleResponse.replace(/["']/g, '').trim();
      } catch (e) {
        console.log('Title generation failed, using fallback');
      }

      chat = new ChatHistory({
        user: req.user.id,
        title: generatedTitle,
        messages: []
      });
      console.log('🆕 Created new chat with title:', generatedTitle);
    }

    chat.messages.push({ role: 'user', content: userMessage });
    chat.messages.push({ role: 'assistant', content: replyWithDisclaimer });
    chat.lastUpdated = Date.now();
    await chat.save();
    
    console.log('✅ Chat saved. Total messages:', chat.messages.length);

    res.json({ 
      success: true, 
      data: { 
        reply: replyWithDisclaimer,
        conversationId: chat._id
      } 
    });
  } catch (err) { 
    logger.error('AI Chat Error:', err.message);
    next(err); 
  }
});

// DELETE /api/ai/history/:id - Clear a conversation
router.delete('/history/:id', protect, async (req, res, next) => {
  try {
    await ChatHistory.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) { next(err); }
});

// POST /api/ai/stream - Real-time streaming chat
router.get('/stream', protect, aiRateLimiter, async (req, res, next) => {
  try {
    const { message, conversationId: reqConversationId } = req.query; // Use query params for SSE
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    let conversationId = reqConversationId;
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemMsg = 'You are a helpful legal assistant specializing in Indian law. Provide clear, practical guidance. Always add a disclaimer that this is not legal advice.';
    
    let fullReply = '';
    
    let contextMessages = [];
    if (conversationId) {
      const chat = await ChatHistory.findById(conversationId);
      if (chat && chat.messages) {
        contextMessages = chat.messages.slice(-4).map(m => ({ role: m.role, content: m.content }));
      }
    }
    contextMessages.push({ role: 'user', content: message });
    contextMessages[0].content = systemMsg + '\n\n' + contextMessages[0].content;

    // Stream from AI
    await callAI(contextMessages, (chunk) => {
      fullReply += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    // Save to DB after streaming ends
    const replyWithDisclaimer = fullReply + DISCLAIMER;
    let chat;
    if (conversationId) {
      chat = await ChatHistory.findById(conversationId);
    }
    if (!chat) {
      chat = new ChatHistory({
        user: req.user.id,
        title: message.substring(0, 40) + '...',
        messages: []
      });
    }
    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'assistant', content: replyWithDisclaimer });
    await chat.save();

    res.write(`data: ${JSON.stringify({ done: true, conversationId: chat._id })}\n\n`);
    res.end();

  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;

