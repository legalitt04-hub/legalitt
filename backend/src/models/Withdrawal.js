// src/models/Withdrawal.js
const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  advocate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advocate',
    required: true,
    index: true,
  },
  advocateUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [500, 'Minimum withdrawal is ₹500'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending',
    index: true,
  },
  bankDetails: {
    accountHolder: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode:      { type: String, required: true },
    bankName:      { type: String, required: true },
    upiId:         { type: String }, // optional UPI
  },
  adminNote: { type: String },
  processedAt: { type: Date },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  transactionId: { type: String }, // Bank/UPI transaction reference
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
