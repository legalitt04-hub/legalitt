const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/advocateController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');

router.get('/specializations', ctrl.getSpecializations);
router.get('/cities', ctrl.getCities);
router.get('/nearby', optionalAuth, ctrl.getNearby);
router.get('/me', protect, authorize('advocate'), ctrl.getMyProfile);
router.post('/profile', protect, ctrl.upsertProfile);
router.get('/', optionalAuth, ctrl.getAdvocates);
router.get('/:id', optionalAuth, ctrl.getAdvocate);

module.exports = router;
