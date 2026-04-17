const { Chat, Message } = require('../models/Chat');
const Booking = require('../models/Booking');
const { AppError } = require('../middlewares/errorHandler');

// GET /api/chats - user's chat list
exports.getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id, isActive: true })
      .populate('participants', 'name avatar role')
      .populate('lastMessage')
      .populate('booking', 'date status payment.amount')
      .sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: chats });
  } catch (err) { next(err); }
};

// GET /api/chats/:id/messages
exports.getMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return next(new AppError('Chat not found.', 404));

    const isParticipant = chat.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return next(new AppError('Not authorized.', 403));

    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({
      chat: req.params.id,
      deletedFor: { $ne: req.user._id },
    })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip).limit(Number(limit)).lean();

    res.json({ success: true, data: messages.reverse() });
  } catch (err) { next(err); }
};

// POST /api/chats/:id/messages (REST fallback - socket preferred)
exports.sendMessage = async (req, res, next) => {
  try {
    const { content, messageType = 'text', fileUrl, fileName } = req.body;
    const chat = await Chat.findById(req.params.id);
    if (!chat) return next(new AppError('Chat not found.', 404));

    const isParticipant = chat.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return next(new AppError('Not authorized.', 403));

    const message = await Message.create({
      chat: chat._id, sender: req.user._id,
      content, messageType, fileUrl, fileName,
    });
    await Chat.findByIdAndUpdate(chat._id, { lastMessage: message._id });

    const populated = await message.populate('sender', 'name avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};
