const { z } = require('zod');

const createRequestSchema = z.object({
  body: z.object({
    tipoDocumento: z.string({ required_error: 'El tipo de documento es requerido' }),
    documento: z.string({ required_error: 'El documento es requerido' }).min(5),
    nombrePaciente: z.string({ required_error: 'El nombre del paciente es requerido' }).min(2),
    edad: z.number({ required_error: 'La edad es requerida' }).nonnegative(),
    programa: z.string({ required_error: 'El programa es requerido' }),
    antiguedadMeses: z.number({ required_error: 'La antigüedad en meses es requerida' }).nonnegative(),
    procedimiento: z.string({ required_error: 'El procedimiento es requerido' }).min(5),
    costo: z.number({ required_error: 'El costo es requerido' }).nonnegative(),
    profesionalOrdenador: z.string({ required_error: 'El profesional ordenador es requerido' }),
    especialidad: z.string({ required_error: 'La especialidad es requerida' }),
    ips: z.string({ required_error: 'La IPS es requerida' }),
    conceptoAuditoria: z.string({ required_error: 'El concepto de auditoría es requerido' }).min(5),
    segundoConcepto: z.string({ required_error: 'El segundo concepto es requerido' }).min(5),
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
