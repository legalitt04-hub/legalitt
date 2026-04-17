const mongoose = require('mongoose');

const advocateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  barCouncilNumber: {
    type: String,
    required: [true, 'Bar council number is required'],
    unique: true,
    trim: true,
  },
  specializations: [{
    type: String,
    enum: [
      'Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Corporate Law',
      'Labour Law', 'Constitutional Law', 'Tax Law', 'Consumer Law', 'Cyber Law',
      'Intellectual Property', 'Banking Law', 'Environmental Law', 'Human Rights',
    ],
  }],
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Fee cannot be negative'],
  },
  followUpFee: {
    type: Number,
    default: 0,
  },
  followUpDays: {
    type: Number,
    default: 7,
    comment: 'Days after first consultation for follow-up pricing',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      pincode: String,
    },
  },
  about: {
    type: String,
    maxlength: [1000, 'About cannot exceed 1000 characters'],
  },
  education: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  languages: [String],
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    slots: [{
      startTime: String, // HH:MM
      endTime: String,
      isBooked: { type: Boolean, default: false },
    }],
  }],
  documents: {
    barCouncilCertificate: String,
    degreeDocument: String,
    idProof: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  totalConsultations: {
    type: Number,
    default: 0,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Geospatial index for nearby search
advocateSchema.index({ location: '2dsphere' });
advocateSchema.index({ 'location.address.city': 1 });
advocateSchema.index({ specializations: 1 });
advocateSchema.index({ isVerified: 1, verificationStatus: 1 });
advocateSchema.index({ 'rating.average': -1 });
advocateSchema.index({ consultationFee: 1 });

module.exports = mongoose.model('Advocate', advocateSchema);
