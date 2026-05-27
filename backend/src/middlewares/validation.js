const { body, validationResult } = require('express-validator');

// Generic helper to compile and send validation errors
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  };
};

// Input Sanitization helper to strip dangerous tags (XSS Prevention)
const sanitizeInput = (val) => {
  if (typeof val !== 'string') return val;
  return val
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, '') // Strip script tags
    .replace(/on\w+="[^"]*"/gi, '')                     // Strip inline event handlers
    .replace(/javascript:[^\s]*/gi, '')                 // Strip javascript URIs
    .trim();
};

// Registration Validation Schema
exports.validateRegister = validate([
  body('name')
    .trim()
    .customSanitizer(sanitizeInput)
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits')
    .isNumeric().withMessage('Phone number must contain only numbers'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[#?!@$%^&*-]/).withMessage('Password must contain at least one special character (#?!@$%^&*-)'),

  body('role')
    .optional()
    .isIn(['client', 'advocate']).withMessage('Role must be either client or advocate'),
  
  body('captchaToken')
    .notEmpty().withMessage('CAPTCHA verification token is required'),
]);

// Login Validation Schema
exports.validateLogin = validate([
  body('email')
    .trim()
    .notEmpty().withMessage('Email or phone number is required'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
]);

// Booking Validation Schema
exports.validateBooking = validate([
  body('advocateId')
    .notEmpty().withMessage('Advocate ID is required')
    .isMongoId().withMessage('Invalid Advocate ID format'),
  
  body('date')
    .notEmpty().withMessage('Consultation date is required')
    .isISO8601().withMessage('Date must be in a valid ISO 8601 format'),
]);
