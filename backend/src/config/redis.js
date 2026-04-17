const { createClient } = require('redis');
const logger = require('../utils/logger');

let client = null;
let isConnected = false;

/**
 * Creates and returns a singleton Redis client.
 * Falls back gracefully if Redis is unavailable (dev without Redis).
 */
const getClient = async () => {
  if (client && isConnected) return client;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis: too many reconnect attempts, giving up');
          return new Error('Redis connection failed');
        }
        return Math.min(retries * 100, 3000);
      },
      connectTimeout: 5000,
    },
  });

  client.on('error', (err) => {
    isConnected = false;
    logger.error('Redis client error:', err.message);
  });

  client.on('connect', () => {
    isConnected = true;
    logger.info('Redis connected');
  });

  client.on('reconnecting', () => {
    logger.warn('Redis reconnecting...');
  });

  try {
    await client.connect();
  } catch (err) {
    logger.error('Redis connect failed — running without cache:', err.message);
    client = null;
    return null;
  }

  return client;
};

// ─── OTP Store (replaces in-memory Map) ──────────────────────────────────────

const OTP_PREFIX = 'otp:';
const OTP_TTL = 600; // 10 minutes

exports.setOTP = async (phone, otpData) => {
  const redis = await getClient();
  if (!redis) {
    // Fallback to memory
    global._otpFallback = global._otpFallback || new Map();
    global._otpFallback.set(phone, { ...otpData, expiresAt: Date.now() + OTP_TTL * 1000 });
    return;
  }
  await redis.setEx(`${OTP_PREFIX}${phone}`, OTP_TTL, JSON.stringify(otpData));
};

exports.getOTP = async (phone) => {
  const redis = await getClient();
  if (!redis) {
    const data = global._otpFallback?.get(phone);
    return data || null;
  }
  const raw = await redis.get(`${OTP_PREFIX}${phone}`);
  return raw ? JSON.parse(raw) : null;
};

exports.deleteOTP = async (phone) => {
  const redis = await getClient();
  if (!redis) {
    global._otpFallback?.delete(phone);
    return;
  }
  await redis.del(`${OTP_PREFIX}${phone}`);
};

// ─── Token Blacklist (logout + security) ─────────────────────────────────────

const BLACKLIST_PREFIX = 'blacklist:';

exports.blacklistToken = async (token, ttlSeconds) => {
  const redis = await getClient();
  if (!redis) return;
  await redis.setEx(`${BLACKLIST_PREFIX}${token}`, ttlSeconds, '1');
};

exports.isTokenBlacklisted = async (token) => {
  const redis = await getClient();
  if (!redis) return false;
  const exists = await redis.exists(`${BLACKLIST_PREFIX}${token}`);
  return exists === 1;
};

// ─── General Cache ────────────────────────────────────────────────────────────

exports.cache = {
  get: async (key) => {
    const redis = await getClient();
    if (!redis) return null;
    const val = await redis.get(`cache:${key}`);
    return val ? JSON.parse(val) : null;
  },
  set: async (key, value, ttlSeconds = 300) => {
    const redis = await getClient();
    if (!redis) return;
    await redis.setEx(`cache:${key}`, ttlSeconds, JSON.stringify(value));
  },
  del: async (key) => {
    const redis = await getClient();
    if (!redis) return;
    await redis.del(`cache:${key}`);
  },
};

// ─── Rate Limit Store ─────────────────────────────────────────────────────────
// Express-rate-limit compatible store backed by Redis

exports.RedisRateLimitStore = class {
  constructor(windowMs) {
    this.windowMs = windowMs;
    this.prefix = 'rl:';
  }

  async increment(key) {
    const redis = await getClient();
    if (!redis) return { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs) };

    const redisKey = `${this.prefix}${key}`;
    const current = await redis.incr(redisKey);
    if (current === 1) {
      await redis.pExpire(redisKey, this.windowMs);
    }
    const ttl = await redis.pTTL(redisKey);
    return {
      totalHits: current,
      resetTime: new Date(Date.now() + ttl),
    };
  }

  async decrement(key) {
    const redis = await getClient();
    if (!redis) return;
    await redis.decr(`${this.prefix}${key}`);
  }

  async resetKey(key) {
    const redis = await getClient();
    if (!redis) return;
    await redis.del(`${this.prefix}${key}`);
  }
};

exports.getClient = getClient;
