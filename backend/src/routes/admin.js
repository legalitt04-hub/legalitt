const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Booking = require('../models/Booking');

router.use(protect, authorize('admin'));

router.get('/stats', async (req, res, next) => {
  try {
    const [users, advocates, bookings, pendingAdvocates] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Advocate.countDocuments({ isVerified: true }),
      Booking.countDocuments(),
      Advocate.countDocuments({ verificationStatus: 'pending' }),
    ]);
    res.json({ success: true, data: { users, advocates, bookings, pendingAdvocates } });
  } catch (err) { next(err); }
});

router.get('/advocates/pending', async (req, res, next) => {
  try {
    const advocates = await Advocate.find({ verificationStatus: 'pending' })
      .populate('user', 'name email phone').lean();
    res.json({ success: true, data: advocates });
  } catch (err) { next(err); }
});

router.patch('/advocates/:id/verify', async (req, res, next) => {
  try {
    const { status } = req.body; // approved | rejected
    const advocate = await Advocate.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status, isVerified: status === 'approved' },
      { new: true }
    );
    res.json({ success: true, data: advocate });
  } catch (err) { next(err); }
});

router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit)).lean();
    const total = await User.countDocuments(filter);
    res.json({ success: true, data: users, pagination: { total } });
  } catch (err) { next(err); }
});

router.patch('/users/:id/toggle', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, data: { isActive: user.isActive } });
  } catch (err) { next(err); }
});

module.exports = router;
