const Case = require('../models/Case');
const Service = require('../models/Service');
const Document = require('../models/Document');
const SupportTicket = require('../models/SupportTicket');
const NotificationTemplate = require('../models/NotificationTemplate');
const FIRDraft = require('../models/FIRDraft');
const { AppError } = require('../middlewares/errorHandler');

// ─── Cases ────────────────────────────────────────────────────────────────────
exports.getCases = async (req, res, next) => {
  try {
    const cases = await Case.find()
      .populate('client', 'name email avatar')
      .populate('assignedAdvocate', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, data: cases });
  } catch (err) {
    next(err);
  }
};

exports.updateCase = async (req, res, next) => {
  try {
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('client', 'name email avatar')
      .populate('assignedAdvocate', 'name email avatar');
      
    if (!updatedCase) return next(new AppError('Case not found', 404));
    res.json({ success: true, data: updatedCase });
  } catch (err) {
    next(err);
  }
};

// ─── Services ─────────────────────────────────────────────────────────────────
exports.getServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort('-createdAt');
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedService) return next(new AppError('Service not found', 404));
    res.json({ success: true, data: updatedService });
  } catch (err) {
    next(err);
  }
};

// ─── Documents ────────────────────────────────────────────────────────────────
exports.getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find()
      .populate('uploadedBy', 'name')
      .populate('owner', 'name')
      .sort('-createdAt');
    res.json({ success: true, data: documents });
  } catch (err) {
    next(err);
  }
};

// ─── Support Tickets ──────────────────────────────────────────────────────────
exports.getSupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort('-createdAt');
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};

exports.updateSupportTicket = async (req, res, next) => {
  try {
    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email avatar')
      .populate('assignedTo', 'name email avatar');
      
    if (!updatedTicket) return next(new AppError('Ticket not found', 404));
    res.json({ success: true, data: updatedTicket });
  } catch (err) {
    next(err);
  }
};

// ─── Notifications ────────────────────────────────────────────────────────────
exports.getNotificationTemplates = async (req, res, next) => {
  try {
    const templates = await NotificationTemplate.find().sort('-createdAt');
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
};

// ─── AI Drafts ────────────────────────────────────────────────────────────────
exports.getAIDrafts = async (req, res, next) => {
  try {
    const drafts = await FIRDraft.find()
      .populate('user', 'name')
      .sort('-createdAt');
    res.json({ success: true, data: drafts });
  } catch (err) {
    next(err);
  }
};
