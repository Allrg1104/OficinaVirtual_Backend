const { Router } = require('express');
const { DashboardController } = require('../controllers/DashboardController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

const router = Router();
const controller = new DashboardController();

router.get('/stats', authMiddleware, roleMiddleware(['administrador', 'autorizador']), controller.getStats);

module.exports = router;
