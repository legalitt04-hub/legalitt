const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g. 'USER_BAN', 'ROLE_CHANGE', 'CASE_UPDATE', 'COUPON_CREATE'
  targetModel: { type: String, default: '' },
  targetId: { type: String, default: '' },
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
