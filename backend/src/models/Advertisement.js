// src/models/Advertisement.js
const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },

  // Ad type
  adType: {
    type: String,
    enum: ['banner', 'popup', 'carousel', 'interstitial', 'native'],
    default: 'banner',
  },

  // Creative assets
  imageUrl: { type: String },
  images: [{ type: String }], // for carousel
  ctaText: { type: String, default: 'Learn More' },
  redirectUrl: { type: String },

  // Placement
  placement: {
    type: String,
    enum: ['home', 'dashboard', 'ai_pages', 'consultation_pages', 'document_pages', 'all'],
    default: 'home',
  },

  // Targeting
  targetUserType: {
    type: String,
    enum: ['all', 'client', 'advocate'],
    default: 'all',
  },
  targetCities: [{ type: String }],
  targetStates: [{ type: String }],
  targetServices: [{ type: String }],

  // Campaign scheduling
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  frequencyCap: { type: Number, default: 0 }, // 0 = unlimited, N = max N times per user/day

  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'scheduled', 'completed', 'draft'],
    default: 'draft',
  },

  // Analytics
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },

  // Meta
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: Number, default: 0 }, // Higher = shown first

}, { timestamps: true });

// Virtual CTR
advertisementSchema.virtual('ctr').get(function () {
  if (!this.impressions) return 0;
  return parseFloat(((this.clicks / this.impressions) * 100).toFixed(2));
});

advertisementSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Advertisement', advertisementSchema);
