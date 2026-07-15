const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'El correo electrónico es requerido' }).email('Formato de correo electrónico no válido'),
    password: z.string({ required_error: 'La contraseña es requerida' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'El correo electrónico es requerido' }).email('Formato de correo electrónico no válido'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'El correo electrónico es requerido' }).email('Formato de correo electrónico no válido'),
    token: z.string({ required_error: 'El token de recuperación es requerido' }).min(6, 'El token no es válido'),
    password: z.string({ required_error: 'La nueva contraseña es requerida' }).min(6, 'La contraseña debe tener al menos 6 caracteres'),
  }),
});

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
