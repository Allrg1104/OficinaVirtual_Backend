const { verifyAccessToken } = require('../utils/jwt');
const { logger } = require('../config/logger');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token de autenticación provisto' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    logger.warn(`Intento de acceso con token inválido o expirado: ${error}`);
    return res.status(401).json({ message: 'Token de acceso inválido o expirado' });
  }
};

module.exports = { authMiddleware };
