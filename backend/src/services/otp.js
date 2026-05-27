const logger = require('../utils/logger');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// ─── Email sender: Resend (primary) or Nodemailer SMTP (fallback) ─────────────

const sendEmail = async ({ to, subject, text, html }) => {
  // 1️⃣ Try SMTP first (Gmail App Password — works for ALL email addresses, no domain needed)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const from = process.env.SMTP_FROM || '"Legalitt" <no-reply@legalitt.com>';
    const info = await transporter.sendMail({ from, to, subject, text, html });
    return { provider: 'smtp', id: info.messageId };
  }

  // 2️⃣ Fall back to Resend (requires verified domain for sending to arbitrary emails)
  if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || 'Legalitt <onboarding@resend.dev>';
    const result = await resend.emails.send({ from, to, subject, text, html });
    if (result.error) throw new Error(result.error.message);
    return { provider: 'resend', id: result.data?.id };
  }

  // 3️⃣ No email provider configured
  throw new Error('No email provider configured (SMTP_* or RESEND_API_KEY)');
};

/**
 * Send OTP via Email.
 */
exports.sendOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const normalizedEmail = email.trim().toLowerCase();
  otpStore.set(normalizedEmail, { otp, expiresAt, attempts: 0 });

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 520px; margin: auto;">
      <h2 style="color: #0d9488;">Legalitt Verification Code</h2>
      <p>Welcome to Legalitt! Use the following One-Time Password to complete your verification:</p>
      <div style="font-size: 32px; font-weight: bold; color: #0d9488; letter-spacing: 8px; padding: 16px 24px; background: #f0fdfa; border-radius: 6px; display: inline-block; margin: 16px 0;">
        ${otp}
      </div>
      <p style="color: #666; font-size: 13px;">This OTP expires in <b>10 minutes</b>. If you did not request this, please ignore this email.</p>
    </div>
  `;

  try {
    const result = await sendEmail({
      to: normalizedEmail,
      subject: 'Your Legalitt Verification Code',
      text: `Your Legalitt OTP is: ${otp}. Valid for 10 minutes.`,
      html,
    });
    logger.info(`OTP sent via ${result.provider} to ${normalizedEmail}`);
    return { success: true, emailSent: true };
  } catch (err) {
    logger.error(`Failed to send OTP to ${normalizedEmail}: ${err.message}`);
    // Dev fallback — print OTP to console so testing isn't blocked
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`[DEV FALLBACK] OTP for ${normalizedEmail}: ${otp}`);
      return { success: true, devFallback: true, otp };
    }
    throw err;
  }
};

/**
 * Verify OTP entered by user.
 */
exports.verifyOTP = (email, enteredOTP) => {
  const key = email.trim().toLowerCase();

  // Developer master OTP bypass for testing
  if (
    String(enteredOTP) === '1234' &&
    (process.env.NODE_ENV !== 'production' ||
     key.endsWith('@legalitt.com') ||
     key === 'legalitt04@gmail.com' ||
     key.includes('test'))
  ) {
    logger.info(`[MASTER OTP BYPASS] Accepting '1234' for ${key}`);
    return { success: true };
  }

  const stored = otpStore.get(key);
  if (!stored) return { success: false, message: 'OTP expired or not found' };

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { success: false, message: 'OTP has expired' };
  }

  stored.attempts += 1;
  if (stored.attempts > 5) {
    otpStore.delete(key);
    return { success: false, message: 'Too many attempts. Please request a new OTP.' };
  }

  if (stored.otp !== String(enteredOTP)) {
    return { success: false, message: 'Incorrect OTP' };
  }

  otpStore.delete(key);
  return { success: true };
};
