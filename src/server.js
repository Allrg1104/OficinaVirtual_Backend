const dotenv = require('dotenv');
dotenv.config();

const { logger } = require('./config/logger');

// DNS Setup
const dns = require('node:dns');
dns.setServers([
  process.env.DNS_PRIMARY || '8.8.8.8',
  process.env.DNS_SECONDARY || '8.8.4.4',
]);

const { connectDB, closeDB } = require('./config/db');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Conectar a la base de datos antes de cargar Express
    await connectDB();

    // Cargar la aplicación Express
    const app = require('./app');

    const server = app.listen(PORT, () => {
      logger.info(`=================================`);
      logger.info(` Servidor iniciado en puerto ${PORT} `);
      logger.info(` Entorno: ${process.env.NODE_ENV} `);
      logger.info(` Documentación: http://localhost:${PORT}/api-docs `);
      logger.info(`=================================`);
    });

    const shutdown = async () => {
      logger.info('Recibida señal de apagado, cerrando servidor...');
      server.close(async () => {
        logger.info('Servidor HTTP cerrado.');
        try {
          await closeDB();
        } catch (err) {
          logger.error('Error al cerrar la base de datos durante el apagado:', err);
        }
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
