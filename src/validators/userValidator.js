const { z } = require('zod');

const createUserSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'El nombre es requerido' }).min(2, 'El nombre debe tener al menos 2 caracteres'),
    document: z.string({ required_error: 'El número de documento es requerido' }).min(5, 'El documento debe tener al menos 5 caracteres'),
    email: z.string({ required_error: 'El correo electrónico es requerido' }).email('Formato de correo electrónico no válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
    role: z.enum(['medico', 'autorizador', 'administrador'], { required_error: 'El rol es requerido' }),
    specialty: z.string().optional(),
    ips: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    role: z.enum(['medico', 'autorizador', 'administrador']).optional(),
    specialty: z.string().optional(),
    ips: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'La contraseña actual es requerida' }),
    newPassword: z.string({ required_error: 'La nueva contraseña es requerida' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
  }),
});

const adminResetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: 'La nueva contraseña es requerida' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
  }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  adminResetPasswordSchema,
};
