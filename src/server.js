const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { logger } = require('./config/logger');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`=================================`);
      logger.info(` Servidor iniciado en puerto ${PORT} `);
      logger.info(` Entorno: ${process.env.NODE_ENV} `);
      logger.info(` Documentación: http://localhost:${PORT}/api-docs `);
      logger.info(`=================================`);
    });

    const shutdown = () => {
      logger.info('Recibida señal de apagado, cerrando servidor...');
      server.close(() => {
        logger.info('Servidor HTTP cerrado.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Error crítico al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
