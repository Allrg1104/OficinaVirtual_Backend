const { z } = require('zod');

const createRequestSchema = z.object({
  body: z.object({
    patient: z.object({
      name: z.string({ required_error: 'El nombre del paciente es requerido' }).min(2),
      document: z.string({ required_error: 'El documento del paciente es requerido' }).min(5),
      birthDate: z.string({ required_error: 'La fecha de nacimiento del paciente es requerida' }),
      gender: z.enum(['M', 'F', 'Otro'], { required_error: 'El sexo del paciente es requerido' }),
    }, { required_error: 'Los datos del paciente son requeridos' }),
    medicalInfo: z.object({
      diagnosis: z.string({ required_error: 'El diagnóstico es requerido' }).min(5),
      cie10Code: z.string({ required_error: 'El código CIE10 es requerido' }).min(3),
      procedure: z.string({ required_error: 'El procedimiento es requerido' }).min(5),
      cupsCode: z.string({ required_error: 'El código CUPS es requerido' }).min(3),
      justification: z.string({ required_error: 'La justificación es requerida' }).min(10),
    }, { required_error: 'La información médica es requerida' }),
  }),
});

const updateRequestStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pendiente', 'en_revision', 'aprobada', 'rechazada', 'informacion_adicional'], {
      required_error: 'El nuevo estado es requerido',
    }),
    observation: z.string({ required_error: 'La observación es requerida' }).min(5, 'La observación debe tener al menos 5 caracteres'),
  }),
});

const addAttachmentsSchema = z.object({
  body: z.object({
    observation: z.string().optional(),
  }),
});

module.exports = {
  createRequestSchema,
  updateRequestStatusSchema,
  addAttachmentsSchema,
};
