const { AuditLogRepository } = require('../repositories/AuditLogRepository');
const { UserRepository } = require('../repositories/UserRepository');
const { logger } = require('../config/logger');

class AuditLogService {
  constructor() {
    this.auditLogRepo = new AuditLogRepository();
    this.userRepo = new UserRepository();
  }

  async logAction(userId, action, details, ipAddress, userAgent) {
    try {
      let userName = 'Sistema / Anónimo';
      let userRole = 'N/A';

      if (userId) {
        const user = await this.userRepo.findByIdWithRole(userId);
        if (user) {
          userName = user.name;
          userRole = user.role.name || 'N/A';
        }
      }

      await this.auditLogRepo.create({
        user: userId,
        userName,
        userRole,
        action,
        details,
        ipAddress,
        userAgent,
      });

      logger.info(`[AUDIT] Action: ${action} | User: ${userName} (${userRole}) | Details: ${details}`);
    } catch (error) {
      logger.error('Error al guardar log de auditoría:', error);
    }
  }

  async getLogs(limit = 200) {
    return await this.auditLogRepo.findRecent(limit);
  }
}

const auditLogService = new AuditLogService();
module.exports = { AuditLogService, auditLogService };
