const { Schema, model } = require('mongoose');

const ObservationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const RequestSchema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorSnapshot: {
      name: { type: String, required: true },
      document: { type: String, required: true },
      specialty: { type: String },
      ips: { type: String },
    },
    patient: {
      name: { type: String, required: true, trim: true },
      document: { type: String, required: true, trim: true },
      birthDate: { type: Date, required: true },
      gender: { type: String, enum: ['M', 'F', 'Otro'], required: true },
    },
    medicalInfo: {
      diagnosis: { type: String, required: true, trim: true },
      cie10Code: { type: String, required: true, trim: true },
      procedure: { type: String, required: true, trim: true },
      cupsCode: { type: String, required: true, trim: true },
      justification: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: ['pendiente', 'en_revision', 'aprobada', 'rechazada', 'informacion_adicional'],
      default: 'pendiente',
      required: true,
    },
    observations: {
      type: [ObservationSchema],
      default: [],
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

RequestSchema.index({ 'patient.document': 1 });
RequestSchema.index({ status: 1 });
RequestSchema.index({ doctor: 1 });

const Request = model('Request', RequestSchema);
module.exports = Request;
