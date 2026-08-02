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
router.patch('/users/:id/role',   adminController.updateUserRole);

// ─── Advocates Management ─────────────────────────────────────────────────────
router.get('/advocates',              adminController.getAdvocatesList);
router.get('/advocates/:id',          adminController.getAdvocateDetail);
router.get('/advocates/:id/earnings', adminController.getAdvocateEarnings);
router.patch('/advocates/:id/verify', adminController.verifyAdvocate);

// ─── Settings Management ────────────────────────────────────────────────────────
router.get('/settings',               adminController.getSettings);
router.put('/settings',               adminController.updateSettings);

// ─── New Modules (Phase 3 Integration) ────────────────────────────────────────
const adminModuleController = require('../controllers/adminModuleController');
router.get('/cases',                  adminModuleController.getCases);
router.put('/cases/:id',              adminModuleController.updateCase);
router.get('/services',               adminModuleController.getServices);
router.put('/services/:id',           adminModuleController.updateService);
router.get('/documents',              adminModuleController.getDocuments);
router.get('/support-tickets',        adminModuleController.getSupportTickets);
router.put('/support-tickets/:id',    adminModuleController.updateSupportTicket);
router.get('/ai-drafts',              adminModuleController.getAIDrafts);
router.get('/notifications/templates',adminModuleController.getNotificationTemplates);

module.exports = router;
