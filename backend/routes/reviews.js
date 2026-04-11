const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addReview);
router.get('/:advocateId', getReviews);

module.exports = router;
