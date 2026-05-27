const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const Booking = require('../models/Booking');
const Advocate = require('../models/Advocate');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

// In production, integrate with Razorpay Payouts API or manual bank transfer
// For Phase 1: track withdrawal requests in DB

// GET /api/wallet/balance — advocate's available balance
router.get('/balance', protect, authorize('advocate'), async (req, res, next) => {
  try {
    const advocate = await Advocate.findOne({ user: req.user._id });
    if (!advocate) return next(new AppError('Advocate profile not found.', 404));

    // Sum all paid bookings
    const result = await Booking.aggregate([
      {
        $match: {
          advocate: advocate._id,
          'payment.status': 'paid',
          status: { $in: ['confirmed', 'completed'] },
        },
      },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: '$payment.amount' },
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    const stats = result[0] || { totalEarned: 0, totalBookings: 0 };
    // Platform takes 0% in Phase 1
    const platformFee = 0;
    const available = stats.totalEarned - platformFee;

    res.json({
      success: true,
      data: {
        totalEarned: stats.totalEarned,
        available,
        totalBookings: stats.totalBookings,
        platformFee,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/wallet/transactions — earnings history
router.get('/transactions', protect, authorize('advocate'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const advocate = await Advocate.findOne({ user: req.user._id });
    if (!advocate) return next(new AppError('Advocate profile not found.', 404));

    const skip = (Number(page) - 1) * Number(limit);
    const bookings = await Booking.find({
      advocate: advocate._id,
      'payment.status': 'paid',
    })
      .populate('client', 'name avatar')
      .sort({ 'payment.paidAt': -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const transactions = bookings.map((b) => ({
      id: b._id,
      type: 'credit',
      amount: b.payment.amount,
      description: `Consultation with ${b.client?.name || 'Client'}`,
      date: b.payment.paidAt || b.updatedAt,
      status: 'settled',
    }));

    res.json({ success: true, data: transactions });
  } catch (err) { next(err); }
});

// POST /api/wallet/withdraw — request withdrawal
router.post('/withdraw', protect, authorize('advocate'), async (req, res, next) => {
  try {
    const { amount, bankAccount, ifscCode, accountName } = req.body;

    if (!amount || amount < 100) {
      return next(new AppError('Minimum withdrawal amount is ₹100.', 400));
    }
    if (!bankAccount || !ifscCode || !accountName) {
      return next(new AppError('Bank account details are required.', 400));
    }

    // In production: call Razorpay Payouts API here
    // For now: log the request
    logger.info(`Withdrawal request: advocate=${req.user._id}, amount=${amount}`);

    res.json({
      success: true,
      message: 'Withdrawal request submitted. Amount will be credited within 2-3 business days.',
      data: {
        requestId: `WD${Date.now()}`,
        amount,
        status: 'pending',
        estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(),
      },
    });
  } catch (err) { next(err); }
});

// GET /api/wallet/monthly-stats — monthly earnings breakdown
router.get('/monthly-stats', protect, authorize('advocate'), async (req, res, next) => {
  try {
    const advocate = await Advocate.findOne({ user: req.user._id });
    if (!advocate) return next(new AppError('Advocate profile not found.', 404));

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const monthly = await Booking.aggregate([
      {
        $match: {
          advocate: advocate._id,
          'payment.status': 'paid',
          'payment.paidAt': { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$payment.paidAt' },
            month: { $month: '$payment.paidAt' },
          },
          total: { $sum: '$payment.amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const data = monthly.map((m) => ({
      month: MONTHS[m._id.month - 1],
      year: m._id.year,
      total: m.total,
      count: m.count,
    }));

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
