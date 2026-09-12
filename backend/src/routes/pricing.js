const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

// Public route for fetching prices
router.get('/', pricingController.getAllPrices);

module.exports = router;
