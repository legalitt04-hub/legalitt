const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Public settings route for the mobile app
router.get('/', adminController.getPublicSettings);

module.exports = router;
