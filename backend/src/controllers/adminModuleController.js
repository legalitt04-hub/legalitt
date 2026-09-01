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
    const { page = 1, limit = 15, status, serviceType, search } = req.query;
    require('../models/User');
    require('../models/Advocate');
    const Booking = require('../models/Booking');

    const bookingFilter = {};
    if (status) {
      if (status === 'open') bookingFilter.status = { $in: ['open', 'confirmed', 'pending_assignment'] };
      else if (status === 'pending') bookingFilter.status = { $in: ['pending', 'pending_assignment'] };
      else if (status === 'in_progress') bookingFilter.status = 'in_progress';
      else if (status === 'resolved') bookingFilter.status = 'completed';
      else if (status === 'closed') bookingFilter.status = 'cancelled';
    }
    if (serviceType) bookingFilter.serviceType = serviceType;

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(bookingFilter)
      .populate('client', 'name email phone avatar')
      .populate({
        path: 'advocate',
        populate: { path: 'user', select: 'name email phone avatar' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Booking.countDocuments(bookingFilter);

    const formattedCases = bookings.map(b => {
      const clientObj = b.client || {};
      const advObj = b.advocate || null;
      return {
        _id: b._id,
        caseNumber: b.bookingId || `LGT-${b._id.toString().slice(-6).toUpperCase()}`,
        title: (b.issue || b.issueDescription || b.notes || `${b.type || b.serviceType || 'Legal'} Case`).split('\n')[0]?.substring(0, 65),
        client: {
          _id: clientObj._id,
          name: clientObj.name || b.recipientDetails?.name || 'Client',
          email: clientObj.email || b.recipientDetails?.email || 'N/A',
          phone: clientObj.phone || b.recipientDetails?.phone || 'N/A',
        },
        advocate: advObj ? {
          _id: advObj._id,
          user: {
            name: advObj.user?.name || 'Assigned Advocate',
            email: advObj.user?.email,
            avatar: advObj.user?.avatar,
          },
          specializations: advObj.specializations || [],
        } : null,
        serviceType: b.serviceType || b.type || 'legal_notice',
        status: b.status === 'confirmed' || b.status === 'pending_assignment' ? 'open' : b.status === 'in_progress' ? 'in_progress' : b.status === 'completed' ? 'resolved' : b.status === 'cancelled' ? 'closed' : 'pending',
        priority: b.priority || 'medium',
        payment: {
          amount: b.payment?.amount || b.amount || 1499,
          status: b.payment?.status || (b.paymentStatus === 'completed' ? 'paid' : 'pending'),
        },
        description: b.issue || b.issueDescription || b.notes || '',
        notes: b.adminNotes || '',
        documents: b.documents || [],
        advocateDocuments: b.advocateDocuments || [],
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    res.json({
      success: true,
      data: formattedCases,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        hasMore: (Number(page) * Number(limit)) < total,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCase = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const { status, notes, adminNotes, advocateId, paymentStatus, priority } = req.body;

    // Map from Case display status → Booking DB status
    const STATUS_MAP = {
      open: 'pending_assignment',
      pending: 'pending',
      in_progress: 'in_progress',
      resolved: 'completed',
      closed: 'cancelled',
    };

    const update = {};
    if (status) update.status = STATUS_MAP[status] || status;
    if (notes !== undefined || adminNotes !== undefined) update.adminNotes = adminNotes || notes;
    if (advocateId !== undefined) update.advocate = advocateId || null;
    if (paymentStatus) update['payment.status'] = paymentStatus;
    if (priority) update.priority = priority;

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: false }
    )
      .populate('client', 'name email phone avatar')
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name email avatar' } });

    if (!updated) return next(new AppError('Case/Booking not found', 404));
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};


exports.deleteCase = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      // Fallback: try Case model
      await Case.findByIdAndDelete(req.params.id);
    }
    res.json({ success: true, message: 'Case deleted' });
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
// Returns ALL documents: standalone (Document model) + booking-embedded (both sides)
exports.getDocuments = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const { search, direction, page = 1, limit = 50 } = req.query;

    // 1. Standalone documents
    const standaloneDocs = await Document.find()
      .populate('uploadedBy', 'name avatar role')
      .populate('owner', 'name avatar role')
      .sort('-createdAt')
      .lean();

    // 2. Booking-embedded documents (client uploaded when creating booking)
    const bookings = await Booking.find({ 'documents.0': { $exists: true } })
      .populate('client', 'name email avatar')
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar' } })
      .select('documents client advocate serviceType createdAt advocateDocuments')
      .lean();

    // Flatten booking docs into unified format
    const bookingClientDocs = [];
    const bookingAdvocateDocs = [];

    bookings.forEach(b => {
      // Client-uploaded docs (stored in booking.documents)
      (b.documents || []).forEach(doc => {
        bookingClientDocs.push({
          _id: `${b._id}_client_${doc.url?.slice(-8)}`,
          name: doc.name || 'Document',
          url: doc.url,
          type: doc.type || 'pdf',
          uploadedAt: doc.uploadedAt || b.createdAt,
          direction: 'client_to_advocate',
          directionLabel: 'Client → Advocate',
          uploadedBy: b.client,
          recipient: b.advocate?.user || null,
          bookingId: b._id,
          serviceType: b.serviceType,
          source: 'booking',
          category: 'legal',
        });
      });

      // Advocate-uploaded docs (stored in booking.advocateDocuments)
      (b.advocateDocuments || []).forEach(doc => {
        bookingAdvocateDocs.push({
          _id: `${b._id}_adv_${doc.url?.slice(-8)}`,
          name: doc.name || 'Document',
          url: doc.url,
          type: doc.type || 'pdf',
          uploadedAt: doc.uploadedAt || b.createdAt,
          direction: 'advocate_to_client',
          directionLabel: 'Advocate → Client',
          uploadedBy: b.advocate?.user || null,
          recipient: b.client,
          bookingId: b._id,
          serviceType: b.serviceType,
          source: 'booking',
          category: 'legal',
        });
      });
    });

    // Normalize standalone docs
    const normalizedStandalone = standaloneDocs.map(d => ({
      ...d,
      direction: 'standalone',
      directionLabel: 'Standalone Upload',
      source: 'document_model',
    }));

    let allDocs = [...bookingClientDocs, ...bookingAdvocateDocs, ...normalizedStandalone]
      .sort((a, b) => new Date(b.uploadedAt || b.createdAt).getTime() - new Date(a.uploadedAt || a.createdAt).getTime());

    // Filter by direction
    if (direction && direction !== 'all') {
      allDocs = allDocs.filter(d => d.direction === direction);
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      allDocs = allDocs.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.uploadedBy?.name?.toLowerCase().includes(q) ||
        d.recipient?.name?.toLowerCase().includes(q)
      );
    }

    const total = allDocs.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const paginated = allDocs.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      data: paginated,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      counts: {
        clientToAdvocate: bookingClientDocs.length,
        advocateToClient: bookingAdvocateDocs.length,
        standalone: normalizedStandalone.length,
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Upload document on behalf of advocate (attaches to booking.advocateDocuments)
exports.uploadDocForBooking = async (req, res, next) => {
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const Booking = require('../models/Booking');
    const { bookingId, side = 'client' } = req.body; // side: 'client' | 'advocate'

    if (!req.file) return next(new AppError('No file uploaded.', 400));
    if (!bookingId) return next(new AppError('bookingId is required.', 400));

    const booking = await Booking.findById(bookingId);
    if (!booking) return next(new AppError('Booking not found.', 404));

    const isPdf = req.file.mimetype?.includes('pdf') || req.file.originalname?.toLowerCase().endsWith('.pdf');
    const isImage = req.file.mimetype?.startsWith('image/');
    const resourceType = isImage ? 'image' : isPdf ? 'raw' : 'auto';

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `legalitt/admin-doc-uploads/${side}`, resource_type: resourceType, use_filename: true, unique_filename: true },
        (err, res) => err ? reject(err) : resolve(res)
      );
      stream.end(req.file.buffer);
    });

    const docEntry = {
      url: result.secure_url,
      name: req.file.originalname,
      type: req.file.mimetype?.includes('image') ? 'image' : 'pdf',
      uploadedAt: new Date(),
      uploadedByAdmin: req.user._id,
    };

    // Push to the right side
    const field = side === 'advocate' ? 'advocateDocuments' : 'documents';
    await Booking.findByIdAndUpdate(bookingId, { $push: { [field]: docEntry } });

    res.json({ success: true, data: { url: result.secure_url, name: req.file.originalname, side } });
  } catch (err) { next(err); }
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

// ─── FIR Drafts Admin ─────────────────────────────────────────────────────────
exports.getFIRDrafts = async (req, res, next) => {
  try {
    const FIRDraft = require('../models/FIRDraft');
    const drafts = await FIRDraft.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: drafts });
  } catch (err) { next(err); }
};

exports.getFIRDraft = async (req, res, next) => {
  try {
    const FIRDraft = require('../models/FIRDraft');
    const draft = await FIRDraft.findById(req.params.id).populate('user', 'name email phone');
    if (!draft) return res.status(404).json({ success: false, message: 'FIR Draft not found' });
    res.json({ success: true, data: draft });
  } catch (err) { next(err); }
};

exports.updateFIRDraftStatus = async (req, res, next) => {
  try {
    const FIRDraft = require('../models/FIRDraft');
    const draft = await FIRDraft.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!draft) return res.status(404).json({ success: false, message: 'FIR Draft not found' });
    res.json({ success: true, data: draft });
  } catch (err) { next(err); }
};

exports.uploadFIRDraftDocument = async (req, res, next) => {
  try {
    const cloudinary = require('cloudinary').v2;
    const fs = require('fs');
    const FIRDraft = require('../models/FIRDraft');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const isImage = req.file.mimetype?.startsWith('image/');
    const isPdf   = req.file.mimetype?.includes('pdf') || req.file.originalname?.toLowerCase().endsWith('.pdf');
    const resourceType = isImage ? 'image' : isPdf ? 'raw' : 'auto';

    let result;
    if (req.file.path) {
      result = await cloudinary.uploader.upload(req.file.path, { folder: 'legalitt/admin-fir-docs', resource_type: resourceType });
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    } else {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'legalitt/admin-fir-docs', resource_type: resourceType },
          (err, res) => err ? reject(err) : resolve(res)
        );
        stream.end(req.file.buffer);
      });
    }

    await FIRDraft.findByIdAndUpdate(req.params.id, {
      $push: { adminDocuments: { url: result.secure_url, name: req.file.originalname, uploadedAt: new Date() } }
    });

    res.json({ success: true, data: { url: result.secure_url, name: req.file.originalname } });
  } catch (err) {
    if (req.file?.path) { try { require('fs').unlinkSync(req.file.path); } catch (e) {} }
    next(err);
  }
};

// ─── Property Research Admin ──────────────────────────────────────────────────
exports.getPropertyResearch = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const requests = await Booking.find({ serviceType: 'property_research' })
      .populate('client', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
};

exports.updatePropertyResearchStatus = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('client', 'name email phone');
    if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.uploadPropertyResearchDocument = async (req, res, next) => {
  try {
    const cloudinary = require('cloudinary').v2;
    const fs = require('fs');
    const Booking = require('../models/Booking');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const isPdf   = req.file.mimetype?.includes('pdf') || req.file.originalname?.toLowerCase().endsWith('.pdf');
    const isImage = req.file.mimetype?.startsWith('image/');
    const resourceType = isImage ? 'image' : isPdf ? 'raw' : 'auto';

    let result;
    if (req.file.path) {
      result = await cloudinary.uploader.upload(req.file.path, { folder: 'legalitt/admin-property-reports', resource_type: resourceType });
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    } else {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'legalitt/admin-property-reports', resource_type: resourceType },
          (err, res) => err ? reject(err) : resolve(res)
        );
        stream.end(req.file.buffer);
      });
    }

    await Booking.findByIdAndUpdate(req.params.id, {
      $push: { advocateDocuments: { url: result.secure_url, name: req.file.originalname, type: isPdf ? 'pdf' : 'image', uploadedAt: new Date() } }
    });

    res.json({ success: true, data: { url: result.secure_url, name: req.file.originalname } });
  } catch (err) {
    if (req.file?.path) { try { require('fs').unlinkSync(req.file.path); } catch (e) {} }
    next(err);
  }
};

// ─── Document Forensic Admin ──────────────────────────────────────────────────
exports.getDocumentForensic = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const requests = await Booking.find({
      $or: [
        { serviceType: 'document_forensic' },
        { serviceType: 'forensic' },
        { serviceType: 'legal_advice', issue: /forensic/i }
      ]
    })
      .populate('client', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
};

exports.updateDocumentForensicStatus = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('client', 'name email phone');
    if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.uploadDocumentForensicReport = async (req, res, next) => {
  try {
    const cloudinary = require('cloudinary').v2;
    const fs = require('fs');
    const Booking = require('../models/Booking');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const isPdf   = req.file.mimetype?.includes('pdf') || req.file.originalname?.toLowerCase().endsWith('.pdf');
    const isImage = req.file.mimetype?.startsWith('image/');
    const resourceType = isImage ? 'image' : isPdf ? 'raw' : 'auto';

    let result;
    if (req.file.path) {
      result = await cloudinary.uploader.upload(req.file.path, { folder: 'legalitt/admin-forensic-reports', resource_type: resourceType });
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    } else {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'legalitt/admin-forensic-reports', resource_type: resourceType },
          (err, res) => err ? reject(err) : resolve(res)
        );
        stream.end(req.file.buffer);
      });
    }

    await Booking.findByIdAndUpdate(req.params.id, {
      $push: { advocateDocuments: { url: result.secure_url, name: req.file.originalname, type: isPdf ? 'pdf' : 'image', uploadedAt: new Date() } }
    });

    res.json({ success: true, data: { url: result.secure_url, name: req.file.originalname } });
  } catch (err) {
    if (req.file?.path) { try { require('fs').unlinkSync(req.file.path); } catch (e) {} }
    next(err);
  }
};
