const { Router } = require('express');
const { AuthController } = require('../controllers/AuthController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimit');
const { validate } = require('../validators/validate');
const { loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/authValidator');

const router = Router();
const controller = new AuthController();

router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', authMiddleware, controller.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), controller.resetPassword);

module.exports = router;
