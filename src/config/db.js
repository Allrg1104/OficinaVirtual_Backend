const mongoose = require('mongoose');
const dns = require('node:dns');
const { logger } = require('./logger');

let mongoMemoryServer = null;
let isMemoryDb = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    logger.error('Error: MONGODB_URI no está configurada en las variables de entorno.');
    process.exit(1);
  }

  // Configurar listeners de eventos. Limpiar listeners previos para evitar duplicados.
  mongoose.connection.removeAllListeners('connected');
  mongoose.connection.removeAllListeners('error');
  mongoose.connection.removeAllListeners('disconnected');

  mongoose.connection.on('connected', () => {
    if (isMemoryDb) {
      logger.info('MongoMemoryServer conectado exitosamente.');
    } else {
      logger.info('MongoDB Atlas conectado exitosamente.');
    }
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`Error en la conexión de MongoDB: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB desconectado.');
  });

  // Configurar servidores DNS antes de conectar
  const dnsPrimary = process.env.DNS_PRIMARY || '8.8.8.8';
  const dnsSecondary = process.env.DNS_SECONDARY || '8.8.4.4';
  
  logger.info(`Configurando servidores DNS: ${dnsPrimary}, ${dnsSecondary}`);
  try {
    dns.setServers([dnsPrimary, dnsSecondary]);
  } catch (dnsErr) {
    logger.error(`Error al establecer servidores DNS: ${dnsErr.message}`);
  }

  logger.info('Intentando conectar a MongoDB Atlas...');
  try {
    isMemoryDb = false;
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    logger.error(`Error conectando a MongoDB Atlas: ${error.message}`);

    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev) {
      logger.error('No se pudo conectar a MongoDB Atlas en un entorno no-development. Saliendo...');
      process.exit(1);
    }

    logger.info('Iniciando MongoMemoryServer como fallback de development.');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      isMemoryDb = true;

      logger.info('MongoMemoryServer iniciado en fallback.');
      await mongoose.connect(inMemoryUri);
    } catch (memError) {
      logger.error(`Error al iniciar MongoMemoryServer: ${memError.message}`);
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    logger.info('MongoMemoryServer detenido.');
  }
};

module.exports = {
  connectDB,
  closeDB,
};
