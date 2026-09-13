const SupportTicket = require('../models/SupportTicket');
const { AppError } = require('../middlewares/errorHandler');

// Create a new support ticket
exports.createSupportTicket = async (req, res, next) => {
  try {
    const { subject, description, category = 'general', priority = 'medium' } = req.body;
    if (!subject || !description) {
      return next(new AppError('Subject and description are required.', 400));
    }
    const ticket = await SupportTicket.create({
      subject,
      description,
      category,
      priority,
      user: req.user._id,
      status: 'open',
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// Get user's own tickets
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort('-createdAt')
      .lean();
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};

// User replies to an existing ticket
exports.replyToTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return next(new AppError('Message is required.', 400));

    // Ensure the ticket belongs to the user
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) {
      return next(new AppError('Ticket not found or unauthorized', 404));
    }

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      {
        $push: { messages: { sender: req.user._id, message, isStaff: false, createdAt: new Date() } },
        $set: { status: 'open' }, // Re-open the ticket if the user replies
      },
      { new: true }
    );

    res.json({ success: true, data: updatedTicket });
  } catch (err) {
    next(err);
  }
};
