// src/routes/ads.js — Public route for mobile app to fetch active ads
const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');
const { optionalAuth } = require('../middlewares/auth');

// GET /api/v1/ads/active?placement=home
router.get('/active', optionalAuth, adsController.getActiveAds);

module.exports = router;
