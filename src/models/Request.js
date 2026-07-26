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
      name: { type: String, trim: true },
      document: { type: String, trim: true },
      birthDate: { type: Date },
      gender: { type: String, enum: ['M', 'F', 'Otro'] },
    },
    medicalInfo: {
      diagnosis: { type: String, trim: true },
      cie10Code: { type: String, trim: true },
      procedure: { type: String, trim: true },
      cupsCode: { type: String, trim: true },
      justification: { type: String, trim: true },
    },
    // New fields
    tipoDocumento: { type: String, required: true },
    documento: { type: String, required: true, trim: true },
    nombrePaciente: { type: String, required: true, trim: true },
    edad: { type: Number, required: true },
    programa: { type: String, required: true, trim: true },
    antiguedadMeses: { type: Number, required: true },
    procedimiento: { type: String, required: true, trim: true },
    costo: { type: Number, required: true, min: 0 },
    profesionalOrdenador: { type: String, required: true, trim: true },
    especialidad: { type: String, required: true, trim: true },
    ips: { type: String, required: true, trim: true },
    conceptoAuditoria: { type: String, required: true, trim: true },
    segundoConcepto: { type: String, required: true, trim: true },
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
