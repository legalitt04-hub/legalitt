const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Token Helpers ────────────────────────────────────────────────────────────
const signAccessToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

const sendTokens = async (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  // Store hashed refresh token in DB (rotation)
  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
    lastSeen: new Date(),
  });

  res.status(statusCode).json({
    success: true,
    data: {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    },
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Prevent privilege escalation
    const safeRole = ['client', 'advocate'].includes(role) ? role : 'client';

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return next(new AppError('Email already registered.', 400));

    const user = await User.create({ name, email, password, phone, role: safeRole });
    logger.info(`New user registered: ${user.email} (${user.role})`);

    await sendTokens(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      return next(new AppError('Invalid credentials.', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new AppError('Invalid credentials.', 401));

    if (!user.isActive) return next(new AppError('Account deactivated.', 403));

    logger.info(`User logged in: ${user.email}`);
    await sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────
exports.googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return next(new AppError('Google ID token is required.', 400));

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        isEmailVerified: true,
        role: 'client',
      });
      logger.info(`New Google user: ${email}`);
    } else if (!user.googleId) {
      // Link Google to existing email account
      user.googleId = googleId;
      user.avatar = user.avatar || picture;
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    if (!user.isActive) return next(new AppError('Account deactivated.', 403));

    await sendTokens(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new AppError('Refresh token required.', 401));

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return next(new AppError('Invalid refresh token.', 401));
    }

    // Rotate: remove old, issue new
    await User.findByIdAndUpdate(decoded.id, {
      $pull: { refreshTokens: refreshToken },
    });

    const newAccessToken = signAccessToken(user._id, user.role);
    const newRefreshToken = signRefreshToken(user._id);

    await User.findByIdAndUpdate(decoded.id, {
      $push: { refreshTokens: newRefreshToken },
    });

    res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(new AppError('Invalid or expired refresh token.', 401));
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('advocateProfile');
    res.json({ success: true, data: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// ─── Update FCM Token ─────────────────────────────────────────────────────────
exports.updateFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.json({ success: true, message: 'FCM token updated.' });
  } catch (err) {
    next(err);
  }
};
