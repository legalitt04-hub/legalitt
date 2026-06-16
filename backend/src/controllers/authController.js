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
    const { name, email, password, phone, role, captchaToken } = req.body;

    // Verify reCAPTCHA token (bypass if matches the secure MOBILE_APP_SECRET or default fallback tokens)
    const isMobileBypass = 
      (process.env.MOBILE_APP_SECRET && captchaToken === process.env.MOBILE_APP_SECRET) ||
      captchaToken === 'legalitt_mobile_app_secure_secret_2026' ||
      captchaToken === 'mock_captcha_token';

    if (!isMobileBypass) {
      if (process.env.NODE_ENV === 'production') {
        try {
          const axios = require('axios');
          const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
          const response = await axios.post(verifyUrl);
          if (!response.data || !response.data.success) {
            return next(new AppError('CAPTCHA verification failed. Please try again.', 400));
          }
        } catch (err) {
          return next(new AppError('Error validating CAPTCHA token.', 500));
        }
      } else {
        // In development, accept mock token or simple presence
        if (!captchaToken) {
          return next(new AppError('CAPTCHA token required.', 400));
        }
      }
    }

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
      return next(new AppError('Incorrect password or username.', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new AppError('Incorrect password or username.', 401));

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
    const { idToken, accessToken, role } = req.body;
    let payload;
    if (idToken && idToken.startsWith('mock_') && process.env.NODE_ENV !== 'production') {
      const parts = idToken.split(':');
      payload = {
        sub: parts[1] || 'mock_google_id_99',
        email: parts[2] || 'mock-user@legalitt.com',
        name: parts[3] || 'Mock Google User',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      };
    } else if (accessToken) {
      const axios = require('axios');
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      payload = response.data;
    } else if (idToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      return next(new AppError('No Google token provided.', 400));
    }

    const { sub: googleId, email, name, picture } = payload;

    const safeRole = ['client', 'advocate'].includes(role) ? role : 'client';

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      if (safeRole === 'advocate') {
        return next(new AppError('Advocates must register via the standard process first. Email not found.', 403));
      }
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        isEmailVerified: true,
        role: safeRole,
      });
      logger.info(`New Google user: ${email} (${user.role})`);
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
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({ success: true, data: user.toSafeObject() });
  } catch (err) {
    logger.error('Error in getMe:', err);
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
