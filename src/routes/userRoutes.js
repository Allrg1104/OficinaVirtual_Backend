const { Router } = require('express');
const { UserController } = require('../controllers/UserController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { validate } = require('../validators/validate');
const {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  adminResetPasswordSchema
} = require('../validators/userValidator');

const router = Router();
const controller = new UserController();

router.get('/profile', authMiddleware, controller.getProfile);
router.put('/profile', authMiddleware, controller.updateProfile);
router.put('/change-password', authMiddleware, validate(changePasswordSchema), controller.changePassword);

router.get('/notifications', authMiddleware, controller.getNotifications);
router.put('/notifications/read', authMiddleware, controller.markNotificationsRead);

router.get('/audit-logs', authMiddleware, roleMiddleware(['administrador']), controller.getAuditLogs);
router.get('/', authMiddleware, roleMiddleware(['administrador']), controller.getUsers);
router.post('/', authMiddleware, roleMiddleware(['administrador']), validate(createUserSchema), controller.createUser);
router.get('/:id', authMiddleware, roleMiddleware(['administrador']), controller.getUser);
router.put('/:id', authMiddleware, roleMiddleware(['administrador']), validate(updateUserSchema), controller.updateUser);
router.put('/:id/reset-password', authMiddleware, roleMiddleware(['administrador']), validate(adminResetPasswordSchema), controller.adminResetPassword);

module.exports = router;
