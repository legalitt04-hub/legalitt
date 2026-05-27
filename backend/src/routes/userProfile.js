const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middlewares/auth');
const { uploadAvatar } = require('../services/cloudinaryService');

router.use(protect);

router.get('/me', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.post('/avatar', uploadAvatar.single('avatar'), profileController.updateAvatar);
router.get('/profile/completeness', profileController.getCompleteness);
router.post('/saved-advocates', profileController.toggleSavedAdvocate);
router.get('/saved-advocates', profileController.getSavedAdvocates);

// Register Expo push token
router.post('/push-token', async (req, res, next) => {
  try {
    const { expoPushToken } = req.body;
    if (!expoPushToken) return res.status(400).json({ success: false, message: 'Token required' });
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, { expoPushToken });
    res.json({ success: true, message: 'Push token registered' });
  } catch (err) { next(err); }
});

// GDPR: Account & data deletion
router.delete('/me', profileController.deleteAccount);

module.exports = router;
