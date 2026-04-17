const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  advocate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advocate',
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true, // One review per booking
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  isVerified: {
    type: Boolean,
    default: true, // Auto-verified since tied to a booking
  },
}, {
  timestamps: true,
});

reviewSchema.index({ advocate: 1 });
reviewSchema.index({ client: 1 });

// Update advocate's average rating after save
reviewSchema.post('save', async function () {
  const Advocate = mongoose.model('Advocate');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { advocate: this.advocate } },
    {
      $group: {
        _id: '$advocate',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Advocate.findByIdAndUpdate(this.advocate, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
