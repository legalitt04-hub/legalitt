const Booking = require('../models/Booking');
const Advocate = require('../models/Advocate');
const Case = require('../models/Case');
const { Chat } = require('../models/Chat');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const { createNotification } = require('../utils/notificationHelper');

// POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { advocateId, date, timeSlot, type, issue, isFollowUp, parentBookingId } = req.body;

    const mongoose = require('mongoose');
    if (!advocateId || !mongoose.Types.ObjectId.isValid(advocateId)) {
      return next(new AppError('A valid Advocate ID is required.', 400));
    }
    if (!date || isNaN(Date.parse(date))) {
      return next(new AppError('A valid booking date is required.', 400));
    }
    if (!timeSlot || !timeSlot.startTime) {
      return next(new AppError('A valid preferred time slot is required.', 400));
    }

    const advocate = await Advocate.findById(advocateId).populate('user', 'name fcmToken');
    if (!advocate) return next(new AppError('Advocate not found.', 404));
    if (advocate.verificationStatus !== 'approved') return next(new AppError('Advocate is not verified.', 400));

    // Determine fee
    let amount = advocate.consultationFee || 0;
    if (isFollowUp && parentBookingId) {
      const parent = await Booking.findById(parentBookingId);
      if (parent && parent.client.toString() === req.user._id.toString()) {
        const daysDiff = Math.floor((Date.now() - parent.createdAt) / 86400000);
        if (daysDiff <= advocate.followUpDays) amount = advocate.followUpFee;
      }
    }

    // Check conflict
    const conflict = await Booking.findOne({
      advocate: advocateId,
      date: new Date(date),
      'timeSlot.startTime': timeSlot.startTime,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) return next(new AppError('This time slot is already booked.', 409));

    const booking = await Booking.create({
      client: req.user._id,
      advocate: advocateId,
      date: new Date(date),
      timeSlot,
      type: type || 'in_person',
      issue,
      isFollowUp: !!isFollowUp,
      parentBooking: parentBookingId || undefined,
      payment: { amount, currency: 'INR', status: 'pending' },
    });

    logger.info(`Booking created: ${booking._id} by ${req.user._id}`);
    
    // Notify Advocate in real-time
    const adv = await Advocate.findById(advocateId);
    if (adv) {
      await createNotification({
        recipientId: adv.user,
        senderId: req.user._id,
        title: 'New Consultation Request ⚖️',
        message: `${req.user.name} has requested a consultation with you.`,
        type: 'booking_created',
        relatedId: booking._id,
      });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// Confirm payment and unlock chat
exports.confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.client.toString() !== req.user._id.toString())
      return next(new AppError('Not authorized.', 403));

    // Verify signature (bypassed in development mode for offline testing)
    if (process.env.NODE_ENV !== 'development') {
      const crypto = require('crypto');
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSig !== razorpaySignature)
        return next(new AppError('Payment verification failed.', 400));
    }

    // Create chat room
    const chat = await Chat.create({
      participants: [booking.client, (await Advocate.findById(booking.advocate)).user],
      booking: booking._id,
    });

    // Create Case portfolio entry
    await Case.create({
      title: booking.issue || 'Consultation Case',
      description: `Consultation booked on ${new Date(booking.date).toLocaleDateString()}`,
      caseNumber: `LGT-${booking._id.toString().substring(18).toUpperCase()}`,
      courtName: booking.type === 'in_person' ? 'In-Person' : 'Online',
      client: booking.client,
      advocate: booking.advocate,
      status: 'active'
    });

    booking.status = 'confirmed';
    booking.payment.status = 'paid';
    booking.payment.razorpayOrderId = razorpayOrderId;
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.paidAt = new Date();
    booking.chat = chat._id;
    await booking.save();

    // Notify Advocate in real-time
    const adv = await Advocate.findById(booking.advocate).populate('user', 'name');
    if (adv) {
      await createNotification({
        recipientId: adv.user._id || adv.user,
        senderId: req.user._id,
        title: 'New Consultation Booking 💳',
        message: `${req.user.name} has paid and confirmed a consultation with you.`,
        type: 'booking_accepted',
        relatedId: booking._id,
      });
    }

    // Notify Client in real-time
    await createNotification({
      recipientId: req.user._id,
      senderId: adv ? (adv.user._id || adv.user) : null,
      title: 'Booking Confirmed ✅',
      message: `Your consultation with ${adv?.user?.name || 'the advocate'} has been successfully booked.`,
      type: 'booking_accepted',
      relatedId: booking._id,
    });

    res.json({ success: true, data: { booking, chatId: chat._id } });
  } catch (err) { next(err); }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, advocateId, advocate, page = 1, limit = 10 } = req.query;
    const filter = { client: req.user._id };
    if (status) filter.status = status;
    const advId = advocateId || advocate;
    if (advId) filter.advocate = advId;

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar' } })
        .sort({ date: -1 }).skip(skip).limit(Number(limit)).lean(),
      Booking.countDocuments(filter),
    ]);
    res.json({ success: true, data: bookings, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

// GET /api/bookings/advocate
exports.getAdvocateBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const advocate = await Advocate.findOne({ user: req.user._id });
    if (!advocate) return next(new AppError('Advocate profile not found.', 404));

    const filter = { advocate: advocate._id };
    if (status) filter.status = status;

    if (req.query.today === 'true') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      filter.date = { $gte: startOfToday, $lte: endOfToday };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('client', 'name avatar phone')
        .sort({ date: -1 }).skip(skip).limit(Number(limit)).lean(),
      Booking.countDocuments(filter),
    ]);
    res.json({ success: true, data: bookings, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
};

// PATCH /api/bookings/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    const advocate = await Advocate.findById(booking.advocate);
    const isClient = booking.client.toString() === req.user._id.toString();
    const isAdvocate = advocate?.user?.toString() === req.user._id.toString();

    if (!isClient && !isAdvocate && req.user.role !== 'admin')
      return next(new AppError('Not authorized.', 403));

    booking.status = status;
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
      booking.cancelledBy = isClient ? 'client' : isAdvocate ? 'advocate' : 'admin';
    }
    await booking.save();

    // Notify Client when booking is confirmed or cancelled
    if (status === 'confirmed') {
      await createNotification({
        recipientId: booking.client,
        senderId: req.user._id,
        title: 'Consultation Confirmed! 🎉',
        message: `Your consultation request has been accepted by Advocate ${req.user.name}.`,
        type: 'booking_accepted',
        relatedId: booking._id,
      });
    } else if (status === 'cancelled') {
      await createNotification({
        recipientId: booking.client,
        senderId: req.user._id,
        title: 'Consultation Cancelled ❌',
        message: `Your consultation request was cancelled: ${cancellationReason || 'No reason provided'}.`,
        type: 'booking_rejected',
        relatedId: booking._id,
      });
    }

    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar' } })
      .populate('client', 'name avatar phone');
    if (!booking) return next(new AppError('Booking not found.', 404));
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};
