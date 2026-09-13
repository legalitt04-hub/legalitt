// src/controllers/advocateDashboardController.js
// Dashboard stats for advocate — uses real wallet.earningTransactions for earnings

const Booking  = require('../models/Booking');
const Advocate = require('../models/Advocate');
const { Chat, Message } = require('../models/Chat');
const Review   = require('../models/Review');

// ─── GET /api/v1/advocate-dashboard/stats ────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Resolve logged-in User → Advocate
    const advocate = await Advocate.findOne({ user: req.user._id }).populate('user');
    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate profile not found for this user account.'
      });
    }

    const advocateId = advocate._id;
    const userId     = req.user._id;

    // 2. Date boundaries
    const now          = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfWeek  = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 3. Today's Appointments (pending or today-confirmed)
    const todayAppointments = await Booking.find({
      advocate: advocateId,
      $or: [
        { date: { $gte: startOfToday, $lte: endOfToday }, status: 'confirmed' },
        { status: 'pending' }
      ]
    })
    .populate('client', 'name email avatar phone')
    .sort({ 'timeSlot.startTime': 1 })
    .lean();

    // 4. Pending unread messages
    const advocateChats   = await Chat.find({ participants: userId }).select('_id');
    const chatIds         = advocateChats.map(c => c._id);
    const pendingMessagesCount = await Message.countDocuments({
      chat:   { $in: chatIds },
      sender: { $ne: userId },
      readAt: { $exists: false }
    });

    // 5. Reviews & rating analytics
    const allAdvocateReviews = await Review.find({ advocate: advocateId })
      .populate('client', 'name avatar')
      .populate('booking', 'type issue')
      .sort({ createdAt: -1 })
      .lean();

    const totalReviewCount    = allAdvocateReviews.length;
    const ratingDistribution  = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum             = 0;
    let positiveReviewsCount  = 0;

    allAdvocateReviews.forEach(r => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1;
      ratingSum += (r.rating || 0);
      if (r.rating >= 4) positiveReviewsCount += 1;
    });

    const averageRating      = totalReviewCount > 0
      ? Math.round((ratingSum / totalReviewCount) * 10) / 10
      : (advocate.rating?.average || 0);
    const positivePercentage = totalReviewCount > 0
      ? Math.round((positiveReviewsCount / totalReviewCount) * 100)
      : 0;
    const recentReviews      = allAdvocateReviews.slice(0, 5);

    // 6. Earnings from active Bookings (confirmed/completed)
    const activeBookings = await Booking.find({
      advocate: advocateId,
      status: { $in: ['confirmed', 'completed'] }
    }).select('payment createdAt').lean();

    let dailyEarnings   = 0;
    let weeklyEarnings  = 0;
    let monthlyEarnings = 0;

    activeBookings.forEach(booking => {
      const bDate = new Date(booking.createdAt || booking.date);
      const net = booking.payment?.amount || 0;
      if (bDate >= startOfToday && bDate <= endOfToday) dailyEarnings   += net;
      if (bDate >= startOfWeek)                         weeklyEarnings  += net;
      if (bDate >= startOfMonth)                        monthlyEarnings += net;
    });

    // 7. Profile completion %
    let completion = 0;
    if (advocate.barCouncilNumber)                    completion += 20;
    if (advocate.experience)                          completion += 15;
    if (advocate.consultationFee > 0)                 completion += 15;
    if (advocate.about && advocate.about.length > 20) completion += 15;
    if (advocate.specializations?.length > 0)         completion += 15;
    if (advocate.user?.avatar)                        completion += 20;

    // 8. Last 7 days trend (from bookings)
    const last7Days     = [];
    const caseTrend     = [];
    const earningsTrend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dEnd   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayBookings = activeBookings.filter(b => {
        const td = new Date(b.createdAt || b.date);
        return td >= dStart && td <= dEnd;
      });
      caseTrend.push(dayBookings.length);
      earningsTrend.push(dayBookings.reduce((s, b) => s + (b.payment?.amount || 0), 0));
    }

    // 9. Last 6 months trend (from bookings)
    const last6Months          = [];
    const monthlyEarningsTrend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      last6Months.push(d.toLocaleDateString('en-US', { month: 'short' }));

      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthBookings = activeBookings.filter(b => {
        const td = new Date(b.createdAt || b.date);
        return td >= mStart && td <= mEnd;
      });
      monthlyEarningsTrend.push(monthBookings.reduce((s, b) => s + (b.payment?.amount || 0), 0));
    }

    res.status(200).json({
      success: true,
      data: {
        todayAppointments,
        pendingMessagesCount,
        recentReviews,
        ratingStats: {
          totalReviews: totalReviewCount,
          averageRating: Number(averageRating),
          positivePercentage,
          distribution: ratingDistribution,
        },
        // Real wallet data (net after platform commission)
        earningsSummary: {
          daily:             dailyEarnings,
          weekly:            weeklyEarnings,
          monthly:           monthlyEarnings,
          totalEarned:       advocate.wallet?.totalEarned       || 0,
          availableBalance:  advocate.wallet?.balance           || 0,
          totalWithdrawn:    advocate.wallet?.totalWithdrawn    || 0,
          pendingWithdrawal: advocate.wallet?.pendingWithdrawal || 0,
        },
        totalConsultations: advocate.totalConsultations || 0,
        profileCompletion: completion,
        analytics: {
          labels:               last7Days,
          caseTrend,
          earningsTrend,
          labelsMonthly:        last6Months,
          monthlyEarningsTrend,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate dashboard analytics.',
      error: error.message,
    });
  }
};

// ─── GET /api/v1/advocate-dashboard/bookings ─────────────────────────────────
exports.getAdvocateBookings = async (req, res) => {
  try {
    const advocate = await Advocate.findOne({ user: req.user._id });
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { advocate: advocate._id };
    if (status) filter.status = status;

    const skip     = (Number(page) - 1) * Number(limit);
    const bookings = await Booking.find(filter)
      .populate('client', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.', error: error.message });
  }
};
