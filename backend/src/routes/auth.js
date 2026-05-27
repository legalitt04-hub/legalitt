const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const otpCtrl = require('../controllers/otpController');
const { protect } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (#?!@$%^&*-)',
    }),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional(),
  role: Joi.string().valid('client', 'advocate').optional(),
  captchaToken: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().required(), // Relax email validation to allow mobile number logins if desired, but still validate Joi requirements
  password: Joi.string().required(),
});

// Standard auth
router.post('/register', validateBody(registerSchema), ctrl.register);
router.post('/login', validateBody(loginSchema), ctrl.login);
router.post('/google', ctrl.googleAuth);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', protect, ctrl.logout);
router.get('/me', protect, ctrl.getMe);
router.patch('/fcm-token', protect, ctrl.updateFCMToken);

// Phone OTP (Indian market — MSG91)
router.post('/send-otp', otpCtrl.sendOTP);
router.post('/verify-otp', otpCtrl.verifyOTP);

module.exports = router;
