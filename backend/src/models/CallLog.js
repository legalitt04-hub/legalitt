const mongoose = require('mongoose');

// Stores a record of every video/voice call between a client and advocate
const callLogSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    index: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  advocateUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  mode: {
    type: String,
    enum: ['video', 'voice'],
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'missed', 'rejected', 'failed'],
    default: 'completed',
  },
  duration: {
    type: Number,  // seconds
    default: 0,
  },
  startedAt: { type: Date },
  endedAt:   { type: Date },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  zegoRoomId: { type: String },
}, { timestamps: true });

callLogSchema.index({ createdAt: -1 });
callLogSchema.index({ client: 1, createdAt: -1 });
callLogSchema.index({ advocateUser: 1, createdAt: -1 });

module.exports = mongoose.model('CallLog', callLogSchema);
