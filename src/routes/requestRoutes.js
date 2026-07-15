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
  if (req.body.patient && typeof req.body.patient === 'string') {
    try {
      req.body.patient = JSON.parse(req.body.patient);
    } catch (e) {}
  }
  if (req.body.medicalInfo && typeof req.body.medicalInfo === 'string') {
    try {
      req.body.medicalInfo = JSON.parse(req.body.medicalInfo);
    } catch (e) {}
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
