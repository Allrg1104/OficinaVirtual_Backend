const app = require('../src/app');
const { connectDB } = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Error de conexión a la base de datos en Vercel Function:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al conectar con la base de datos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
  return app(req, res);
};
