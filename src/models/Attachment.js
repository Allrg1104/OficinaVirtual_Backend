const { Schema, model } = require('mongoose');

const AttachmentSchema = new Schema(
  {
    request: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['historia_clinica', 'examenes', 'formulas', 'otros'],
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Attachment = model('Attachment', AttachmentSchema);
module.exports = Attachment;
