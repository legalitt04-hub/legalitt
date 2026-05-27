/**
 * pushNotification.js
 * Sends push notifications via Expo Push API (the best option for React Native / Expo in India).
 * Uses native HTTP requests — no external SDK required on backend.
 * 
 * Expo Push Notification API: https://exp.host/--/api/v2/push/send
 * - Works globally, reliable in India
 * - Free up to 1M notifications/month
 * - Supports both Android (FCM) and iOS (APNs) via Expo's relay
 */

const axios = require('axios');
const logger = require('../utils/logger');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send a single push notification to a specific Expo push token.
 * @param {string} expoPushToken - The recipient's Expo push token (ExponentPushToken[...])
 * @param {string} title - Notification title
 * @param {string} body - Notification body/message
 * @param {object} data - Extra data payload (chatId, type, etc.)
 */
const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
    return; // Invalid or missing token — skip silently
  }

  try {
    await axios.post(EXPO_PUSH_URL, {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'chat-messages', // Android notification channel
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      }
    });
  } catch (err) {
    logger.warn(`Push notification failed for token ${expoPushToken}: ${err.message}`);
  }
};

/**
 * Send push notifications to multiple tokens (batch).
 * @param {Array<{token, title, body, data}>} notifications
 */
const sendBatchPushNotifications = async (notifications) => {
  const valid = notifications.filter(n => n.token?.startsWith('ExponentPushToken'));
  if (!valid.length) return;

  const messages = valid.map(n => ({
    to: n.token,
    sound: 'default',
    title: n.title,
    body: n.body,
    data: n.data || {},
    priority: 'high',
    channelId: 'chat-messages',
  }));

  try {
    await axios.post(EXPO_PUSH_URL, messages, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      }
    });
    logger.info(`Batch push sent: ${valid.length} notifications`);
  } catch (err) {
    logger.warn(`Batch push failed: ${err.message}`);
  }
};

module.exports = { sendPushNotification, sendBatchPushNotifications };
