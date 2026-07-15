const rateLimit = require('express-rate-limit');

const standardLimiter = rateLimit.default({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiadas solicitudes desde esta dirección IP, por favor intente de nuevo más tarde.',
  },
});

const authLimiter = rateLimit.default({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15, // limit each IP to 15 authentication requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos de autenticación, por favor intente de nuevo en 5 minutos.',
  },
});

module.exports = {
  standardLimiter,
  authLimiter,
};
