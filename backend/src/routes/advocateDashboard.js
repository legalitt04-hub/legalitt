const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { getDashboardStats } = require('../controllers/advocateDashboardController');

// Get all dashboard aggregated metrics and trends (Advocate only)
router.get('/stats', protect, authorize('advocate'), getDashboardStats);

module.exports = router;
