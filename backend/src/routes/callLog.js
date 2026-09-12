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

// POST /api/v1/calls/:id/notes  — advocate adds consultation notes
router.post('/:id/notes', callLogCtrl.addCallNotes);

// POST /api/v1/calls/:id/report — report technical issue or dispute
router.post('/:id/report', callLogCtrl.reportCallIssue);

// POST /api/v1/calls/:id/events — append technical state timeline
router.post('/:id/events', callLogCtrl.logCallEvent);

module.exports = router;
