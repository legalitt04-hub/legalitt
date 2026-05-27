const mongoose = require('mongoose');

const advocateVerificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  barCouncilId: {
    type: String,
    required: true,
    unique: true
  },
  idCardImage: {
    type: String, // URL of the uploaded image
    required: true
  },
  certificateImage: {
    type: String, // URL of the bar council certificate
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin ID who verified
  }
});

module.exports = mongoose.model('AdvocateVerification', advocateVerificationSchema);
