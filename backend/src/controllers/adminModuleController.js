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

// ─── Services ─────────────────────────────────────────────────────────────────
exports.getServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort('-createdAt');
    res.json({ success: true, data: services });
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
