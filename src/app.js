const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
const routes = require('./routes');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { standardLimiter } = require('./middlewares/rateLimit');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

if (process.env.FRONTEND_URL) {
  const formattedFrontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, '');
  if (!allowedOrigins.includes(formattedFrontendUrl)) {
    allowedOrigins.push(formattedFrontendUrl);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV === 'development'
    ) {
      return callback(null, true);
    }
    
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', standardLimiter);

// Servir archivos estáticos del frontend local (si existen en desarrollo)
app.use(express.static(path.join(__dirname, '../../OficinaVirtual_Frontend')));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Oficina Virtual de Autorizaciones Médicas',
      version: '1.0.0',
      description: 'API para la solicitud de procedimientos de alto costo y gestión de autorizaciones (JavaScript).',
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check Handlers
const healthHandler = (req, res) => {
  const dbStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const dbState = dbStateMap[mongoose.connection.readyState] || 'unknown';
  res.json({
    status: 'ok',
    service: 'Oficina Virtual Backend API',
    environment: process.env.NODE_ENV || 'development',
    dbState,
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'El Servidor de Oficina Virtual está corriendo correctamente',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'El Servidor de Oficina Virtual está corriendo correctamente (API)',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', routes);

// Centralized error handling
app.use(errorMiddleware);

module.exports = app;
