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
      .populate('user', 'name email phone avatar')
      .populate({
        path: 'advocate',
        populate: { path: 'user', select: 'name email phone avatar' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Booking.countDocuments(bookingFilter);

    const formattedCases = bookings.map(b => ({
      _id: b._id,
      caseNumber: b.bookingId || `LGT-${b._id.toString().slice(-6).toUpperCase()}`,
      title: b.issueDescription?.split('\n')[0]?.substring(0, 60) || b.issueCategory || `${(b.serviceType || 'Legal').replace(/_/g, ' ')} Case`,
      client: {
        _id: b.user?._id,
        name: b.user?.name || b.recipientDetails?.name || 'Client',
        email: b.user?.email || b.recipientDetails?.email || 'N/A',
        phone: b.user?.phone || b.recipientDetails?.phone || 'N/A',
      },
      advocate: b.advocate ? {
        _id: b.advocate._id,
        user: {
          name: b.advocate.user?.name || 'Assigned Advocate',
          email: b.advocate.user?.email,
          avatar: b.advocate.user?.avatar,
        },
        specializations: b.advocate.specializations || [],
      } : null,
      serviceType: b.serviceType || 'legal_notice',
      status: b.status === 'confirmed' || b.status === 'pending_assignment' ? 'open' : b.status === 'in_progress' ? 'in_progress' : b.status === 'completed' ? 'resolved' : b.status === 'cancelled' ? 'closed' : 'pending',
      priority: b.priority || 'medium',
      payment: {
        amount: b.amount || b.payment?.amount || 1499,
        status: b.payment?.status || (b.paymentStatus === 'completed' ? 'paid' : 'pending'),
      },
      description: b.issueDescription || b.notes,
      notes: b.adminNotes,
      documents: b.documents || [],
      advocateDocuments: b.advocateDocuments || [],
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

    res.json({
      success: true,
      data: formattedCases,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        hasMore: (Number(page) * Number(limit)) < total,
      }
    });
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

exports.deleteCase = async (req, res, next) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
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
