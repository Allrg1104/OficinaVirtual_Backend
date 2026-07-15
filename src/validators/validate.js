const { ZodError } = require('zod');

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Error de validación en los datos provistos',
        errors: error.errors.map(err => ({
          field: err.path.join('.').replace('body.', '').replace('query.', '').replace('params.', ''),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

module.exports = { validate };
