const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Document', 'Consultation', 'Court Representation', 'Verification', 'Other'],
    default: 'Other'
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDays: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requirements: [{
    type: String
  }],
  category: {
    type: String,
    default: 'General'
  },
  totalRequests: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
