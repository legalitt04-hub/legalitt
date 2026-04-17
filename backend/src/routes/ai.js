const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

const DISCLAIMER = '\n\n⚠️ DISCLAIMER: This is AI-generated information for educational purposes only. It does NOT constitute legal advice. Please consult a qualified advocate for your specific situation.';

const callAI = async (messages) => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'AI request failed');
  return data.content[0].text;
};

// POST /api/ai/legal-advice
router.post('/legal-advice', protect, async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) return next(new AppError('Question is required.', 400));

    const answer = await callAI([{
      role: 'user',
      content: `You are a helpful legal information assistant for Indian law. Answer this question clearly and in simple language. Always mention relevant Indian laws/acts.\n\nQuestion: ${question}`,
    }]);

    res.json({ success: true, data: { answer: answer + DISCLAIMER } });
  } catch (err) {
    logger.error('AI legal advice error:', err.message);
    next(err);
  }
});

// POST /api/ai/fir-draft
router.post('/fir-draft', protect, async (req, res, next) => {
  try {
    const { incident, date, location, complainantName, accusedDescription, witnesses } = req.body;
    if (!incident) return next(new AppError('Incident description is required.', 400));

    const prompt = `Generate a formal FIR (First Information Report) draft for Indian police in Hindi and English. Use this information:
- Incident: ${incident}
- Date: ${date || 'Not specified'}
- Location: ${location || 'Not specified'}
- Complainant: ${complainantName || 'Not specified'}
- Accused description: ${accusedDescription || 'Not specified'}
- Witnesses: ${witnesses || 'None'}

Format it as a proper FIR with all required sections. Include relevant IPC/BNS sections.`;

    const draft = await callAI([{ role: 'user', content: prompt }]);
    res.json({ success: true, data: { draft: draft + DISCLAIMER } });
  } catch (err) { next(err); }
});

// POST /api/ai/chat (streaming-ready)
router.post('/chat', protect, async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return next(new AppError('Messages are required.', 400));

    const systemMsg = 'You are a helpful legal assistant specializing in Indian law. Provide clear, practical guidance. Always add a disclaimer that this is not legal advice. Be concise and use simple language.';

    const answer = await callAI([
      { role: 'user', content: systemMsg },
      ...messages.slice(-10), // last 10 msgs for context
    ]);

    res.json({ success: true, data: { reply: answer + DISCLAIMER } });
  } catch (err) { next(err); }
});

module.exports = router;
