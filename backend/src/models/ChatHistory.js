const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'model', 'assistant'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  title: {
    type: String,
    default: 'New Consultation',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Auto-update lastUpdated
chatHistorySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
