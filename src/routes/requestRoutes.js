const { Router } = require('express');
const { RequestController } = require('../controllers/RequestController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { validate } = require('../validators/validate');
const { createRequestSchema, updateRequestStatusSchema } = require('../validators/requestValidator');
const { upload } = require('../config/multer');

const router = Router();
const controller = new RequestController();

const parseMultipartJson = (req, res, next) => {
  if (req.body.edad !== undefined) {
    req.body.edad = Number(req.body.edad);
  }
  if (req.body.antiguedadMeses !== undefined) {
    req.body.antiguedadMeses = Number(req.body.antiguedadMeses);
  }
  if (req.body.costo !== undefined) {
    req.body.costo = Number(req.body.costo);
  }
  next();
};

router.use(authMiddleware);

router.get('/', controller.listRequests);
router.post(
  '/',
  roleMiddleware(['medico']),
  upload.any(),
  parseMultipartJson,
  validate(createRequestSchema),
  controller.createRequest
);
router.get('/:id', controller.getRequest);
router.put('/:id/status', roleMiddleware(['autorizador', 'administrador']), validate(updateRequestStatusSchema), controller.updateStatus);
router.post('/:id/attachments', upload.any(), controller.addAttachments);
router.get('/:id/attachments/:attachmentId', controller.downloadAttachment);

module.exports = router;
