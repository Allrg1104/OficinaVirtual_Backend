const { Schema, model } = require('mongoose');

const AuditLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
    },
    userRole: {
      type: String,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const AuditLog = model('AuditLog', AuditLogSchema);
module.exports = AuditLog;
