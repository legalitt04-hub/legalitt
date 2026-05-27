const mongoose = require('mongoose');

const firDraftSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['theft', 'assault', 'fraud', 'cyber_crime', 'property_dispute', 'domestic_violence', 'missing_person', 'other'],
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
