// src/routes/wallet.js
// Advocate wallet: balance, withdrawal requests, bank details

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const walletCtrl = require('../controllers/walletController');

// All wallet routes require advocate role
router.use(protect, authorize('advocate'));

// GET /api/v1/wallet                 — wallet balance + recent withdrawals
router.get('/', walletCtrl.getWallet);

// GET /api/v1/wallet/balance         — alias for EarningsScreen
router.get('/balance', walletCtrl.getWallet);

// GET /api/v1/wallet/transactions    — paginated transactions for AdvocateWalletScreen
router.get('/transactions', walletCtrl.getTransactions || walletCtrl.getWallet);

// GET /api/v1/wallet/monthly-stats   — monthly earnings chart data
router.get('/monthly-stats', walletCtrl.getMonthlyStats || walletCtrl.getWallet);

// GET /api/v1/wallet/bank-details    — get saved bank/UPI details
router.get('/bank-details', walletCtrl.getBankDetails || walletCtrl.getWallet);

// PUT /api/v1/wallet/bank-details    — save bank/UPI details
router.put('/bank-details', walletCtrl.saveBankDetails);

// POST /api/v1/wallet/withdraw       — request withdrawal
router.post('/withdraw', walletCtrl.requestWithdrawal);

module.exports = router;

