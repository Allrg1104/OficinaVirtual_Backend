const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
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
  // Local static files server origin if any
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', standardLimiter);

// Serve static Frontend files
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
        url: 'http://localhost:4000/api',
        description: 'Servidor Local de Desarrollo',
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
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

// Centralized error handling
app.use(errorMiddleware);

module.exports = app;
