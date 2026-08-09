// src/controllers/adminAdvocateController.js
// Admin: Pending advocate approvals, approve/reject, and withdrawal management

const Advocate = require('../models/Advocate');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const { sendWelcomeEmail } = require('../services/emailService');
const { createNotification } = require('../utils/notificationHelper');

// ─── GET /api/v1/admin/advocates?status=pending ──────────────────────────────
exports.getAdvocates = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter = {};
    if (status !== 'all') filter.verificationStatus = status;

    if (search) {
      const users = await User.find({
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
        ],
        role: 'advocate',
      }).select('_id').lean();
      filter.user = { $in: users.map(u => u._id) };
    }

    const [advocates, total] = await Promise.all([
      Advocate.find(filter)
        .populate('user', 'name email phone avatar createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Advocate.countDocuments(filter),
    ]);

    // Count by status for tabs
    const [pendingCount, underReviewCount, approvedCount] = await Promise.all([
      Advocate.countDocuments({ verificationStatus: 'pending' }),
      Advocate.countDocuments({ verificationStatus: 'under_review' }),
      Advocate.countDocuments({ verificationStatus: 'approved' }),
    ]);

    res.json({
      success: true,
      data: advocates,
      counts: { pending: pendingCount, under_review: underReviewCount, approved: approvedCount },
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/admin/advocates/:id ─────────────────────────────────────────
exports.getAdvocateDetail = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.params.id)
      .populate('user', 'name email phone avatar createdAt')
      .lean();
    if (!advocate) return next(new AppError('Advocate not found.', 404));
    res.json({ success: true, data: advocate });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/admin/advocates/:id/approve ───────────────────────────────
exports.approveAdvocate = async (req, res, next) => {
  try {
    const advocate = await Advocate.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!advocate) return next(new AppError('Advocate not found.', 404));

    advocate.verificationStatus = 'approved';
    advocate.isVerified = true;
    advocate.verificationRejectionReason = undefined;
    await advocate.save();

    // Update user record
    await User.findByIdAndUpdate(advocate.user._id, { isVerified: true });

    // Send email notification to advocate
    try {
      await sendWelcomeEmail({
        toEmail: advocate.user.email,
        userName: advocate.user.name,
        subject: 'Congratulations! Your Legalitt Account is Approved ✅',
        customMessage: `Your advocate profile has been verified and approved. You can now log in to the Legalitt app and start accepting consultations from clients.`,
      });
    } catch (emailErr) {
      logger.error('Failed to send approval email:', emailErr.message);
    }

    // In-app notification
    await createNotification({
      recipientId: advocate.user._id,
      title: '✅ Account Approved!',
      message: 'Your advocate profile has been verified. You can now accept consultations.',
      type: 'system',
    });

    logger.info(`Admin ${req.user.email} approved advocate ${advocate.user.email}`);

    res.json({
      success: true,
      message: `${advocate.user.name}'s account has been approved. They will receive an email notification.`,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/admin/advocates/:id/reject ────────────────────────────────
exports.rejectAdvocate = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return next(new AppError('Rejection reason is required.', 400));

    const advocate = await Advocate.findById(req.params.id)
      .populate('user', 'name email');
    if (!advocate) return next(new AppError('Advocate not found.', 404));

    advocate.verificationStatus = 'rejected';
    advocate.isVerified = false;
    advocate.verificationRejectionReason = reason;
    await advocate.save();

    // In-app notification
    await createNotification({
      recipientId: advocate.user._id,
      title: '❌ Application Update',
      message: `Your advocate application was not approved. Reason: ${reason}. Please contact support.`,
      type: 'system',
    });

    logger.info(`Admin ${req.user.email} rejected advocate ${advocate.user.email}: ${reason}`);

    res.json({ success: true, message: `${advocate.user.name}'s application has been rejected.` });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/admin/withdrawals ───────────────────────────────────────────
exports.getWithdrawals = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = status !== 'all' ? { status } : {};

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(filter)
        .populate({ path: 'advocateUser', select: 'name email phone' })
        .populate({ path: 'advocate', select: 'wallet barCouncilNumber' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Withdrawal.countDocuments(filter),
    ]);

    const pendingTotal = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      data: withdrawals,
      pendingTotal: pendingTotal[0]?.total || 0,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/admin/withdrawals/:id/process ─────────────────────────────
exports.processWithdrawal = async (req, res, next) => {
  try {
    const { action, transactionId, adminNote } = req.body; // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return next(new AppError('Action must be "approve" or "reject".', 400));
    }

    const withdrawal = await Withdrawal.findById(req.params.id)
      .populate('advocate')
      .populate('advocateUser', 'name email');

    if (!withdrawal) return next(new AppError('Withdrawal request not found.', 404));
    if (withdrawal.status !== 'pending') {
      return next(new AppError('This withdrawal has already been processed.', 400));
    }

    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    withdrawal.adminNote = adminNote;

    if (action === 'approve') {
      if (!transactionId) return next(new AppError('Transaction ID is required to approve.', 400));
      withdrawal.status = 'paid';
      withdrawal.transactionId = transactionId;

      // Update advocate wallet
      await Advocate.findByIdAndUpdate(withdrawal.advocate._id, {
        $inc: {
          'wallet.pendingWithdrawal': -withdrawal.amount,
          'wallet.totalWithdrawn':    withdrawal.amount,
        },
      });

      await createNotification({
        recipientId: withdrawal.advocateUser._id,
        title: '✅ Withdrawal Processed!',
        message: `₹${withdrawal.amount} has been transferred to your bank account. TXN: ${transactionId}`,
        type: 'payment',
      });
    } else {
      withdrawal.status = 'rejected';

      // Return amount to balance
      await Advocate.findByIdAndUpdate(withdrawal.advocate._id, {
        $inc: {
          'wallet.balance':           withdrawal.amount,
          'wallet.pendingWithdrawal': -withdrawal.amount,
        },
      });

      await createNotification({
        recipientId: withdrawal.advocateUser._id,
        title: '❌ Withdrawal Rejected',
        message: `Your withdrawal of ₹${withdrawal.amount} was rejected. Reason: ${adminNote || 'Contact support'}. Amount returned to wallet.`,
        type: 'payment',
      });
    }

    await withdrawal.save();
    logger.info(`Admin ${req.user.email} ${action}d withdrawal ${withdrawal._id} for ₹${withdrawal.amount}`);

    res.json({
      success: true,
      message: `Withdrawal ${action === 'approve' ? 'approved and marked as paid' : 'rejected and amount returned to wallet'}.`,
      data: withdrawal,
    });
  } catch (err) {
    next(err);
  }
};
