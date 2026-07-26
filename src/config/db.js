const mongoose = require('mongoose');
const dns = require('node:dns');
const { logger } = require('./logger');

let mongoMemoryServer = null;
let isMemoryDb = false;

// Connection cache for serverless environments (Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected (readyState 1 = connected), return cached connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    const errorMsg = 'MONGODB_URI no está configurada en las variables de entorno.';
    logger.error(`Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // If a connection attempt is currently in progress, await it
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // Configurar listeners de eventos una sola vez
  if (!mongoose.connection.listeners('connected').length) {
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
  }

  const isDev = process.env.NODE_ENV === 'development';
  const isVercel = Boolean(process.env.VERCEL);

  // Configurar servidores DNS solo en desarrollo local fuera de Vercel si se especifica
  if (isDev && !isVercel) {
    const dnsPrimary = process.env.DNS_PRIMARY;
    if (dnsPrimary) {
      const dnsSecondary = process.env.DNS_SECONDARY || '8.8.4.4';
      logger.info(`Configurando servidores DNS locales: ${dnsPrimary}, ${dnsSecondary}`);
      try {
        dns.setServers([dnsPrimary, dnsSecondary]);
      } catch (dnsErr) {
        logger.error(`Error al establecer servidores DNS: ${dnsErr.message}`);
      }
    }
  }

  logger.info('Intentando conectar a MongoDB Atlas...');
  const opts = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  };

  cached.promise = mongoose.connect(mongoURI, opts).then((m) => {
    isMemoryDb = false;
    return m;
  }).catch(async (error) => {
    cached.promise = null;
    logger.error(`Error conectando a MongoDB Atlas: ${error.message}`);

    // Intentar MongoMemoryServer ÚNICAMENTE en desarrollo local fuera de Vercel
    if (isDev && !isVercel) {
      logger.info('Iniciando MongoMemoryServer como fallback de desarrollo local.');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoMemoryServer.getUri();
        isMemoryDb = true;

        logger.info('MongoMemoryServer iniciado en fallback.');
        return await mongoose.connect(inMemoryUri);
      } catch (memError) {
        logger.error(`Error al iniciar MongoMemoryServer: ${memError.message}`);
        throw memError;
      }
    }

    // En producción o Vercel, lanzar la excepción (NO process.exit)
    throw error;
  });

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
    logger.info('MongoMemoryServer detenido.');
  }
  cached.conn = null;
  cached.promise = null;
};

module.exports = {
  connectDB,
  closeDB,
};
