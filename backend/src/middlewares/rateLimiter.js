const rateLimit = require('express-rate-limit');

// Rate limiter for AI Chat
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for FIR Generation (More strict as it uses more tokens)
const firRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 FIR generations per hour
  message: {
    success: false,
    message: 'You have reached the limit for FIR drafts. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter, firRateLimiter };
