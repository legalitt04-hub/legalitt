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
    enum: [
      'completed', 'missed', 'rejected', 'failed', 'cancelled',
      'timeout', 'network_disconnected', 'user_ended', 'appointment_expired',
      'no_show', 'busy',
      'COMPLETED', 'REJECTED', 'MISSED', 'CANCELLED', 'TIMEOUT', 'FAILED',
      'NETWORK_DISCONNECTED', 'USER_ENDED', 'APPOINTMENT_EXPIRED', 'NO_SHOW', 'BUSY'
    ],
    default: 'completed',
  },
  endReason: {
    type: String,
    enum: [
      'USER_ENDED', 'REJECTED', 'MISSED', 'CANCELLED', 'TIMEOUT',
      'FAILED', 'NETWORK_DISCONNECTED', 'APPOINTMENT_EXPIRED', 'COMPLETED',
      'NO_SHOW', 'BUSY'
    ],
    default: 'COMPLETED',
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
  recordingConsent: { type: Boolean, default: false },

  // Technical Log Timeline for Admin Auditing & Dispute Resolution
  events: [{
    state: {
      type: String,
      enum: ['initiated', 'ringing', 'accepted', 'rejected', 'connected', 'reconnecting', 'ended', 'busy', 'no_show'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
  }],

  // Advocate Post-Consultation Notes
  postConsultationNotes: {
    summary: { type: String },
    nextSteps: { type: String },
    documentsRequired: [{ type: String }],
    addedAt: { type: Date },
  },

  // Issue & Dispute Reporting
  reportIssue: {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: String },
    description: { type: String },
    createdAt: { type: Date },
  },
}, { timestamps: true });

callLogSchema.index({ createdAt: -1 });
callLogSchema.index({ client: 1, createdAt: -1 });
callLogSchema.index({ advocateUser: 1, createdAt: -1 });

module.exports = mongoose.model('CallLog', callLogSchema);
