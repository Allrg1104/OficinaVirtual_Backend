const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    request: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
    },
    read: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ recipient: 1, read: 1 });

const Notification = model('Notification', NotificationSchema);
module.exports = Notification;
