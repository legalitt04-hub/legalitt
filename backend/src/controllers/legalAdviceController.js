// src/controllers/legalAdviceController.js
// Handles Legal Advice + Legal Notice booking requests
// Both go through Admin assignment flow (24-hour SLA)

const Booking = require('../models/Booking');
const Advocate = require('../models/Advocate');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const { createNotification } = require('../utils/notificationHelper');

/**
 * POST /api/v1/legal-advice/request
 * Creates a Legal Advice OR Legal Notice booking (no advocate needed — admin assigns within 24h)
 * Supports: Chat / Voice / Video consultation modes
 * Supports: document URLs (uploaded via Cloudinary beforehand)
 */
exports.createLegalRequest = async (req, res, next) => {
  try {
    const {
      consultationMode,   // 'chat' | 'voice' | 'video'
      serviceType,        // 'legal_advice' | 'legal_notice' | 'property_research' | 'fir_draft' | 'document_forensic'
      issueCategory,      // 'property', 'family', 'criminal', etc.
      issueDescription,   // Client's problem description
      preferredSlot,      // e.g. "Tomorrow, 10:30 AM"
      documents,          // Array of { url, name, type } — uploaded via /api/upload
      clientCity,
      clientState,
      clientCoords,       // { lat, lng }
      amount,             // Payment amount
      // ─── Property Research specific fields ───
      propertyData,       // Full property form object
      propertyAddress,
      propertyType,
      surveyNumber,
      registrationNumber,
      district,
      state,
      purpose,
      // ─── Document Forensic specific fields ───
      documentName,
      documentType,
    } = req.body;

    // Merge propertyData fields if passed as an object
    const propAddress    = propertyAddress    || propertyData?.propertyAddress    || '';
    const propType       = propertyType       || propertyData?.propertyType       || '';
    const propSurvey     = surveyNumber       || propertyData?.surveyNumber       || '';
    const propRegNo      = registrationNumber || propertyData?.registrationNumber || '';
    const propDistrict   = district           || propertyData?.district           || clientCity || '';
    const propState      = state              || propertyData?.state              || clientState || '';
    const propPurpose    = purpose            || propertyData?.purpose            || '';

    // Validate required fields
    if (!consultationMode || !['chat', 'voice', 'video'].includes(consultationMode)) {
      return next(new AppError('Consultation mode must be chat, voice, or video.', 400));
    }
    if (!serviceType || !['legal_advice', 'legal_notice', 'property_research', 'fir_draft', 'consultation', 'document_forensic'].includes(serviceType)) {
      return next(new AppError('Invalid service type.', 400));
    }
    if (!issueDescription || issueDescription.trim().length < 10) {
      return next(new AppError('Please provide at least 10 characters describing your legal concern.', 400));
    }

    // Determine amount based on mode
    const priceMap = {
      chat: 499,
      voice: 799,
      video: 1199,
    };
    const bookingAmount = amount || priceMap[consultationMode] || 499;

    const formattedDocs = Array.isArray(documents)
      ? documents.map((doc, idx) => {
          if (typeof doc === 'string') {
            return { url: doc, name: `Document_${idx + 1}`, type: doc.endsWith('.pdf') ? 'pdf' : 'image' };
          }
          return {
            url: doc?.url || doc?.uri || (typeof doc === 'string' ? doc : ''),
            name: doc?.name || `Document_${idx + 1}`,
            type: doc?.type || 'document',
          };
        }).filter(d => d.url)
      : [];

    const booking = await Booking.create({
      client: req.user._id,
      consultationMode,
      serviceType,
      type: consultationMode === 'video' ? 'video' : consultationMode === 'voice' ? 'phone' : 'chat',
      issue: `[${issueCategory || 'General'}] ${issueDescription.trim()}`,
      documents: formattedDocs,
      payment: {
        amount: bookingAmount,
        currency: 'INR',
        status: 'pending',
      },
      status: 'pending_assignment',
      assignmentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      clientCity: propDistrict || clientCity || req.user?.address?.city || '',
      clientState: propState || clientState || req.user?.address?.state || '',
      clientCoords: clientCoords || undefined,
      notes: preferredSlot ? `Preferred slot: ${preferredSlot}` : undefined,
      // ─── Property Research fields ────────────────────────────────────
      ...(serviceType === 'property_research' && {
        propertyAddress:    propAddress,
        propertyType:       propType,
        surveyNumber:       propSurvey,
        registrationNumber: propRegNo,
        district:           propDistrict,
        state:              propState,
        purpose:            propPurpose,
      }),
      // ─── Document Forensic fields ─────────────────────────────────────
      ...(serviceType === 'document_forensic' && {
        documentName: documentName || '',
        documentType: documentType || '',
      }),
    });

    logger.info(`Legal ${serviceType} request created: ${booking._id} by ${req.user.email}`);

    // Notify all admins via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('admin:new_booking', {
        bookingId: booking._id,
        serviceType: booking.serviceType,
        consultationMode: booking.consultationMode,
        clientName: req.user.name,
        clientCity: booking.clientCity,
        issue: booking.issue,
        createdAt: booking.createdAt,
        assignmentDeadline: booking.assignmentDeadline,
      });
    }

    // Notify nearby advocates via WhatsApp (non-blocking)
    if (booking.clientCity) {
      setImmediate(async () => {
        try {
          const nearbyAdvocates = await Advocate.find({
            'location.address.city': new RegExp(booking.clientCity, 'i'),
            isVerified: true,
            verificationStatus: 'approved',
          }).populate('user', 'phone name').limit(20);

          if (nearbyAdvocates.length > 0) {
            const { notifyNearbyAdvocates } = require('../services/whatsappService');
            await notifyNearbyAdvocates({
              advocates: nearbyAdvocates,
              city: booking.clientCity,
              consultationMode: booking.consultationMode,
              bookingId: booking._id.toString(),
            });
            await Booking.findByIdAndUpdate(booking._id, { whatsappSentToNearby: true });
          }
        } catch (err) {
          logger.error('WhatsApp notify nearby advocates failed:', err.message);
        }
      });
    }

    // Send instant in-app notification to client
    await createNotification({
      recipientId: req.user._id,
      senderId: req.user._id,
      title: 'Case Request Registered! 📋',
      message: `Your ${serviceType.replace(/_/g, ' ')} request (ID: LEG-${booking._id.toString().slice(-6).toUpperCase()}) has been registered. Verified advocate will be assigned within 24h.`,
      type: 'booking_created',
      relatedId: booking._id,
    });

    res.status(201).json({
      success: true,
      data: {
        bookingId: booking._id,
        amount: bookingAmount,
        currency: 'INR',
        status: booking.status,
        assignmentDeadline: booking.assignmentDeadline,
        message: 'Your request has been submitted. We will assign an advocate within 24 hours.',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/legal-advice/confirm-payment
 * Confirm Razorpay payment for a legal advice/notice booking
 */
exports.confirmLegalPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.client.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized.', 403));
    }

    // Verify Razorpay signature in production (skip for mock/test orders)
    const isMockOrder = razorpayOrderId?.startsWith('order_mock_') || razorpayPaymentId?.startsWith('pay_mock_') || razorpayPaymentId?.startsWith('pay_test_');
    if (process.env.NODE_ENV !== 'development' && !isMockOrder) {
      const crypto = require('crypto');
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSig !== razorpaySignature) {
        return next(new AppError('Payment verification failed. Please contact support.', 400));
      }
    }

    // Update payment status
    booking.payment.status = 'paid';
    booking.payment.razorpayOrderId = razorpayOrderId;
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.razorpaySignature = razorpaySignature;
    booking.payment.paidAt = new Date();
    // Keep status as pending_assignment — admin still needs to assign advocate
    await booking.save();

    logger.info(`Legal request payment confirmed: ${booking._id} — ₹${booking.payment.amount}`);

    // Send instant in-app notification to client for payment
    await createNotification({
      recipientId: req.user._id,
      senderId: req.user._id,
      title: 'Payment Confirmed! 💳',
      message: `Payment of ₹${booking.payment.amount} confirmed for case #LEG-${booking._id.toString().slice(-6).toUpperCase()}. Advocate assignment in progress.`,
      type: 'payment_success',
      relatedId: booking._id,
    });

    // Notify admin via socket that payment is confirmed
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('admin:payment_confirmed', {
        bookingId: booking._id,
        amount: booking.payment.amount,
        clientName: req.user.name,
      });
    }

    res.json({
      success: true,
      data: {
        bookingId: booking._id,
        status: booking.status,
        paymentStatus: booking.payment.status,
        assignmentDeadline: booking.assignmentDeadline,
        message: 'Payment confirmed! We are assigning an advocate to your request.',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/legal-advice/my-requests
 * Get all legal advice/notice requests for the logged-in client
 */
exports.getMyRequests = async (req, res, next) => {
  try {
    const { status, serviceType } = req.query;
    const filter = { client: req.user._id };
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;

    const bookings = await Booking.find(filter)
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar phone' } })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/legal-advice/request/:id
 * Get a single legal advice/notice request with full details including video room tokens
 */
exports.getRequestDetail = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar phone' } })
      .populate('client', 'name avatar phone email')
      .lean();

    if (!booking) return next(new AppError('Request not found.', 404));

    // Only the client or their assigned advocate can view full details
    const isClient = booking.client._id.toString() === req.user._id.toString();
    const isAdvocate = booking.advocate?.user?._id?.toString() === req.user._id.toString();

    if (!isClient && !isAdvocate && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to view this request.', 403));
    }

    // Return advocate-specific token or client token based on who's requesting
    const response = { ...booking };
    if (isAdvocate) {
      response.myVideoToken = booking.advocateVideoToken;
      delete response.videoRoomToken;
    } else {
      response.myVideoToken = booking.videoRoomToken;
      delete response.advocateVideoToken;
    }

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
};
