const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.post('/', authorize('client', 'admin'), ctrl.createBooking);
router.post('/confirm-payment', authorize('client', 'admin'), ctrl.confirmPayment);
router.get('/my', authorize('client', 'admin'), ctrl.getMyBookings);
router.get('/advocate', authorize('advocate'), ctrl.getAdvocateBookings);
router.get('/:id', ctrl.getBooking);
// Only advocate / admin can accept/reject/complete — client can only cancel (enforced in controller)
router.patch('/:id/status', authorize('advocate', 'admin', 'client'), ctrl.updateStatus);

module.exports = router;
