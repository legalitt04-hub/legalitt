// src/services/emailService.js
// Production email service using Resend (resend.com)
// Free tier: 3,000 emails/month

const { Resend } = require('resend');

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const getFromEmail = () => process.env.FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Send Forgot Password reset email
 */
const sendPasswordResetEmail = async ({ toEmail, userName, resetToken, isOtp = false }) => {
  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const subject = isOtp ? 'Your Legalitt Password Reset OTP 🔐' : 'Reset Your Legalitt Password 🔐';

  // OTP-based email (for mobile app)
  const otpHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#14B8A6,#0D9488);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">⚖️ Legalitt</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Legal Services Platform</p>
        </div>
        <div style="padding:36px 32px;text-align:center;">
          <h2 style="color:#1F2937;font-size:22px;margin:0 0 12px;">Password Reset OTP</h2>
          <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Hi <strong>${userName || 'there'}</strong>,<br>
            Use the OTP below to reset your password. It expires in <strong>15 minutes</strong>.
          </p>
          <div style="background:#F0FDFA;border:2px dashed #14B8A6;border-radius:16px;padding:24px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#6B7280;font-size:13px;font-weight:600;letter-spacing:1px;">YOUR OTP CODE</p>
            <p style="margin:0;color:#0D9488;font-size:40px;font-weight:800;letter-spacing:12px;">${resetToken}</p>
          </div>
          <p style="color:#9CA3AF;font-size:13px;">If you didn't request this, ignore this email.</p>
        </div>
        <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #F3F4F6;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">© 2025 Legalitt. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResend();

    // Link-based HTML (admin panel / web)
    const linkHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#14B8A6,#0D9488);padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">⚖️ Legalitt</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Legal Services Platform</p>
          </div>
          <div style="padding:36px 32px;">
            <h2 style="color:#1F2937;font-size:22px;margin:0 0 12px;">Password Reset Request</h2>
            <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Hi <strong>${userName || 'there'}</strong>,<br>
              We received a request to reset your password. Click the button below to set a new password.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetURL}"
                 style="display:inline-block;background:linear-gradient(135deg,#14B8A6,#0D9488);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:16px;font-weight:600;letter-spacing:0.3px;">
                Reset My Password
              </a>
            </div>
            <p style="color:#9CA3AF;font-size:13px;text-align:center;">
              This link expires in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
            <p style="color:#D1D5DB;font-size:11px;text-align:center;">
              If the button doesn't work, copy this link:<br>
              <a href="${resetURL}" style="color:#14B8A6;word-break:break-all;font-size:11px;">${resetURL}</a>
            </p>
          </div>
          <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #F3F4F6;">
            <p style="color:#9CA3AF;font-size:12px;margin:0;">© 2025 Legalitt. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: toEmail,
      subject,
      html: isOtp ? otpHtml : linkHtml,
    });


    if (error) {
      console.error('[EmailService] Resend error:', error);
      throw new Error(error.message || 'Failed to send email');
    }

    console.log(`[EmailService] Password reset email sent to ${toEmail} | ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EmailService] Failed to send password reset email:', err.message);
    throw err;
  }
};

/**
 * Send Welcome email on registration
 */
const sendWelcomeEmail = async ({ toEmail, userName, subject: customSubject, customMessage }) => {
  try {
    const resend = getResend();
    const emailSubject = customSubject || 'Welcome to Legalitt! ⚖️';
    const bodyMessage = customMessage ||
      `Your account has been created successfully. You can now access legal services, find nearby advocates, and get expert legal guidance — all from one place.`;

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: toEmail,
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#14B8A6,#0D9488);padding:32px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">⚖️ Legalitt</h1>
            </div>
            <div style="padding:36px 32px;">
              <h2 style="color:#1F2937;font-size:22px;margin:0 0 12px;">Hi ${userName}!</h2>
              <p style="color:#6B7280;font-size:15px;line-height:1.6;">${bodyMessage}</p>
              ${!customMessage ? `
              <div style="background:#F0FDFA;border-radius:12px;padding:20px;margin:24px 0;">
                <p style="color:#0D9488;font-weight:600;margin:0 0 8px;">What you can do:</p>
                <ul style="color:#374151;font-size:14px;line-height:2;margin:0;padding-left:18px;">
                  <li>Find verified advocates near you</li>
                  <li>Get AI-powered legal advice</li>
                  <li>Book consultations (Chat, Voice, Video)</li>
                  <li>Generate legal notices & FIR drafts</li>
                </ul>
              </div>` : ''}
            </div>
            <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #F3F4F6;">
              <p style="color:#9CA3AF;font-size:12px;margin:0;">© 2025 Legalitt. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) console.error('[EmailService] Welcome email error:', error);
    console.log(`[EmailService] Email sent to ${toEmail}: ${emailSubject}`);
  } catch (err) {
    console.error('[EmailService] Failed to send email:', err.message);
  }
};


/**
 * Send Email OTP for phone-less verification
 */
const sendEmailOTP = async ({ toEmail, userName, otp }) => {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: toEmail,
      subject: `${otp} is your Legalitt verification code`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#14B8A6,#0D9488);padding:28px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">⚖️ Legalitt</h1>
            </div>
            <div style="padding:36px 32px;text-align:center;">
              <h2 style="color:#1F2937;font-size:20px;margin:0 0 8px;">Verification Code</h2>
              <p style="color:#6B7280;font-size:14px;margin:0 0 28px;">Hi ${userName || 'there'}, use this code to verify your account:</p>
              <div style="background:#F0FDFA;border:2px dashed #14B8A6;border-radius:16px;padding:24px;display:inline-block;">
                <span style="font-size:48px;font-weight:700;color:#0D9488;letter-spacing:12px;">${otp}</span>
              </div>
              <p style="color:#9CA3AF;font-size:13px;margin:24px 0 0;">Expires in <strong>10 minutes</strong>. Do not share this code.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) throw new Error(error.message);
    console.log(`[EmailService] OTP email sent to ${toEmail} | ID: ${data?.id}`);
    return { success: true };
  } catch (err) {
    console.error('[EmailService] Failed to send OTP email:', err.message);
    throw err;
  }
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendEmailOTP };
