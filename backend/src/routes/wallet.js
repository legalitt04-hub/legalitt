// src/routes/wallet.js
// Advocate wallet: balance, withdrawal requests, bank details, earnings history

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const walletCtrl = require('../controllers/walletController');

// All wallet routes require advocate role
router.use(protect, authorize('advocate'));

// GET /api/v1/wallet                   — wallet balance + recent withdrawals + earning transactions
router.get('/', walletCtrl.getWallet);

// GET /api/v1/wallet/balance           — alias
router.get('/balance', walletCtrl.getWallet);

// GET /api/v1/wallet/earnings          — paginated per-booking earning transactions + monthly breakdown
router.get('/earnings', walletCtrl.getEarnings);

// PUT /api/v1/wallet/bank-details      — save bank/UPI details
router.put('/bank-details', walletCtrl.saveBankDetails);

// POST /api/v1/wallet/withdraw         — request withdrawal
router.post('/withdraw', walletCtrl.requestWithdrawal);

module.exports = router;
