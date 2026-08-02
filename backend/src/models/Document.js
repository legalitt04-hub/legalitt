const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  fileType: {
    type: String
  },
  sizeBytes: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  relatedCase: {
    type: mongoose.Schema.ObjectId,
    ref: 'Case'
  },
  category: {
    type: String,
    enum: ['identity', 'legal', 'evidence', 'invoice', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  isConfidential: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
