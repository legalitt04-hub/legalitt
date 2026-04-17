// routes/chats.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');
router.use(protect);
router.get('/', ctrl.getMyChats);
router.get('/:id/messages', ctrl.getMessages);
router.post('/:id/messages', ctrl.sendMessage);
module.exports = router;
