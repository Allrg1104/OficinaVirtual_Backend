const { RequestRepository } = require('../repositories/RequestRepository');
const { UserRepository } = require('../repositories/UserRepository');
const { AttachmentRepository } = require('../repositories/AttachmentRepository');
const { NotificationRepository } = require('../repositories/NotificationRepository');
const { auditLogService } = require('./AuditLogService');

class RequestService {
  constructor() {
    this.requestRepo = new RequestRepository();
    this.userRepo = new UserRepository();
    this.attachmentRepo = new AttachmentRepository();
    this.notificationRepo = new NotificationRepository();
  }

  async listRequests(userId, roleName, filters, limit = 100, skip = 0) {
    if (roleName === 'medico') {
      filters.doctor = userId;
    }
    const data = await this.requestRepo.findWithFilters(filters, limit, skip);
    const total = await this.requestRepo.countWithFilters(filters);
    return { data, total, limit, skip };
  }

  async getRequestById(id, userId, roleName) {
    const request = await this.requestRepo.findById(id, ['doctor', 'attachments']);
    if (!request) {
      throw new Error('Solicitud no encontrada');
    }

    if (roleName === 'medico' && request.doctor.toString() !== userId) {
      throw new Error('No autorizado para ver esta solicitud');
    }

    return request;
  }

  async createRequest(doctorUserId, data, uploadedFiles, ipAddress, userAgent) {
    const doctor = await this.userRepo.findById(doctorUserId);
    if (!doctor) {
      throw new Error('Médico no encontrado');
    }

    const doctorSnapshot = {
      name: doctor.name,
      document: doctor.document,
      specialty: doctor.specialty,
      ips: doctor.ips,
    };

    const request = await this.requestRepo.create({
      doctor: doctorUserId,
      doctorSnapshot,
      patient: {
        name: data.patient.name,
        document: data.patient.document,
        birthDate: new Date(data.patient.birthDate),
        gender: data.patient.gender,
      },
      medicalInfo: data.medicalInfo,
      status: 'pendiente',
      observations: [],
      attachments: [],
    });

    const attachmentIds = [];
    for (const file of uploadedFiles) {
      const type = ['historia_clinica', 'examenes', 'formulas', 'otros'].includes(file.fieldname)
        ? file.fieldname
        : 'otros';

      const attachment = await this.attachmentRepo.create({
        request: request.id,
        fileName: file.originalname,
        fileType: type,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: doctorUserId,
      });

      attachmentIds.push(attachment.id);
    }

    request.attachments = attachmentIds;
    await request.save();

    await auditLogService.logAction(
      doctorUserId,
      'CREATE_REQUEST',
      `Solicitud de autorización creada para el paciente: ${request.patient.document} (ID: ${request.id})`,
      ipAddress,
      userAgent
    );

    return request;
  }

  async updateStatus(requestId, authorizerUserId, roleName, newStatus, observationText, ipAddress, userAgent) {
    if (roleName !== 'autorizador' && roleName !== 'administrador') {
      throw new Error('No autorizado para modificar el estado de la solicitud');
    }

    const request = await this.requestRepo.findById(requestId);
    if (!request) {
      throw new Error('Solicitud no encontrada');
    }

    const authorizer = await this.userRepo.findById(authorizerUserId);
    if (!authorizer) {
      throw new Error('Autorizador no encontrado');
    }

    const oldStatus = request.status;
    request.status = newStatus;

    request.observations.push({
      userId: authorizer.id,
      userName: authorizer.name,
      userRole: roleName,
      text: observationText,
      createdAt: new Date(),
    });

    await request.save();

    await this.notificationRepo.create({
      recipient: request.doctor,
      title: `Estado Actualizado: ${newStatus.replace('_', ' ').toUpperCase()}`,
      message: `Tu solicitud para el paciente ${request.patient.name} ha cambiado de estado de "${oldStatus}" a "${newStatus}". Observación: "${observationText}"`,
      request: request.id,
      read: false,
    });

    await auditLogService.logAction(
      authorizerUserId,
      'UPDATE_REQUEST_STATUS',
      `Estado de solicitud ${requestId} cambiado de ${oldStatus} a ${newStatus}. Obs: ${observationText}`,
      ipAddress,
      userAgent
    );

    return request;
  }

  async addAttachments(requestId, userId, roleName, uploadedFiles, observationText, ipAddress, userAgent) {
    const request = await this.requestRepo.findById(requestId);
    if (!request) {
      throw new Error('Solicitud no encontrada');
    }

    if (roleName === 'medico' && request.doctor.toString() !== userId) {
      throw new Error('No autorizado para modificar esta solicitud');
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const attachmentIds = [...request.attachments.map(id => id.toString())];
    for (const file of uploadedFiles) {
      const type = ['historia_clinica', 'examenes', 'formulas', 'otros'].includes(file.fieldname)
        ? file.fieldname
        : 'otros';

      const attachment = await this.attachmentRepo.create({
        request: request.id,
        fileName: file.originalname,
        fileType: type,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: userId,
      });

      attachmentIds.push(attachment.id);
    }

    request.attachments = attachmentIds;

    if (observationText) {
      request.observations.push({
        userId: user.id,
        userName: user.name,
        userRole: roleName,
        text: observationText,
        createdAt: new Date(),
      });
    }

    if (roleName === 'medico' && request.status === 'informacion_adicional') {
      request.status = 'en_revision';
      await auditLogService.logAction(
        userId,
        'UPDATE_REQUEST_STATUS_AUTO',
        `Estado cambiado automáticamente a 'en_revision' debido a carga de documentos por el médico.`,
        ipAddress,
        userAgent
      );
    }

    await request.save();

    await auditLogService.logAction(
      userId,
      'ADD_ATTACHMENTS',
      `Se agregaron ${uploadedFiles.length} documentos adjuntos a la solicitud ${requestId}`,
      ipAddress,
      userAgent
    );

    return request;
  }
}

const requestService = new RequestService();
module.exports = { RequestService, requestService };
