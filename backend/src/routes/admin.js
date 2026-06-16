const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/stats',                adminController.getDashboardStats);
router.get('/revenue',              adminController.getRevenueAnalytics);
router.get('/activity',             adminController.getActivityGraph);
router.get('/health',               adminController.getSystemHealth);
router.get('/recent-registrations', adminController.getRecentRegistrations);
router.get('/logs',                 adminController.getSystemLogs);

// ─── Platform Earnings ────────────────────────────────────────────────────────
router.get('/earnings',             adminController.getPlatformEarnings);

// ─── Users Management ─────────────────────────────────────────────────────────
router.get('/users',         adminController.getUsersList);
router.get('/users/:id',     adminController.getUserDetail);
router.patch('/users/:id/toggle', adminController.toggleUserBan);

// ─── Advocates Management ─────────────────────────────────────────────────────
router.get('/advocates',              adminController.getAdvocatesList);
router.get('/advocates/:id',          adminController.getAdvocateDetail);
router.get('/advocates/:id/earnings', adminController.getAdvocateEarnings);
router.patch('/advocates/:id/verify', adminController.verifyAdvocate);

// ─── Settings Management ────────────────────────────────────────────────────────
router.get('/settings',               adminController.getSettings);
router.put('/settings',               adminController.updateSettings);

module.exports = router;
