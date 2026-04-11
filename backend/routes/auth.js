const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, googleAuth, sendOTP, verifyOTP, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.post('/google', [
  body('idToken').notEmpty().withMessage('Google idToken is required')
], googleAuth);

router.post('/otp-send', [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number')
], sendOTP);

router.post('/otp-verify', [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid mobile number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], verifyOTP);

router.get('/me', protect, getMe);

module.exports = router;
