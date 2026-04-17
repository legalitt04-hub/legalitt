const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
  },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  type: {
    type: String,
    enum: ['in_person', 'video', 'phone'],
    default: 'in_person',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show'],
    default: 'pending',
  },
  issue: {
    type: String,
    required: [true, 'Brief description of legal issue is required'],
    maxlength: [500, 'Issue description cannot exceed 500 characters'],
  },
  documents: [String], // Uploaded document URLs
  payment: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: Date,
  },
  isFollowUp: {
    type: Boolean,
    default: false,
  },
  parentBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  notes: String, // Advocate's private notes
  cancellationReason: String,
  cancelledBy: { type: String, enum: ['client', 'advocate', 'admin'] },
  meetingLink: String, // For video consultations
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
}, {
  timestamps: true,
});

bookingSchema.index({ client: 1, status: 1 });
bookingSchema.index({ advocate: 1, date: 1, status: 1 });
bookingSchema.index({ 'payment.razorpayOrderId': 1 }, { sparse: true });

module.exports = mongoose.model('Booking', bookingSchema);
