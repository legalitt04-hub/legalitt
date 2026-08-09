// src/routes/legalAdvice.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const ctrl = require('../controllers/legalAdviceController');

// All routes require authentication
router.use(protect);

router.post('/request',          ctrl.createLegalRequest);
router.post('/confirm-payment',  ctrl.confirmLegalPayment);
router.get('/my-requests',       ctrl.getMyRequests);
router.get('/request/:id',       ctrl.getRequestDetail);

module.exports = router;
