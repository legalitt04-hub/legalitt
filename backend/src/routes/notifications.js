const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const Notification = require('../models/Notification');

// GET /api/notifications - Get all notifications for logged-in user
router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/read-all - Mark ALL notifications as read
// ⚠️  MUST be declared BEFORE /:id/read — otherwise Express matches "read-all" as :id
router.patch('/read-all', protect, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (err) { next(err); }
});

module.exports = router;
