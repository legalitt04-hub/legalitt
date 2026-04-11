const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: { type: String, required: true },
  comment: { type: String, required: true, maxlength: 500 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

const advocateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    index: true
  },
  specialization: {
    type: String,
    required: true,
    enum: [
      'Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law',
      'Property Law', 'Labour Law', 'Constitutional Law', 'Tax Law',
      'Consumer Law', 'Cyber Law', 'Intellectual Property', 'Banking Law',
      'Other'
    ]
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [reviewSchema],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    },
    address: { type: String, default: '' },
    city: { type: String, default: '' }
  },
  experience: { type: String, default: '0 years' },
  enrollNo: { type: String, default: '' },
  enrollYear: { type: Number },
  mobile: { type: String, default: '' },
  email: { type: String, default: '', lowercase: true },
  image: {
    type: String,
    default: 'https://i.pravatar.cc/150?img=1'
  },
  available: { type: Boolean, default: true },
  fees: { type: Number, default: 1000 },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Geospatial index
advocateSchema.index({ location: '2dsphere' });
advocateSchema.index({ specialization: 1 });
advocateSchema.index({ rating: -1 });
advocateSchema.index({ name: 'text' });

// Update rating when reviews change
advocateSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.rating = Math.round((total / this.reviews.length) * 10) / 10;
};

module.exports = mongoose.model('Advocate', advocateSchema);
