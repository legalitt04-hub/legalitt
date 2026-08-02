const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  channel: {
    type: String,
    enum: ['push', 'email', 'sms', 'whatsapp'],
    required: true
  },
  triggerEvent: {
    type: String, // e.g. 'case_updated', 'payment_success', 'broadcast'
    required: true
  },
  titleTemplate: {
    type: String,
    required: true
  },
  bodyTemplate: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'clients', 'advocates', 'specific'],
    default: 'all'
  },
  variables: [{
    type: String // e.g. '{{userName}}', '{{caseId}}'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
