const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateToken } = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPSMS = async (phone, otp) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`OTP for ${phone}: ${otp}`);
    return true;
  }
  try {
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await twilio.messages.create({ body: `Your Legalitt OTP is: ${otp}. Valid for 10 minutes.`, from: process.env.TWILIO_PHONE_NUMBER, to: `+91${phone}` });
    return true;
  } catch (err) { return false; }
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });
    const user = await User.create({ name, email, password, isVerified: true });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Registration successful', token, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login successful', token, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.googleAuth = async (req, res) => {
  try {
    const { idToken, credential, access_token } = req.body;
    let payload;
    if (access_token) {
      const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + access_token } });
      payload = await r.json();
      if (!payload.sub) return res.status(401).json({ success: false, message: 'Invalid Google token.' });
    } else {
      const googleToken = idToken || credential;
      if (!googleToken) return res.status(400).json({ success: false, message: 'Google token required.' });
      try {
        const ticket = await client.verifyIdToken({ idToken: googleToken, audience: process.env.GOOGLE_CLIENT_ID });
        payload = ticket.getPayload();
      } catch (e) { return res.status(401).json({ success: false, message: 'Invalid Google token.' }); }
    }
    const { sub: googleId, email, name, picture } = payload;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) { user.googleId = googleId; user.avatar = user.avatar || picture; await user.save(); }
    } else {
      user = await User.create({ name, email, googleId, avatar: picture, isVerified: true });
    }
    const token = generateToken(user._id);
    res.json({ success: true, token, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
    const recentOTPs = await OTP.countDocuments({ phone, createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } });
    if (recentOTPs >= 3) return res.status(429).json({ success: false, message: 'Too many OTP requests.' });
    const otp = generateOTP();
    await OTP.findOneAndDelete({ phone });
    await OTP.create({ phone, otp });
    await sendOTPSMS(phone, otp);
    res.json({ success: true, message: 'OTP sent successfully.', ...(process.env.NODE_ENV !== 'production' && { otp }) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP required.' });
    const otpDoc = await OTP.findOne({ phone, verified: false });
    if (!otpDoc) return res.status(400).json({ success: false, message: 'OTP not found or expired.' });
    if (otpDoc.expiresAt < new Date()) { await OTP.deleteOne({ _id: otpDoc._id }); return res.status(400).json({ success: false, message: 'OTP expired.' }); }
    if (otpDoc.attempts >= 3) return res.status(400).json({ success: false, message: 'Max attempts exceeded.' });
    if (otpDoc.otp !== otp) { otpDoc.attempts += 1; await otpDoc.save(); return res.status(400).json({ success: false, message: 'Invalid OTP.' }); }
    otpDoc.verified = true;
    await otpDoc.save();
    let user = await User.findOne({ phone });
    if (!user) { user = await User.create({ name: name || `User ${phone.slice(-4)}`, phone, phoneVerified: true, isVerified: true }); }
    else { user.phoneVerified = true; await user.save(); }
    const token = generateToken(user._id);
    res.json({ success: true, message: 'OTP verified successfully.', token, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMe = async (req, res) => { res.json({ success: true, user: req.user }); };
