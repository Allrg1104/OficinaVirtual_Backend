const { Router } = require('express');
const { IpsController } = require('../controllers/IpsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

const router = Router();
const controller = new IpsController();

router.use(authMiddleware);

// Anyone logged in can read (needed for 'Radicar Solicitud' IPS selector)
router.get('/', controller.list);

// Only administrators can mutate
router.post('/', roleMiddleware(['administrador']), controller.create);
router.put('/:id', roleMiddleware(['administrador']), controller.update);
router.patch('/:id/toggle', roleMiddleware(['administrador']), controller.toggleStatus);
router.delete('/:id', roleMiddleware(['administrador']), controller.delete);

module.exports = router;
