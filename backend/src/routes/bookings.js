const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.post('/', authorize('client'), ctrl.createBooking);
router.post('/confirm-payment', authorize('client'), ctrl.confirmPayment);
router.get('/my', authorize('client'), ctrl.getMyBookings);
router.get('/advocate', authorize('advocate'), ctrl.getAdvocateBookings);
router.get('/:id', ctrl.getBooking);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
