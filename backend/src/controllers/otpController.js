const otpService = require('../services/otp');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// POST /api/auth/send-otp
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return next(new AppError('Phone number is required.', 400));

    const result = await otpService.sendOTP(phone);
    if (!result.success) return next(new AppError(result.message || 'Failed to send OTP.', 500));

    const response = { success: true, message: 'OTP sent successfully.' };
    if (result.dev) response.otp = result.otp; // Expose in dev only

    res.json(response);
  } catch (err) { next(err); }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) return next(new AppError('Phone and OTP are required.', 400));

    const result = otpService.verifyOTP(phone, otp);
    if (!result.success) return next(new AppError(result.message, 400));

    // Find or create user by phone
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: name || `User${phone.slice(-4)}`,
        phone,
        isPhoneVerified: true,
        role: 'client',
      });
    } else {
      user.isPhoneVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    // Issue tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    res.json({
      success: true,
      data: { user: user.toSafeObject(), accessToken, refreshToken },
    });
  } catch (err) { next(err); }
};
