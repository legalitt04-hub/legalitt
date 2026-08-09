// src/services/zegoService.js
// ZEGOCLOUD Video/Voice/Chat Token Generation
// Docs: https://docs.zegocloud.com/article/15070
// Free tier: 10,000 participant-minutes/month

const crypto = require('crypto');
const logger = require('../utils/logger');

const ZEGO_APP_ID  = parseInt(process.env.ZEGO_APP_ID  || '0', 10);
const ZEGO_APP_SIGN = process.env.ZEGO_APP_SIGN || '';
const ZEGO_SERVER_SECRET = process.env.ZEGO_SERVER_SECRET || '';

/**
 * Generate ZEGOCLOUD Token04 (Server-side token for secure auth)
 * ZEGOCLOUD Token04 Algorithm:
 *   payload = JSON { app_id, user_id, nonce, ctime, expire, payload? }
 *   token = version + base64(iv + aes256cbc(payload, key=server_secret[0..15], iv=random))
 *
 * Reference: https://docs.zegocloud.com/article/15070
 */
const generateZegoToken = (userId, roomId, expirySeconds = 7200) => {
  if (!ZEGO_SERVER_SECRET || ZEGO_SERVER_SECRET.length < 32) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('[ZEGO] ZEGO_SERVER_SECRET not set. Returning dev token.');
      return `dev-token-${userId}-${Date.now()}`;
    }
    throw new Error('ZEGO_SERVER_SECRET must be 32 characters. Get it from ZEGOCLOUD console.');
  }

  const createTime = Math.floor(Date.now() / 1000);
  const expireTime = createTime + expirySeconds;
  const nonce = Math.floor(Math.random() * 2147483647);

  const payload = JSON.stringify({
    app_id:  ZEGO_APP_ID,
    user_id: String(userId),
    nonce,
    ctime:   createTime,
    expire:  expireTime,
    payload: `{"room_id":"${roomId}"}`,
  });

  try {
    // AES-128-CBC encryption with first 16 chars of server secret as key
    const key = Buffer.from(ZEGO_SERVER_SECRET.substring(0, 16), 'utf8');
    const iv  = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);

    // Final token: "04" prefix + base64(iv + encrypted)
    const token = '04' + Buffer.concat([iv, encrypted]).toString('base64');
    return token;
  } catch (err) {
    logger.error('[ZEGO] Token generation failed:', err.message);
    throw err;
  }
};

/**
 * Setup ZEGOCLOUD call credentials for a booking.
 * Returns roomID, userID tokens for both client and advocate.
 * Called when admin assigns an advocate.
 */
const setupZegoCall = ({ bookingId, clientId, advocateId }) => {
  if (!ZEGO_APP_ID) {
    logger.warn('[ZEGO] ZEGO_APP_ID not configured. Using dev placeholders.');
    return {
      success: true,
      dev: true,
      roomId: `legalitt-${bookingId}`,
      appId: ZEGO_APP_ID,
      clientToken:   `dev-client-token-${clientId}`,
      advocateToken: `dev-advocate-token-${advocateId}`,
    };
  }

  try {
    const roomId = `legalitt-${bookingId}`;

    const clientToken   = generateZegoToken(String(clientId),   roomId, 7200); // 2h
    const advocateToken = generateZegoToken(String(advocateId), roomId, 7200);

    logger.info(`[ZEGO] Tokens generated for room: ${roomId}`);
    return {
      success: true,
      roomId,
      appId: ZEGO_APP_ID,
      clientToken,
      advocateToken,
    };
  } catch (err) {
    logger.error('[ZEGO] setupZegoCall failed:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { setupZegoCall, generateZegoToken };
