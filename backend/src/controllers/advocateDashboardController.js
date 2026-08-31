const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Advocate = require('../models/Advocate');
const { Chat, Message } = require('../models/Chat');
const Review = require('../models/Review');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Resolve logged-in User to Advocate
    const advocate = await Advocate.findOne({ user: req.user._id }).populate('user');
    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate profile not found for this user account.'
      });
    }

    const advocateId = advocate._id;
    const userId = req.user._id;

    // 2. Today's Date Range (timezone-safe boundaries)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Start of week (Sunday)
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 3. Query Today's Appointments (Pending/Confirmed)
    const todayAppointments = await Booking.find({
      advocate: advocateId,
      $or: [
        {
          date: { $gte: startOfToday, $lte: endOfToday },
          status: 'confirmed'
        },
        {
          status: 'pending'
        }
      ]
    })
    .populate('client', 'name email avatar phone')
    .sort({ 'timeSlot.startTime': 1 })
    .lean();

    // 4. Pending Message Count (Unread peer-to-peer chats)
    const advocateChats = await Chat.find({ participants: userId }).select('_id');
    const chatIds = advocateChats.map(c => c._id);

    const pendingMessagesCount = await Message.countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: userId },
      readAt: { $exists: false }
    });

    // 5. Recent Reviews & Aggregated Rating Analytics
    const allAdvocateReviews = await Review.find({ advocate: advocateId })
      .populate('client', 'name avatar')
      .populate('booking', 'type issue')
      .sort({ createdAt: -1 })
      .lean();

    const totalReviewCount = allAdvocateReviews.length;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;
    let positiveReviewsCount = 0;

    allAdvocateReviews.forEach(r => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1;
      ratingSum += (r.rating || 0);
      if (r.rating >= 4) {
        positiveReviewsCount += 1;
      }
    });

    const averageRating = totalReviewCount > 0 
      ? Math.round((ratingSum / totalReviewCount) * 10) / 10 
      : (advocate.rating?.average || 0);
    const positivePercentage = totalReviewCount > 0 
      ? Math.round((positiveReviewsCount / totalReviewCount) * 100) 
      : 0;

    const recentReviews = allAdvocateReviews.slice(0, 5);

    // 6. Calculate Earnings Summary
    const confirmedBookings = await Booking.find({
      advocate: advocateId,
      status: 'confirmed',
      'payment.status': 'paid'
    }).select('date payment.amount');

    let dailyEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;

    confirmedBookings.forEach(booking => {
      const bDate = new Date(booking.date);
      const amount = booking.payment?.amount || 0;

      if (bDate >= startOfToday && bDate <= endOfToday) {
        dailyEarnings += amount;
      }
      if (bDate >= startOfWeek) {
        weeklyEarnings += amount;
      }
      if (bDate >= startOfMonth) {
        monthlyEarnings += amount;
      }
    });

    // 7. Profile Completion Percentage
    let completion = 0;
    if (advocate.barCouncilNumber) completion += 20;
    if (advocate.experience) completion += 15;
    if (advocate.consultationFee > 0) completion += 15;
    if (advocate.about && advocate.about.length > 20) completion += 15;
    if (advocate.specializations && advocate.specializations.length > 0) completion += 15;
    if (advocate.user && advocate.user.avatar) completion += 20;

    // 8. Analytics Charts - Last 7 Days Case counts & Earnings
    const last7Days = [];
    const caseTrend = [];
    const earningsTrend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days.push(dayName);

      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayCases = confirmedBookings.filter(b => b.date >= dStart && b.date <= dEnd).length;
      const dayEarn = confirmedBookings
        .filter(b => b.date >= dStart && b.date <= dEnd)
        .reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

      caseTrend.push(dayCases);
      earningsTrend.push(dayEarn);
    }

    // 9. Analytics Charts - Last 6 Months Earnings
    const last6Months = [];
    const monthlyEarningsTrend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      // Set to 1st of month to avoid issues with different length months
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      last6Months.push(monthName);

      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthEarn = confirmedBookings
        .filter(b => b.date >= mStart && b.date <= mEnd)
        .reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

      monthlyEarningsTrend.push(monthEarn);
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
          distribution: ratingDistribution
        },
        earningsSummary: {
          daily: dailyEarnings,
          weekly: weeklyEarnings,
          monthly: monthlyEarnings
        },
        profileCompletion: completion,
        analytics: {
          labels: last7Days,
          caseTrend,
          earningsTrend,
          labelsMonthly: last6Months,
          monthlyEarningsTrend
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate dashboard analytics.',
      error: error.message
    });
  }
};

// ─── Advocate Bookings (all bookings for logged-in advocate) ──────────────────
exports.getAdvocateBookings = async (req, res) => {
  try {
    const advocate = await Advocate.findOne({ user: req.user._id });
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { advocate: advocate._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
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
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.', error: error.message });
  }
};

