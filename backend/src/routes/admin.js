const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { protect, authorize } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');
const adsController   = require('../controllers/adsController');
const roleController  = require('../controllers/roleController');

const os = require('os');
const upload = multer({ dest: os.tmpdir() });

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

// ─── Users Management ──────────────────────────────────────────────────
router.get('/users',                       adminController.getUsersList);
router.get('/users/:id',                   adminController.getUserDetail);
router.post('/users',                      adminController.createUser);
router.patch('/users/:id',                 adminController.updateUser);
router.delete('/users/:id',               adminController.deleteUser);
router.patch('/users/:id/toggle',          adminController.toggleUserBan);
router.patch('/users/:id/role',            adminController.updateUserRole);
router.post('/users/:id/reset-password',   adminController.resetUserPassword);

// ─── Advocates Management ────────────────────────────────────────────────
router.get('/advocates',                    adminController.getAdvocatesList);
router.post('/advocates',                   adminController.createAdvocate);
router.post('/advocates/bulk-upload',       upload.single('file'), adminController.bulkUploadAdvocates);
router.get('/advocates/:id',                adminController.getAdvocateDetail);
router.get('/advocates/:id/earnings',       adminController.getAdvocateEarnings);
router.patch('/advocates/:id',              adminController.updateAdvocate);
router.delete('/advocates/:id',            adminController.deleteAdvocate);
router.patch('/advocates/:id/verify',       adminController.verifyAdvocate);
router.patch('/advocates/:id/suspend',      adminController.suspendAdvocate);

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

// ─── Production 17-Module Routes ─────────────────────────────────────────────
router.get('/categories',             adminModuleController.getCategories);
router.post('/categories',            adminModuleController.createCategory);
router.put('/categories/:id',         adminModuleController.updateCategory);
router.delete('/categories/:id',      adminModuleController.deleteCategory);

router.get('/coupons',                adminModuleController.getCoupons);
router.post('/coupons',               adminModuleController.createCoupon);
router.delete('/coupons/:id',         adminModuleController.deleteCoupon);

router.get('/reviews',                adminModuleController.getReviews);
router.delete('/reviews/:id',         adminModuleController.deleteReview);

router.get('/audit-logs',             adminModuleController.getAuditLogs);
router.get('/admins',                 adminModuleController.getAdmins);

// ─── Booking Assignment (Legal Advice Flow) ───────────────────────────────────
const bookingAssignController = require('../controllers/bookingAssignController');
router.get('/bookings',                    bookingAssignController.getPendingBookings);
router.get('/bookings/:id',                bookingAssignController.getBookingDetail);
router.post('/bookings/:id/assign',        bookingAssignController.assignAdvocate);
router.get('/bookings/:id/nearby-advocates', bookingAssignController.getNearbyAdvocatesForBooking);
router.patch('/bookings/:id/status',       bookingAssignController.updateBookingStatus);

// ─── Advocate Approval & Rejection ────────────────────────────────────────────
const adminAdvocateController = require('../controllers/adminAdvocateController');
router.get('/pending-advocates',                adminAdvocateController.getAdvocates);
router.get('/pending-advocates/:id',            adminAdvocateController.getAdvocateDetail);
router.patch('/pending-advocates/:id/approve',  adminAdvocateController.approveAdvocate);
router.patch('/pending-advocates/:id/reject',   adminAdvocateController.rejectAdvocate);

// ─── Withdrawal Management ────────────────────────────────────────────────────
router.get('/withdrawals',                      adminAdvocateController.getWithdrawals);
router.patch('/withdrawals/:id/process',        adminAdvocateController.processWithdrawal);

// ─── Ads Management ───────────────────────────────────────────────────────────
router.get('/ads',                 adsController.getAds);
router.post('/ads',                adsController.createAd);
router.patch('/ads/:id',           adsController.updateAd);
router.delete('/ads/:id',          adsController.deleteAd);
router.patch('/ads/:id/toggle',    adsController.toggleAdStatus);
router.post('/ads/:id/record',     adsController.recordEvent);

// ─── Role-Based Access Management ────────────────────────────────────────────
router.get('/roles/permissions',           roleController.getRolePermissions);
router.get('/roles/accounts',              roleController.getAdminAccounts);
router.post('/roles/accounts',             roleController.createAdminAccount);
router.patch('/roles/accounts/:id',        roleController.updateAdminAccount);
router.delete('/roles/accounts/:id',       roleController.deleteAdminAccount);
router.post('/roles/accounts/:id/reset-password', roleController.resetAdminPassword);

module.exports = router;
