const express = require('express');
const router = express.Router();
const {
  getAdvocates,
  getNearbyAdvocates,
  getAdvocate,
  getSpecializations,
  getCities
} = require('../controllers/advocateController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getAdvocates);
router.get('/nearby', getNearbyAdvocates);
router.get('/specializations', getSpecializations);
router.get('/cities', getCities);
router.get('/:id', optionalAuth, getAdvocate);

module.exports = router;
