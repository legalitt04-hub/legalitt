const mongoose = require('mongoose');

// Normalize type string → valid enum value
const VALID_TYPES = [
  'theft', 'assault', 'fraud', 'cyber_crime', 'property_dispute',
  'domestic_violence', 'missing_person', 'robbery', 'murder', 'kidnapping',
  'harassment', 'cheating', 'extortion', 'trespass', 'accident', 'other'
];

const normalizeType = (val) => {
  if (!val) return 'other';
  const lower = val.toLowerCase().replace(/\s+/g, '_');
  return VALID_TYPES.includes(lower) ? lower : 'other';
};

const firDraftSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: VALID_TYPES,
    set: normalizeType,  // Auto-normalize on save (handles "Theft" → "theft", "Robbery" → "robbery")
    default: 'other',
  },
  incident: {
    date: Date,
    time: String,
    location: String,
    description: {
      type: String,
      required: true
    }
  },
  complainant: {
    name: String,
    age: Number,
    address: String,
    contact: String
  },
  accused: [{
    name: String,
    address: String,
    description: String
  }],
  witnesses: [{
    name: String,
    contact: String
  }],
  evidence: [{
    name: String,
    url: String,
    type: String
  }],
  additionalInfo: String,
  aiDraft: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'finalized'],
    default: 'draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('FIRDraft', firDraftSchema);

