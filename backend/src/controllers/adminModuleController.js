const Case = require('../models/Case');
const Service = require('../models/Service');
const Document = require('../models/Document');
const SupportTicket = require('../models/SupportTicket');
const NotificationTemplate = require('../models/NotificationTemplate');
const FIRDraft = require('../models/FIRDraft');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const AuditLog = require('../models/AuditLog');
const Review = require('../models/Review');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');

// ─── Cases ────────────────────────────────────────────────────────────────────
exports.getCases = async (req, res, next) => {
  try {
    const cases = await Case.find()
      .populate('client', 'name email avatar')
      .populate('advocate', 'name email avatar')
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
      .populate('advocate', 'name email avatar');
      
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

// ─── Categories ──────────────────────────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find().sort('displayOrder');
    if (categories.length === 0) {
      // Seed default categories if empty
      const defaultCats = [
        { name: 'Property Law', slug: 'property-law', description: 'Real estate, titles, property disputes', basePrice: 999 },
        { name: 'Criminal Law', slug: 'criminal-law', description: 'Bail, FIR, criminal defense', basePrice: 1499 },
        { name: 'Family Law', slug: 'family-law', description: 'Divorce, custody, maintenance', basePrice: 899 },
        { name: 'Cyber Crime', slug: 'cyber-crime', description: 'Online fraud, data theft, IT Act', basePrice: 1199 },
        { name: 'Employment', slug: 'employment', description: 'Labor disputes, wrongful termination', basePrice: 799 },
        { name: 'Consumer Law', slug: 'consumer-law', description: 'Defective products, service claims', basePrice: 499 }
      ];
      categories = await Category.insertMany(defaultCats);
    }
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

// ─── Coupons ─────────────────────────────────────────────────────────────────
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, data: coupons });
  } catch (err) { next(err); }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json({ success: true, data: coupon });
  } catch (err) { next(err); }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name avatar')
      .populate('advocate', 'name')
      .sort('-createdAt');
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

// ─── Audit Logs ──────────────────────────────────────────────────────────────
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email role').sort('-createdAt').limit(100);
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};

// ─── Admin Management ────────────────────────────────────────────────────────
exports.getAdmins = async (req, res, next) => {
  try {
    const adminRoles = [
      'admin',
      'super_admin',
      'support_executive',
      'accounts',
      'forensic_expert',
      'property_verification',
      'support',
      'superadmin'
    ];
    const admins = await User.find({ role: { $in: adminRoles } }).select('-password').sort('-createdAt');
    res.json({ success: true, data: admins });
  } catch (err) { next(err); }
};
