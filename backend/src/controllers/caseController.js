const Case = require('../models/Case');
const Advocate = require('../models/Advocate');
const User = require('../models/User');
const { Chat, Message } = require('../models/Chat');
const { AppError } = require('../middlewares/errorHandler');

// POST /api/cases
exports.createCase = async (req, res, next) => {
  try {
    const { title, description, caseNumber, courtName, clientId, status } = req.body;

    const advocate = await Advocate.findOne({ user: req.user._id });
    if (!advocate) return next(new AppError('Advocate profile not found.', 404));

    const client = await User.findById(clientId);
    if (!client) return next(new AppError('Client user not found.', 404));

    const newCase = await Case.create({
      title,
      description,
      caseNumber,
      courtName,
      client: clientId,
      advocate: advocate._id,
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      data: newCase
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/cases
exports.getCases = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    // Find advocate or client ID
    let filter = {};
    if (req.user.role === 'advocate') {
      const advocate = await Advocate.findOne({ user: req.user._id });
      if (!advocate) return next(new AppError('Advocate profile not found.', 404));
      filter.advocate = advocate._id;
    } else {
      filter.client = req.user._id;
    }

    if (status) filter.status = status;

    const cases = await Case.find(filter).lean()
      .populate('client', 'name email phone avatar')
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name email avatar' } })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: cases
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/cases/:id
exports.getCase = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id)
      .populate('client', 'name email phone avatar city state')
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name email phone avatar' } })
      .lean();

    if (!legalCase) return next(new AppError('Case not found.', 404));

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/cases/:id
exports.updateCase = async (req, res, next) => {
  try {
    const { title, description, caseNumber, courtName, status } = req.body;

    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) return next(new AppError('Case not found.', 404));

    if (title !== undefined) legalCase.title = title;
    if (description !== undefined) legalCase.description = description;
    if (caseNumber !== undefined) legalCase.caseNumber = caseNumber;
    if (courtName !== undefined) legalCase.courtName = courtName;
    if (status !== undefined) legalCase.status = status;

    await legalCase.save();

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/cases/:id/timeline
exports.addTimelineEvent = async (req, res, next) => {
  try {
    const { title, description, date, status } = req.body;

    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) return next(new AppError('Case not found.', 404));

    legalCase.timeline.push({
      title,
      description,
      date: new Date(date),
      status: status || 'scheduled'
    });

    await legalCase.save();

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/cases/:id/notes
exports.addCaseNote = async (req, res, next) => {
  try {
    const { note } = req.body;

    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) return next(new AppError('Case not found.', 404));

    legalCase.notes.push({ note });

    await legalCase.save();

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/cases/:id/documents
exports.addCaseDocument = async (req, res, next) => {
  try {
    const { name, url } = req.body;

    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) return next(new AppError('Case not found.', 404));

    legalCase.documents.push({ name, url });
    await legalCase.save();

    // ── Auto-send document to client chat ────────────────────────────────────
    // When advocate uploads a case document, automatically send it as a file
    // message in the shared chat so the client receives it immediately.
    try {
      const advocate = await Advocate.findById(legalCase.advocate).lean();
      const advocateUserId = advocate?.user;

      if (advocateUserId && legalCase.client) {
        // Find the active chat between advocate and client
        const chat = await Chat.findOne({
          participants: { $all: [legalCase.client, advocateUserId] },
          isActive: true,
        });

        if (chat) {
          // Create the document message
          const docMessage = await Message.create({
            chat: chat._id,
            sender: req.user._id,         // advocate's user id
            content: name || 'Document',   // file name as content fallback
            messageType: 'file',
            fileUrl: url,
            fileName: name,
          });

          // Update chat's lastMessage pointer
          await Chat.findByIdAndUpdate(chat._id, { lastMessage: docMessage._id });

          // Broadcast to chat room via socket so both parties see it live
          try {
            const populated = await docMessage.populate('sender', 'name avatar');
            const { getIO } = require('../config/socket');
            const io = getIO();
            io.to(`chat:${chat._id}`).emit('new_message', {
              chatId: String(chat._id),
              message: populated,
            });
          } catch (socketErr) {
            // Socket may not be initialized in test environments — safe to ignore
            console.warn('[addCaseDocument] Socket emit skipped:', socketErr.message);
          }
        }
      }
    } catch (autoSendErr) {
      // Auto-send is best-effort — never block the primary document upload
      console.error('[addCaseDocument] Auto chat send error:', autoSendErr.message);
    }
    // ─────────────────────────────────────────────────────────────────────────

    res.json({
      success: true,
      data: legalCase
    });
  } catch (err) {
    next(err);
  }
};
