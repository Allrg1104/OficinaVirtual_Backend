const { requestService } = require('../services/RequestService');
const Attachment = require('../models/Attachment');
const path = require('path');

class RequestController {
  createRequest = async (req, res, next) => {
    try {
      const doctorUserId = req.user?.userId;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      let patient = req.body.patient;
      let medicalInfo = req.body.medicalInfo;

      if (typeof patient === 'string') patient = JSON.parse(patient);
      if (typeof medicalInfo === 'string') medicalInfo = JSON.parse(medicalInfo);

      const files = [];
      if (req.files) {
        if (Array.isArray(req.files)) {
          files.push(...req.files);
        } else {
          Object.keys(req.files).forEach((key) => {
            const fileArray = req.files[key];
            files.push(...fileArray);
          });
        }
      }

      if (files.length === 0) {
        return res.status(400).json({ message: 'Se requiere al menos un archivo adjunto (ej: Historia clínica)' });
      }

      const request = await requestService.createRequest(
        doctorUserId,
        { patient, medicalInfo },
        files,
        ipAddress,
        userAgent
      );

      return res.status(201).json({
        message: 'Solicitud de autorización creada exitosamente',
        request,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listRequests = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const roleName = req.user?.role;
      
      const filters = {
        status: req.query.status,
        doctor: req.query.doctor,
        specialty: req.query.specialty,
        patientDoc: req.query.patientDoc,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const limit = parseInt(req.query.limit) || 50;
      const skip = parseInt(req.query.skip) || 0;

      const result = await requestService.listRequests(userId, roleName, filters, limit, skip);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getRequest = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const roleName = req.user?.role;
      const requestId = req.params.id;

      const request = await requestService.getRequestById(requestId, userId, roleName);
      return res.json(request);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const authorizerUserId = req.user?.userId;
      const roleName = req.user?.role;
      const requestId = req.params.id;
      const { status, observation } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const request = await requestService.updateStatus(
        requestId,
        authorizerUserId,
        roleName,
        status,
        observation,
        ipAddress,
        userAgent
      );

      return res.json({
        message: 'Estado de la solicitud actualizado exitosamente',
        request,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  addAttachments = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const roleName = req.user?.role;
      const requestId = req.params.id;
      const { observation } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const files = [];
      if (req.files) {
        if (Array.isArray(req.files)) {
          files.push(...req.files);
        } else {
          Object.keys(req.files).forEach((key) => {
            const fileArray = req.files[key];
            files.push(...fileArray);
          });
        }
      }

      if (files.length === 0) {
        return res.status(400).json({ message: 'No se subieron archivos' });
      }

      const request = await requestService.addAttachments(
        requestId,
        userId,
        roleName,
        files,
        observation,
        ipAddress,
        userAgent
      );

      return res.json({
        message: 'Documentos adjuntos agregados exitosamente',
        request,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  downloadAttachment = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const roleName = req.user?.role;
      const { id, attachmentId } = req.params;

      await requestService.getRequestById(id, userId, roleName);
      
      const attachment = await Attachment.findById(attachmentId);
      if (!attachment || attachment.request.toString() !== id) {
        return res.status(404).json({ message: 'Archivo adjunto no encontrado' });
      }

      const absolutePath = path.resolve(attachment.filePath);
      return res.download(absolutePath, attachment.fileName);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
}

module.exports = { RequestController };
