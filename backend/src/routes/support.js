const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protect } = require('../middlewares/auth');

// Require authentication for all support routes
router.use(protect);

router.post('/', supportController.createSupportTicket);
router.get('/mine', supportController.getMyTickets);
router.post('/:id/reply', supportController.replyToTicket);

module.exports = router;
