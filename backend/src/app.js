require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean     = require('xss-clean');
const compression  = require('compression');

const errorHandler        = require('./middlewares/errorHandler');
const notFound            = require('./middlewares/notFound');
const logger              = require('./utils/logger');

const authRoutes          = require('./routes/auth');
const advocateRoutes      = require('./routes/advocates');
const bookingRoutes       = require('./routes/bookings');
const chatRoutes          = require('./routes/chats');
const reviewRoutes        = require('./routes/reviews');
const paymentRoutes       = require('./routes/payments');
const aiRoutes            = require('./routes/ai');
const uploadRoutes        = require('./routes/uploads');
const adminRoutes         = require('./routes/admin');
const notificationRoutes  = require('./routes/notifications');
const walletRoutes        = require('./routes/wallet');

const app = express();

// Trust proxy — required when behind nginx / AWS ALB / Render
app.set('trust proxy', 1);

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:8081',
  'exp://localhost:8081',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Rate limiting
const mkLimiter = (max, windowMs = 15 * 60 * 1000) => rateLimit({
  windowMs, max,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/',      mkLimiter(parseInt(process.env.RATE_LIMIT_MAX) || 100));
app.use('/api/auth/', mkLimiter(20));
app.use('/api/ai/',   mkLimiter(10, 60 * 1000));

// Body parsing & sanitization
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xssClean());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (m) => logger.info(m.trim()) },
    skip: (req) => req.url === '/health',
  }));
}

// Health check
app.get('/health', (req, res) => res.json({
  success: true, message: 'Legalitt API is running',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
}));

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/advocates',     advocateRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/chats',         chatRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/uploads',       uploadRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet',        walletRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
