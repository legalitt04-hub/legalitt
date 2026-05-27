const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'adjourned', 'completed', 'dismissed'], default: 'scheduled' }
});

const caseNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  caseNumber: { type: String, trim: true },
  courtName: { type: String, trim: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  advocate: { type: mongoose.Schema.Types.ObjectId, ref: 'Advocate', required: true },
  status: {
    type: String,
    enum: ['active', 'completed', 'pending', 'dismissed'],
    default: 'active'
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  timeline: [timelineEventSchema],
  notes: [caseNoteSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

caseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Case', caseSchema);
