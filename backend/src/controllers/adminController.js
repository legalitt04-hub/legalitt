const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Settings = require('../models/Settings');
const Case = require('../models/Case');

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalClients, totalAdvocates, pendingVerifications,
      totalBookings, completedBookings, revenueData,
      newUsersThisMonth, newUsersLastMonth, newBookingsThisMonth,
      pendingCases, completedCases, activeAdvocates,
      todaysAppointments, averageRatingData, monthlyRevenueData
    ] = await Promise.all([
      User.countDocuments({ role: 'client', isActive: true }),
      Advocate.countDocuments({ isVerified: true }),
      Advocate.countDocuments({ verificationStatus: 'pending' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.aggregate([{ $match: { 'payment.status': 'paid' } }, { $group: { _id: null, total: { $sum: '$payment.amount' } } }]),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
      
      // New Queries for the updated Dashboard
      Case.countDocuments({ status: 'pending' }),
      Case.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'advocate', isActive: true }),
      Booking.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday } }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ])
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueData[0]?.total || 0;
    const averageRating = averageRatingData[0]?.avg || 0;
    const userGrowth = newUsersLastMonth > 0
      ? (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1)
      : 100;

    res.json({
      success: true,
      data: {
        totalClients, totalAdvocates, pendingVerifications,
        totalBookings, completedBookings, totalRevenue,
        newUsersThisMonth, newBookingsThisMonth,
        userGrowth: parseFloat(userGrowth),
        completionRate: totalBookings > 0
          ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0,
        
        // New fields
        pendingCases,
        completedCases,
        activeAdvocates,
        pendingKYC: pendingVerifications, 
        todaysAppointments,
        monthlyRevenue,
        pendingWithdrawals: 0, 
        averageRating: parseFloat(averageRating.toFixed(1))
      },
    });
  } catch (err) { next(err); }
};

// ─── Revenue Analytics ────────────────────────────────────────────────────────
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();
    let groupBy, matchFrom;

    if (period === 'daily') {
      matchFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    } else if (period === 'weekly') {
      matchFrom = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
      groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
    } else if (period === 'yearly') {
      matchFrom = new Date(now.getFullYear() - 5, 0, 1);
      groupBy = { year: { $year: '$createdAt' } };
    } else {
      matchFrom = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    }

    const revenueByPeriod = await Booking.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: matchFrom } } },
      { $group: { _id: groupBy, revenue: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    res.json({ success: true, data: revenueByPeriod });
  } catch (err) { next(err); }
};

// ─── Activity Graph ───────────────────────────────────────────────────────────
exports.getActivityGraph = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [registrations, bookings] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]),
    ]);
    res.json({ success: true, data: { registrations, bookings } });
  } catch (err) { next(err); }
};

// ─── System Health ────────────────────────────────────────────────────────────
exports.getSystemHealth = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const uptime = process.uptime();
    const mem = process.memoryUsage();
    res.json({
      success: true,
      data: {
        database: { status: dbState[mongoose.connection.readyState], name: mongoose.connection.name },
        server: {
          uptime: Math.floor(uptime),
          uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
          nodeVersion: process.version,
          environment: process.env.NODE_ENV,
        },
        memory: {
          rss: Math.round(mem.rss / 1024 / 1024),
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) { next(err); }
};

// ─── Users List ───────────────────────────────────────────────────────────────
exports.getUsersList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'client',
          as: 'bookings'
        }
      },
      {
        $lookup: {
          from: 'cases',
          localField: '_id',
          foreignField: 'client',
          as: 'cases'
        }
      },
      {
        $addFields: {
          isActive: { $ifNull: ['$isActive', true] },
          totalBookings: { $size: '$bookings' },
          totalCases: { $size: '$cases' },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$bookings',
                    as: 'b',
                    cond: { $eq: ['$$b.payment.status', 'paid'] }
                  }
                },
                as: 'b',
                in: '$$b.payment.amount'
              }
            }
          },
          lastLogin: '$updatedAt'
        }
      },
      { $project: { password: 0, refreshTokens: 0, passwordResetToken: 0, bookings: 0, cases: 0 } }
    ]);
    
    const total = await User.countDocuments(filter);
    
    res.json({ success: true, data: users, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// ─── User Detail — includes booking history + spending ───────────────────────
exports.getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens -passwordResetToken')
      .populate('advocateProfile')
      .lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [recentBookings, bookingStats] = await Promise.all([
      Booking.find({ client: req.params.id })
        .sort({ createdAt: -1 }).limit(10)
        .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar' } })
        .lean(),
      Booking.aggregate([
        { $match: { client: user._id } },
        { $group: { _id: '$status', count: { $sum: 1 }, totalSpent: { $sum: '$payment.amount' } } },
      ]),
    ]);

    res.json({ success: true, data: { user, recentBookings, bookingStats } });
  } catch (err) { next(err); }
};

// ─── Ban / Activate User ──────────────────────────────────────────────────────
exports.toggleUserBan = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot ban admin users' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({
      success: true,
      data: { isActive: user.isActive, userId: user._id },
      message: user.isActive ? 'User reactivated' : `User banned${reason ? ': ' + reason : ''}`,
    });
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['client', 'advocate', 'support', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const oldRole = user.role;
    user.role = role;
    await user.save({ validateBeforeSave: false });

    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        user: req.user?._id || user._id,
        action: 'ROLE_CHANGE',
        targetModel: 'User',
        targetId: user._id.toString(),
        details: `Role for ${user.email} changed from '${oldRole}' to '${role}'`,
        ipAddress: req.ip || ''
      });
    } catch (e) {}

    res.json({ success: true, data: user, message: `User role updated to ${role}` });
  } catch (err) { next(err); }
};

// ─── Advocates Bulk Upload ───────────────────────────────────────────────────────────
const fs = require('fs');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');

exports.bulkUploadAdvocates = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV or Excel file' });
    }

    let results = [];
    const ext = req.file.originalname.split('.').pop().toLowerCase();

    try {
      if (ext === 'csv') {
        await new Promise((resolve, reject) => {
          fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', resolve)
            .on('error', reject);
        });
      } else if (ext === 'xls' || ext === 'xlsx') {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        results = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload CSV or Excel file.' });
      }
    } catch (parseErr) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Failed to parse file: ' + parseErr.message });
    }

    let successCount = 0;
    let skippedCount = 0;
    const errors = [];

        for (const row of results) {
          try {
            // Check if user or advocate already exists
            const existingUser = await User.findOne({ email: row.email });
            const existingAdvocate = await Advocate.findOne({ barCouncilNumber: row.barCouncilNumber });

            if (existingUser || existingAdvocate) {
              skippedCount++;
              errors.push(`Row skipped: Email ${row.email} or Bar Council ${row.barCouncilNumber} already exists.`);
              continue;
            }

            // Create User
            const user = await User.create({
              name: row.name,
              email: row.email,
              phone: row.phone || undefined,
              password: 'Legalitt@123',
              role: 'advocate',
              isActive: true,
              isEmailVerified: true
            });

            // Create Advocate Profile
            let specializations = [];
            if (row.specializations) {
               specializations = row.specializations.split(',').map(s => s.trim()).filter(s => s);
            }

            await Advocate.create({
              user: user._id,
              barCouncilNumber: row.barCouncilNumber,
              experience: parseInt(row.experience) || 0,
              consultationFee: parseInt(row.consultationFee) || 1000,
              specializations: specializations,
              location: {
                type: 'Point',
                coordinates: [72.8777, 19.0760], // default to mumbai
                address: { city: row.city || 'Mumbai' }
              },
              isVerified: true,
              verificationStatus: 'approved'
            });

            successCount++;
          } catch (err) {
            skippedCount++;
            errors.push(`Error processing ${row.email}: ${err.message}`);
          }
        }

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Bulk upload completed. Uploaded: ${successCount}, Skipped: ${skippedCount}`,
      data: { successCount, skippedCount, errors }
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(err);
  }
};

// ─── Advocates List ───────────────────────────────────────────────────────────
exports.getAdvocatesList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, verificationStatus, search } = req.query;
    const filter = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (search) {
      const matchingUsers = await User.find({
        $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }],
      }).select('_id').lean();
      filter.user = { $in: matchingUsers.map(u => u._id) };
    }
    const [advocatesRaw, total] = await Promise.all([
      Advocate.find(filter)
        .populate('user', 'name email phone avatar isActive createdAt')
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      Advocate.countDocuments(filter),
    ]);
    
    // Ensure older users without isActive field default to true
    const advocates = advocatesRaw.map(adv => {
      if (adv.user && adv.user.isActive === undefined) {
        adv.user.isActive = true;
      }
      return adv;
    });

    res.json({ success: true, data: advocates, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// ─── Advocate Detail — with earnings ─────────────────────────────────────────
exports.getAdvocateDetail = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.params.id)
      .populate('user', '-password -refreshTokens')
      .lean();
    if (!advocate) return res.status(404).json({ success: false, message: 'Advocate not found' });

    const [recentBookings, reviews, earnings] = await Promise.all([
      Booking.find({ advocate: req.params.id })
        .sort({ createdAt: -1 }).limit(10)
        .populate('client', 'name email avatar').lean(),
      Review.find({ advocate: req.params.id })
        .sort({ createdAt: -1 }).limit(5)
        .populate('client', 'name avatar').lean(),
      Booking.aggregate([
        { $match: { advocate: advocate._id, 'payment.status': 'paid' } },
        { $group: { _id: null, totalEarned: { $sum: '$payment.amount' }, totalPaidBookings: { $sum: 1 } } },
      ]),
    ]);

    const earningsData = earnings[0] || { totalEarned: 0, totalPaidBookings: 0 };

    res.json({ success: true, data: { advocate, recentBookings, reviews, earnings: earningsData } });
  } catch (err) { next(err); }
};

// ─── Verify Advocate ──────────────────────────────────────────────────────────
exports.verifyAdvocate = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const advocate = await Advocate.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status, isVerified: status === 'approved' },
      { new: true }
    ).populate('user', 'name email');
    if (!advocate) return res.status(404).json({ success: false, message: 'Advocate not found' });
    res.json({ success: true, data: advocate, message: `Advocate ${status}` });
  } catch (err) { next(err); }
};

// ─── Recent Registrations ─────────────────────────────────────────────────────
exports.getRecentRegistrations = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name email role avatar isActive createdAt')
      .sort({ createdAt: -1 }).limit(10).lean();
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// ─── Earnings Per Advocate (Admin) ────────────────────────────────────────────
exports.getAdvocateEarnings = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.params.id)
      .populate('user', 'name email avatar phone')
      .lean();
    if (!advocate) return res.status(404).json({ success: false, message: 'Advocate not found' });

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [summary, monthly, recentTransactions, statusBreakdown] = await Promise.all([
      // Overall summary
      Booking.aggregate([
        { $match: { advocate: advocate._id, 'payment.status': 'paid' } },
        { $group: {
          _id: null,
          totalEarned: { $sum: '$payment.amount' },
          totalPaidBookings: { $sum: 1 },
          avgAmount: { $avg: '$payment.amount' },
          minAmount: { $min: '$payment.amount' },
          maxAmount: { $max: '$payment.amount' },
        }},
      ]),
      // Monthly breakdown (use createdAt as fallback for paidAt)
      Booking.aggregate([
        {
          $match: {
            advocate: advocate._id,
            'payment.status': 'paid',
            $or: [
              { 'payment.paidAt': { $gte: twelveMonthsAgo } },
              { createdAt: { $gte: twelveMonthsAgo } },
            ],
          },
        },
        {
          $addFields: {
            effectiveDate: { $ifNull: ['$payment.paidAt', '$createdAt'] },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$effectiveDate' },
              month: { $month: '$effectiveDate' },
            },
            total: { $sum: '$payment.amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      // Recent paid transactions
      Booking.find({ advocate: advocate._id, 'payment.status': 'paid' })
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('client', 'name avatar email')
        .lean(),
      // Booking status breakdown for this advocate
      Booking.aggregate([
        { $match: { advocate: advocate._id } },
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$payment.amount' } } },
      ]),
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const summaryData = summary[0] || { totalEarned: 0, totalPaidBookings: 0, avgAmount: 0, minAmount: 0, maxAmount: 0 };

    res.json({
      success: true,
      data: {
        advocate,
        summary: {
          ...summaryData,
          avgAmount: Math.round(summaryData.avgAmount || 0),
        },
        monthly: monthly.map(m => ({
          month: MONTHS[m._id.month - 1],
          year: m._id.year,
          total: m.total,
          count: m.count,
          label: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
        })),
        recentTransactions,
        statusBreakdown,
      },
    });
  } catch (err) { next(err); }
};

// ─── Platform Earnings Summary ────────────────────────────────────────────
exports.getPlatformEarnings = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, thisMonth, topAdvocates] = await Promise.all([
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$payment.amount' }, count: { $sum: 1 } } },
      ]),
      // All advocates with real booking data
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: {
          _id: '$advocate',
          totalEarned:  { $sum: '$payment.amount' },
          bookingCount: { $sum: 1 },
          avgAmount:    { $avg: '$payment.amount' },
          maxAmount:    { $max: '$payment.amount' },
          minAmount:    { $min: '$payment.amount' },
          lastPaid:     { $max: '$createdAt' },
        }},
        // Sort: most recent activity first, then by total
        { $sort: { lastPaid: -1, totalEarned: -1 } },
        { $limit: 20 },
        { $lookup: { from: 'advocates', localField: '_id', foreignField: '_id', as: 'advocate' } },
        { $unwind: '$advocate' },
        { $lookup: { from: 'users', localField: 'advocate.user', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: {
          _id: 1,
          totalEarned: 1,
          bookingCount: 1,
          avgAmount:   { $round: ['$avgAmount', 0] },
          maxAmount: 1,
          minAmount: 1,
          lastPaid: 1,
          'user.name': 1,
          'user.email': 1,
          'user.avatar': 1,
          'user.phone': 1,
          'advocate._id': 1,
          'advocate.specializations': 1,
          'advocate.rating': 1,
          'advocate.consultationFee': 1,
          'advocate.totalConsultations': 1,
          'advocate.experience': 1,
          'advocate.verificationStatus': 1,
        }},
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue:      total[0]?.total || 0,
        totalBookings:     total[0]?.count || 0,
        thisMonthRevenue:  thisMonth[0]?.total || 0,
        thisMonthBookings: thisMonth[0]?.count || 0,
        avgBookingValue:   total[0]?.count > 0
          ? Math.round((total[0]?.total || 0) / total[0].count) : 0,
        topAdvocates,
      },
    });
  } catch (err) { next(err); }
};

// ─── System Logs ──────────────────────────────────────────────────────────────
exports.getSystemLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const [recentBookings, recentUsers, recentAdvocates] = await Promise.all([
      Booking.find().sort({ updatedAt: -1 }).limit(25)
        .populate('client', 'name')
        .populate({ path: 'advocate', populate: { path: 'user', select: 'name' } }).lean(),
      User.find().select('name email role createdAt isActive').sort({ createdAt: -1 }).limit(25).lean(),
      Advocate.find().select('verificationStatus createdAt updatedAt').sort({ updatedAt: -1 }).limit(10)
        .populate('user', 'name email').lean(),
    ]);

    const logs = [
      ...recentBookings.map(b => ({
        type: 'booking',
        action: `Booking ${b.status} — ${b.client?.name || 'Client'} with ${b.advocate?.user?.name || 'Advocate'}`,
        timestamp: b.updatedAt || b.createdAt,
        meta: { status: b.status, amount: b.payment?.amount },
      })),
      ...recentUsers.map(u => ({
        type: 'user',
        action: `New ${u.role} registered — ${u.name} (${u.email})`,
        timestamp: u.createdAt,
        meta: { role: u.role, isActive: u.isActive },
      })),
      ...recentAdvocates.map(a => ({
        type: 'verification',
        action: `Advocate verification ${a.verificationStatus} — ${a.user?.name || 'Unknown'}`,
        timestamp: a.updatedAt || a.createdAt,
        meta: { status: a.verificationStatus },
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(skip, skip + Number(limit));

    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};

// ─── Settings ─────────────────────────────────────────────────────────────────
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ singletonId: 'global' }).lean();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'commissionRate', 'minFee', 'maxAdvanceBookingDays',
      'features', 'maintenanceMode', 'announcement'
    ];
    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }
    
    let settings = await Settings.findOneAndUpdate(
      { singletonId: 'global' },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (err) { next(err); }
};

exports.getPublicSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ singletonId: 'global' })
      .select('maintenanceMode announcement features minFee maxAdvanceBookingDays commissionRate')
      .lean();
    if (!settings) {
      const s = await Settings.create({});
      settings = {
        maintenanceMode: s.maintenanceMode,
        announcement: s.announcement,
        features: s.features,
        minFee: s.minFee,
        maxAdvanceBookingDays: s.maxAdvanceBookingDays,
        commissionRate: s.commissionRate,
      };
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// ─── Enhanced User Management ─────────────────────────────────────────────────
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'client' } = req.body;
    if (!name || !email || !password) return next(new (require('../middlewares/errorHandler').AppError)('Name, email, password required.', 400));
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return next(new (require('../middlewares/errorHandler').AppError)('Email already registered.', 409));
    const user = await User.create({ name, email: email.toLowerCase(), phone, password, role, isVerified: true });
    res.status(201).json({ success: true, data: user.toSafeObject ? user.toSafeObject() : user });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone, email }, { new: true }).select('-password -refreshTokens');
    if (!user) return next(new (require('../middlewares/errorHandler').AppError)('User not found.', 404));
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new (require('../middlewares/errorHandler').AppError)('User not found.', 404));
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
};

exports.resetUserPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) return next(new (require('../middlewares/errorHandler').AppError)('Min 8 characters required.', 400));
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(req.params.id, { password: hashed });
    if (!user) return next(new (require('../middlewares/errorHandler').AppError)('User not found.', 404));
    res.json({ success: true, message: 'Password reset.' });
  } catch (err) { next(err); }
};

// ─── Enhanced Advocate Management ────────────────────────────────────────────
exports.createAdvocate = async (req, res, next) => {
  try {
    const { name, email, phone, password, barCouncilId, specializations, location } = req.body;
    if (!name || !email || !password) return next(new (require('../middlewares/errorHandler').AppError)('Name, email, password required.', 400));
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return next(new (require('../middlewares/errorHandler').AppError)('Email already registered.', 409));
    const user = await User.create({ name, email: email.toLowerCase(), phone, password, role: 'advocate', isVerified: true });
    const Advocate = require('../models/Advocate');
    const advocate = await Advocate.create({
      user: user._id, barCouncilId, specializations: specializations || [],
      location: location || {}, verificationStatus: 'approved', isVerified: true,
    });
    res.status(201).json({ success: true, data: { user: user._id, advocate: advocate._id } });
  } catch (err) { next(err); }
};

exports.updateAdvocate = async (req, res, next) => {
  try {
    const Advocate = require('../models/Advocate');
    const advocate = await Advocate.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'name email phone avatar');
    if (!advocate) return next(new (require('../middlewares/errorHandler').AppError)('Advocate not found.', 404));
    res.json({ success: true, data: advocate });
  } catch (err) { next(err); }
};

exports.deleteAdvocate = async (req, res, next) => {
  try {
    const Advocate = require('../models/Advocate');
    const advocate = await Advocate.findByIdAndDelete(req.params.id);
    if (!advocate) return next(new (require('../middlewares/errorHandler').AppError)('Advocate not found.', 404));
    res.json({ success: true, message: 'Advocate deleted.' });
  } catch (err) { next(err); }
};

exports.suspendAdvocate = async (req, res, next) => {
  try {
    const Advocate = require('../models/Advocate');
    const advocate = await Advocate.findById(req.params.id).populate('user');
    if (!advocate) return next(new (require('../middlewares/errorHandler').AppError)('Advocate not found.', 404));
    const newStatus = advocate.verificationStatus === 'suspended' ? 'approved' : 'suspended';
    advocate.verificationStatus = newStatus;
    advocate.isVerified = newStatus === 'approved';
    await advocate.save();
    await User.findByIdAndUpdate(advocate.user._id, { isActive: newStatus === 'approved' });
    res.json({ success: true, data: { verificationStatus: newStatus } });
  } catch (err) { next(err); }
};

// ─── Legal Requests (Legal Advice + Legal Notice) ────────────────────────────
exports.getLegalRequests = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const { status, serviceType, page = 1, limit = 20 } = req.query;

    const filter = {
      serviceType: { $in: ['legal_advice', 'legal_notice', 'property_research'] },
    };
    if (status) filter.status = status;
    if (serviceType && serviceType !== 'all') filter.serviceType = serviceType;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      Booking.find(filter)
        .populate('client', 'name email phone avatar')
        .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar' } })
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 4 ADMIN FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── User Internal Notes ──────────────────────────────────────────────────────
exports.getUserNotes = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('_id name email');
    if (!user) return next(new (require('../middlewares/errorHandler').AppError)('User not found.', 404));
    // Notes stored as embedded array in user doc via virtual — use separate query
    const notes = await require('../models/UserNote').find({ user: req.params.id }).populate('createdBy', 'name').sort('-createdAt');
    res.json({ success: true, data: notes });
  } catch (err) { next(err); }
};

exports.addUserNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note?.trim()) return next(new (require('../middlewares/errorHandler').AppError)('Note text is required.', 400));
    const UserNote = require('../models/UserNote');
    const created = await UserNote.create({ user: req.params.id, note: note.trim(), createdBy: req.user._id });
    await created.populate('createdBy', 'name');
    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
};

exports.deleteUserNote = async (req, res, next) => {
  try {
    const UserNote = require('../models/UserNote');
    await UserNote.findByIdAndDelete(req.params.noteId);
    res.json({ success: true, message: 'Note deleted.' });
  } catch (err) { next(err); }
};

// ─── Payment History ─────────────────────────────────────────────────────────
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const { userId, advocateId, page = 1, limit = 20, status } = req.query;
    const filter = { 'payment.status': { $in: ['paid', 'refunded', 'failed', 'pending'] } };
    if (status && status !== 'all') filter['payment.status'] = status;
    if (userId) filter.client = userId;
    if (advocateId) filter.advocate = advocateId;

    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total, summary] = await Promise.all([
      Booking.find(filter)
        .populate('client', 'name email phone avatar')
        .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar' } })
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(filter),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: {
          _id: null,
          totalCollected: { $sum: '$payment.amount' },
          totalBookings: { $sum: 1 },
          avgAmount: { $avg: '$payment.amount' },
        }},
      ]),
    ]);

    res.json({
      success: true,
      data: payments,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      summary: summary[0] || { totalCollected: 0, totalBookings: 0, avgAmount: 0 },
    });
  } catch (err) { next(err); }
};

// ─── Transaction History (full ledger) ───────────────────────────────────────
exports.getTransactionHistory = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const Advocate = require('../models/Advocate');
    const Withdrawal = require('../models/Withdrawal');
    const { userId, advocateId, type, page = 1, limit = 25, from, to } = req.query;

    // Build date filter
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    // 1. Paid bookings (client payments)
    const bookingFilter = { 'payment.status': 'paid' };
    if (userId) bookingFilter.client = userId;
    if (advocateId) bookingFilter.advocate = advocateId;
    if (from || to) bookingFilter['payment.paidAt'] = dateFilter;

    // 2. Withdrawals (advocate payouts)
    const withdrawalFilter = { status: { $in: ['completed', 'pending', 'processing'] } };
    if (advocateId) withdrawalFilter.advocate = advocateId;
    if (from || to) withdrawalFilter.createdAt = dateFilter;

    const [bookings, withdrawals, settingsDoc] = await Promise.all([
      (type === 'payout' ? Promise.resolve([]) : Booking.find(bookingFilter)
        .populate('client', 'name email avatar')
        .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar' } })
        .sort('-createdAt').limit(200).lean()),
      (type === 'payment' ? Promise.resolve([]) : Withdrawal.find(withdrawalFilter)
        .populate({ path: 'advocate', populate: { path: 'user', select: 'name avatar' } })
        .sort('-createdAt').limit(200).lean()),
      require('../models/Settings').findOne({ singletonId: 'global' }),
    ]);

    const commissionRate = settingsDoc?.commissionRate || 15;

    // Merge into unified ledger
    const transactions = [
      ...bookings.map(b => ({
        _id: b._id,
        type: 'payment',
        date: b.payment?.paidAt || b.createdAt,
        amount: b.payment?.amount || 0,
        commission: Math.round((b.payment?.amount || 0) * commissionRate / 100),
        advocateNet: Math.round((b.payment?.amount || 0) * (100 - commissionRate) / 100),
        status: b.payment?.status,
        client: b.client,
        advocate: b.advocate?.user || null,
        serviceType: b.serviceType,
        description: `Payment - ${b.serviceType?.replace(/_/g, ' ')}`,
        razorpayId: b.payment?.razorpayPaymentId,
      })),
      ...withdrawals.map(w => ({
        _id: w._id,
        type: 'payout',
        date: w.createdAt,
        amount: w.amount || 0,
        commission: 0,
        advocateNet: w.amount || 0,
        status: w.status,
        client: null,
        advocate: w.advocate?.user || null,
        serviceType: null,
        description: `Payout - ${w.method || 'Bank Transfer'}`,
        razorpayId: null,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const paginated = transactions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const totalPayments = bookings.reduce((s, b) => s + (b.payment?.amount || 0), 0);
    const totalPayouts = withdrawals.reduce((s, w) => s + (w.amount || 0), 0);
    const totalCommission = Math.round(totalPayments * commissionRate / 100);

    res.json({
      success: true,
      data: paginated,
      total: transactions.length,
      page: pageNum,
      pages: Math.ceil(transactions.length / limitNum),
      summary: { totalPayments, totalPayouts, totalCommission, commissionRate, netPlatformRevenue: totalCommission },
    });
  } catch (err) { next(err); }
};

// ─── Admin Upload Document for Client ────────────────────────────────────────
exports.uploadDocumentForClient = async (req, res, next) => {
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!req.file) return next(new (require('../middlewares/errorHandler').AppError)('No file uploaded.', 400));

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'legalitt/admin-uploads', resource_type: 'auto' },
        (err, res) => err ? reject(err) : resolve(res)
      );
      stream.end(req.file.buffer);
    });

    // If bookingId provided, attach doc to booking
    if (req.body.bookingId) {
      const Booking = require('../models/Booking');
      await Booking.findByIdAndUpdate(req.body.bookingId, {
        $push: { documents: { url: result.secure_url, name: req.file.originalname, type: req.file.mimetype?.includes('image') ? 'image' : 'pdf', uploadedAt: new Date() } }
      });
    }

    res.json({ success: true, data: { url: result.secure_url, name: req.file.originalname, size: req.file.size } });
  } catch (err) { next(err); }
};

// ─── Create Case + Register Client (Admin flow) ───────────────────────────────
exports.createCaseForClient = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const crypto = require('crypto');
    const {
      clientName, clientEmail, clientPhone, clientCity,
      issueDescription, serviceType, consultationMode, documents,
      advocateId, amount,
    } = req.body;

    if (!clientEmail || !issueDescription) {
      return next(new (require('../middlewares/errorHandler').AppError)('Client email and issue description are required.', 400));
    }

    // 1. Find or create client user
    let client = await User.findOne({ email: clientEmail.toLowerCase() });
    let isNewUser = false;
    let generatedPassword = null;

    if (!client) {
      isNewUser = true;
      generatedPassword = crypto.randomBytes(5).toString('hex'); // 10-char password
      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash(generatedPassword, 12);
      client = await User.create({
        name: clientName || clientEmail.split('@')[0],
        email: clientEmail.toLowerCase(),
        phone: clientPhone || undefined,
        password: hashed,
        role: 'client',
        isEmailVerified: true,
        address: { city: clientCity || '' },
      });
    }

    // 2. Create booking
    const booking = await Booking.create({
      client: client._id,
      advocate: advocateId || undefined,
      consultationMode: consultationMode || 'chat',
      serviceType: serviceType || 'legal_advice',
      type: 'chat',
      issue: issueDescription,
      documents: documents || [],
      payment: { amount: amount || 0, currency: 'INR', status: advocateId ? 'not_required' : 'pending' },
      status: advocateId ? 'confirmed' : 'pending_assignment',
      clientCity: clientCity || '',
      assignedBy: req.user._id,
      assignedAt: advocateId ? new Date() : undefined,
    });

    res.status(201).json({
      success: true,
      data: {
        booking,
        client: { _id: client._id, name: client.name, email: client.email },
        isNewUser,
        generatedPassword: isNewUser ? generatedPassword : null,
        message: isNewUser
          ? `New client registered. Share credentials: Email: ${client.email}, Password: ${generatedPassword}`
          : 'Booking created for existing client.',
      },
    });
  } catch (err) { next(err); }
};
