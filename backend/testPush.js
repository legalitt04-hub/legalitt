const mongoose = require('mongoose');
const User = require('./src/models/User');
const { sendPushNotification } = require('./src/utils/pushNotification');
require('dotenv').config({ path: './src/.env' });

async function testPush() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  // Find a user that has a push token
  const user = await User.findOne({ $or: [{ expoPushToken: { $exists: true, $ne: null } }, { fcmToken: { $exists: true, $ne: null } }] }).sort({ updatedAt: -1 });
  
  if (!user) {
    console.log('No user found with a push token.');
    process.exit(0);
  }
  
  const token = user.expoPushToken || user.fcmToken;
  console.log('Testing push to user:', user.name, 'Token:', token);
  
  try {
    await sendPushNotification(token, 'Test Notification', 'If you see this, push notifications are working perfectly! 🎉', { test: true });
    console.log('Notification sent successfully (check device)');
  } catch (err) {
    console.error('Error sending push:', err);
  }
  
  process.exit(0);
}

testPush();
