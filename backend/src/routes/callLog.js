// src/routes/callLog.js
// Advocate & Client call history routes

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const callLogCtrl = require('../controllers/callLogController');

// All routes require auth (any role)
router.use(protect);

// POST /api/v1/calls/log       — save call record on hangup
router.post('/log', callLogCtrl.logCall);

// GET  /api/v1/calls/history   — your own call history
router.get('/history', callLogCtrl.getMyCallHistory);

module.exports = router;
