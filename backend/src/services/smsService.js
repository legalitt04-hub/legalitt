// src/services/smsService.js
// Production SMS OTP service using MSG91 (Indian numbers)
// Fallback: Email OTP if MSG91 is not configured

const axios = require('axios');

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'LGLTIT';

/**
 * Send OTP via MSG91 SMS
 * Phone format: 91XXXXXXXXXX (country code without +)
 */
const sendSMSOTP = async (phone, otp) => {
  if (!MSG91_AUTH_KEY) {
    console.warn('[SMSService] MSG91_AUTH_KEY not set — skipping SMS OTP send');
    return { success: false, reason: 'SMS not configured' };
  }

  // Normalize phone number (remove +, ensure 91 prefix for India)
  let normalizedPhone = phone.replace(/\D/g, '');
  if (normalizedPhone.startsWith('0')) normalizedPhone = '91' + normalizedPhone.slice(1);
  if (!normalizedPhone.startsWith('91')) normalizedPhone = '91' + normalizedPhone;

  try {
    // MSG91 Send OTP API
    const response = await axios.post(
      'https://control.msg91.com/api/v5/otp',
      {
        template_id: MSG91_TEMPLATE_ID,
        mobile: normalizedPhone,
        authkey: MSG91_AUTH_KEY,
        otp: otp,
        sender: MSG91_SENDER_ID,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );

    console.log(`[SMSService] OTP sent to ${normalizedPhone} | Response:`, response.data?.type);
    return { success: true, data: response.data };
  } catch (err) {
    console.error('[SMSService] Failed to send OTP:', err.response?.data || err.message);
    return { success: false, reason: err.message };
  }
};

/**
 * Verify OTP via MSG91 (optional - we also store+verify locally)
 */
const verifySMSOTP = async (phone, otp) => {
  if (!MSG91_AUTH_KEY) return { success: false };

  let normalizedPhone = phone.replace(/\D/g, '');
  if (!normalizedPhone.startsWith('91')) normalizedPhone = '91' + normalizedPhone;

  try {
    const response = await axios.get(
      `https://control.msg91.com/api/v5/otp/verify?mobile=${normalizedPhone}&otp=${otp}&authkey=${MSG91_AUTH_KEY}`,
      { timeout: 10000 }
    );

    const success = response.data?.type === 'success';
    return { success, data: response.data };
  } catch (err) {
    console.error('[SMSService] OTP verify error:', err.response?.data || err.message);
    return { success: false };
  }
};

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { sendSMSOTP, verifySMSOTP, generateOTP };
