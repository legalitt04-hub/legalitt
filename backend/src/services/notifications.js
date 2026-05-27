const logger = require('../utils/logger');

// Firebase notifications disabled for local development
// Enable after adding correct Firebase Admin SDK credentials

exports.sendPushNotification = async (token, title, body, data = {}) => {
  logger.info(`[DEV] Push notification skipped: ${title} - ${body}`);
  return { success: true, dev: true };
};

exports.sendToMultiple = async (tokens, title, body, data = {}) => {
  logger.info(`[DEV] Multi push notification skipped: ${title}`);
  return { success: true, dev: true };
};

exports.subscribeToTopic = async (token, topic) => {
  logger.info(`[DEV] Topic subscription skipped: ${topic}`);
  return { success: true, dev: true };
};
