// services/notifications.js
let admin;
const getAdmin = () => {
  if (!admin && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      admin = require('firebase-admin');
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (!admin.apps.length) {
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      }
    } catch (e) { /* Firebase not configured */ }
  }
  return admin;
};

exports.send = async (fcmToken, { title, body, data = {} }) => {
  const fb = getAdmin();
  if (!fb || !fcmToken) return;
  try {
    await fb.messaging().send({ token: fcmToken, notification: { title, body }, data });
  } catch (e) { /* Silently skip push notification failures */ }
};
