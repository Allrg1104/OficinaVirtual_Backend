const { Router } = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const requestRoutes = require('./requestRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const reportRoutes = require('./reportRoutes');
const { UserController } = require('../controllers/UserController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = Router();
const userController = new UserController();

router.get('/status', (req, res) => {
  return res.json({ status: 'ok', time: new Date() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/requests', requestRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/export', reportRoutes);
router.use('/reports', reportRoutes);

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;
