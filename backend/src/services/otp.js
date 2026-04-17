const logger = require('../utils/logger');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Send OTP via MSG91 (Indian SMS gateway).
 * Falls back to console log in development.
 */
exports.sendOTP = async (phone) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store OTP
  otpStore.set(phone, { otp, expiresAt, attempts: 0 });

  if (process.env.NODE_ENV !== 'production') {
    logger.info(`[DEV] OTP for ${phone}: ${otp}`);
    return { success: true, dev: true, otp }; // Return OTP in dev for testing
  }

  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      logger.warn('MSG91 not configured — OTP not sent');
      return { success: false, message: 'SMS service not configured' };
    }

    const response = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: authKey },
      body: JSON.stringify({
        template_id: templateId,
        mobile: phone.startsWith('+') ? phone.slice(1) : `91${phone}`,
        otp,
      }),
    });

    const result = await response.json();
    if (result.type !== 'success') throw new Error(result.message);

    return { success: true };
  } catch (err) {
    logger.error('MSG91 sendOTP error:', err.message);
    return { success: false, message: 'Failed to send OTP' };
  }
};

/**
 * Verify OTP entered by user.
 */
exports.verifyOTP = (phone, enteredOTP) => {
  const stored = otpStore.get(phone);
  if (!stored) return { success: false, message: 'OTP expired or not found' };

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return { success: false, message: 'OTP has expired' };
  }

  stored.attempts += 1;
  if (stored.attempts > 5) {
    otpStore.delete(phone);
    return { success: false, message: 'Too many attempts. Please request a new OTP.' };
  }

  if (stored.otp !== String(enteredOTP)) {
    return { success: false, message: 'Incorrect OTP' };
  }

  otpStore.delete(phone);
  return { success: true };
};
