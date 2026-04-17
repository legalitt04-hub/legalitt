const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const razorpay = require('../services/razorpay');
const Booking = require('../models/Booking');
const { AppError } = require('../middlewares/errorHandler');

router.post('/create-order', protect, authorize('client'), async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.client.toString() !== req.user._id.toString())
      return next(new AppError('Not authorized.', 403));

    const order = await razorpay.createOrder(booking.payment.amount, `Booking ${bookingId}`);
    await Booking.findByIdAndUpdate(bookingId, { 'payment.razorpayOrderId': order.id });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
