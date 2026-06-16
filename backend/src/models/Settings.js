const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Global singleton ID
  singletonId: {
    type: String,
    default: 'global',
    unique: true,
  },
  
  // Financial
  commissionRate: {
    type: Number,
    default: 15, // 15%
  },
  minFee: {
    type: Number,
    default: 200,
  },
  
  // Booking Rules
  maxAdvanceBookingDays: {
    type: Number,
    default: 30,
  },
  
  // Feature Flags
  features: {
    aiEnabled: { type: Boolean, default: true },
    pushEnabled: { type: Boolean, default: true },
    registrationsEnabled: { type: Boolean, default: true },
    googleEnabled: { type: Boolean, default: true },
  },
  
  // Maintenance Mode
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  
  // Announcement Banner
  announcement: {
    text: { type: String, default: '' },
    type: { type: String, enum: ['', 'info', 'warning', 'success'], default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
