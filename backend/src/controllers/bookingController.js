const Booking = require('../models/Booking');
const Advocate = require('../models/Advocate');
const { Chat } = require('../models/Chat');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

// POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { advocateId, date, timeSlot, type, issue, isFollowUp, parentBookingId } = req.body;

    const advocate = await Advocate.findById(advocateId).populate('user', 'name fcmToken');
    if (!advocate) return next(new AppError('Advocate not found.', 404));
    if (advocate.verificationStatus !== 'approved') return next(new AppError('Advocate is not verified.', 400));

    // Determine fee
    let amount = advocate.consultationFee;
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

    // Verify signature
    const crypto = require('crypto');
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSig !== razorpaySignature)
      return next(new AppError('Payment verification failed.', 400));

    // Create chat room
    const chat = await Chat.create({
      participants: [booking.client, (await Advocate.findById(booking.advocate)).user],
      booking: booking._id,
    });

    booking.status = 'confirmed';
    booking.payment.status = 'paid';
    booking.payment.razorpayOrderId = razorpayOrderId;
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.paidAt = new Date();
    booking.chat = chat._id;
    await booking.save();

    res.json({ success: true, data: { booking, chatId: chat._id } });
  } catch (err) { next(err); }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { client: req.user._id };
    if (status) filter.status = status;

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
