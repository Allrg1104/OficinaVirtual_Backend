const { Router } = require('express');
const { ReportController } = require('../controllers/ReportController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

const router = Router();
const controller = new ReportController();

router.get('/excel', authMiddleware, roleMiddleware(['administrador', 'autorizador']), controller.exportExcel);

module.exports = router;
