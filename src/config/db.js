const mongoose = require('mongoose');
const { logger } = require('./logger');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oficina-virtual';
    
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB conectado exitosamente');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Error en la conexión de MongoDB: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado');
    });

    logger.info(`Intentando conectar a MongoDB en ${mongoURI}...`);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
  } catch (error) {
    logger.warn('No se pudo conectar a la base de datos local de MongoDB. Iniciando base de datos en memoria (MongoMemoryServer)...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      
      logger.info(`MongoMemoryServer iniciado en ${inMemoryUri}`);
      await mongoose.connect(inMemoryUri);
    } catch (memError) {
      logger.error('Error al iniciar MongoMemoryServer:', memError);
      logger.error('No se pudo establecer conexión de base de datos. Saliendo...');
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    logger.info('MongoMemoryServer detenido');
  }
};

module.exports = {
  connectDB,
  closeDB,
};
