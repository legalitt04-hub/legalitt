// src/controllers/walletController.js
// Handles: advocate wallet, withdrawal requests, commission crediting

const Advocate = require('../models/Advocate');
const Withdrawal = require('../models/Withdrawal');
const Settings = require('../models/Settings');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

// ─── GET /api/v1/advocate/wallet ──────────────────────────────────────────────
exports.getWallet = async (req, res, next) => {
  try {
    const advocate = await Advocate.findOne({ user: req.user._id })
      .select('wallet bankDetails totalConsultations')
      .lean();
    if (!advocate) return next(new AppError('Advocate profile not found.', 404));

    const recentWithdrawals = await Withdrawal.find({ advocateUser: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        wallet: advocate.wallet || { balance: 0, totalEarned: 0, pendingWithdrawal: 0, totalWithdrawn: 0 },
        bankDetails: advocate.bankDetails || null,
        totalConsultations: advocate.totalConsultations || 0,
        recentWithdrawals,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/v1/advocate/bank-details ────────────────────────────────────────
exports.saveBankDetails = async (req, res, next) => {
  try {
    const { accountHolder, accountNumber, ifscCode, bankName, upiId } = req.body;
    if (!accountHolder || !accountNumber || !ifscCode || !bankName) {
      return next(new AppError('Account holder name, account number, IFSC, and bank name are required.', 400));
    }

    await Advocate.findOneAndUpdate(
      { user: req.user._id },
      { bankDetails: { accountHolder, accountNumber, ifscCode, bankName, upiId } }
    );

    res.json({ success: true, message: 'Bank details saved successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/advocate/request-withdrawal ─────────────────────────────────
exports.requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, bankDetails } = req.body;
    if (!amount || amount < 500) return next(new AppError('Minimum withdrawal amount is ₹500.', 400));

    const advocate = await Advocate.findOne({ user: req.user._id });
    if (!advocate) return next(new AppError('Advocate profile not found.', 404));

    const availableBalance = advocate.wallet?.balance || 0;
    if (amount > availableBalance) {
      return next(new AppError(`Insufficient balance. Available: ₹${availableBalance}.`, 400));
    }

    // Use saved bank details or ones provided in request
    const details = bankDetails || advocate.bankDetails;
    if (!details?.accountNumber || !details?.ifscCode) {
      return next(new AppError('Bank details are required for withdrawal. Please save them in your profile first.', 400));
    }

    // Check for pending withdrawal
    const pendingExists = await Withdrawal.findOne({ advocateUser: req.user._id, status: 'pending' });
    if (pendingExists) {
      return next(new AppError('You already have a pending withdrawal request. Please wait for it to be processed.', 400));
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      advocate: advocate._id,
      advocateUser: req.user._id,
      amount,
      bankDetails: details,
    });

    // Hold amount (deduct from balance, add to pending)
    advocate.wallet.balance -= amount;
    advocate.wallet.pendingWithdrawal = (advocate.wallet.pendingWithdrawal || 0) + amount;
    await advocate.save();

    logger.info(`Withdrawal request ₹${amount} by advocate ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: `Withdrawal request of ₹${amount} submitted. Admin will process it within 2-3 business days.`,
      data: withdrawal,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Utility: Credit advocate wallet after payment ────────────────────────────
// Called internally by payment confirmation
exports.creditAdvocateWallet = async ({ advocateId, bookingAmount, bookingId }) => {
  try {
    // Get commission rate from settings
    const settings = await Settings.findOne();
    const commissionRate = settings?.commissionRate || 20; // default 20%
    const platformFee = Math.round(bookingAmount * (commissionRate / 100));
    const advocateEarning = bookingAmount - platformFee;

    await Advocate.findByIdAndUpdate(advocateId, {
      $inc: {
        'wallet.balance':     advocateEarning,
        'wallet.totalEarned': advocateEarning,
        totalConsultations: 1,
      },
    });

    logger.info(`[Wallet] Advocate ${advocateId} credited ₹${advocateEarning} (${100 - commissionRate}% of ₹${bookingAmount}) for booking ${bookingId}`);
    return { advocateEarning, platformFee };
  } catch (err) {
    logger.error('[Wallet] Failed to credit advocate wallet:', err.message);
    return null;
  }
};
