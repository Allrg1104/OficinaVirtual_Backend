const { logger } = require('../config/logger');

const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Ocurrió un error interno en el servidor';
  
  logger.error(`[Error Middleware] Status: ${status} | Message: ${message} | Route: ${req.method} ${req.url}`, {
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  return res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorMiddleware };
