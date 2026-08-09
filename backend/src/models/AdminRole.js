// src/models/AdminRole.js
const mongoose = require('mongoose');

const PERMISSIONS = [
  'dashboard', 'users', 'advocates', 'cases', 'consultations',
  'ads', 'roles', 'earnings', 'withdrawals', 'settings',
  'support', 'reviews', 'reports', 'audit', 'notifications',
];

const adminRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: ['super_admin', 'admin', 'support_executive', 'accounts', 'forensic_expert', 'property_verification'],
  },
  displayName: { type: String, required: true },
  description: { type: String },
  permissions: [{
    type: String,
    enum: PERMISSIONS,
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('AdminRole', adminRoleSchema);

// ─── AdminAccount: tracks role-based admin users ──────────────────────────────
const adminAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  role: { type: String, enum: ['super_admin', 'admin', 'support_executive', 'accounts', 'forensic_expert', 'property_verification'], required: true },
  customPermissions: [{ type: String, enum: PERMISSIONS }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    success: { type: Boolean, default: true },
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

exports.AdminAccount = mongoose.model('AdminAccount', adminAccountSchema);
exports.AdminRole = mongoose.model('AdminRole', adminRoleSchema);
exports.PERMISSIONS = PERMISSIONS;
