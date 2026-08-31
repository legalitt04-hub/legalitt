const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { getDashboardStats, getAdvocateBookings } = require('../controllers/advocateDashboardController');

// Get all dashboard aggregated metrics and trends (Advocate only)
router.get('/stats',    protect, authorize('advocate'), getDashboardStats);
router.get('/bookings', protect, authorize('advocate'), getAdvocateBookings);  // All advocate's bookings
router.get('/cases',    protect, authorize('advocate'), getAdvocateBookings);  // alias

module.exports = router;

