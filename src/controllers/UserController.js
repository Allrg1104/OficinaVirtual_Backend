const { UserService } = require('../services/UserService');
const { auditLogService } = require('../services/AuditLogService');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req, res, next) => {
    try {
      const users = await this.userService.listUsers();
      
      const formatted = users.map((user) => ({
        id: user.id,
        name: user.name,
        document: user.document,
        email: user.email,
        role: user.role?.name || 'N/A',
        specialty: user.specialty,
        ips: user.ips,
        status: user.status,
        createdAt: user.createdAt,
      }));

      return res.json(formatted);
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req, res, next) => {
    try {
      const user = await this.userService.getUser(req.params.id);
      return res.json({
        id: user.id,
        name: user.name,
        document: user.document,
        email: user.email,
        role: user.role?.name || 'N/A',
        specialty: user.specialty,
        ips: user.ips,
        status: user.status,
        createdAt: user.createdAt,
      });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  };

  createUser = async (req, res, next) => {
    try {
      const adminUserId = req.user?.userId;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const user = await this.userService.createUser(req.body, adminUserId, ipAddress, userAgent);

      return res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: {
          id: user.id,
          name: user.name,
          document: user.document,
          email: user.email,
          role: req.body.role,
          status: user.status,
        },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  updateUser = async (req, res, next) => {
    try {
      const adminUserId = req.user?.userId;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const user = await this.userService.updateUser(req.params.id, req.body, adminUserId, ipAddress, userAgent);

      return res.json({
        message: 'Usuario actualizado exitosamente',
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          status: user?.status,
        },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  getProfile = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const user = await this.userService.getUser(userId);

      return res.json({
        id: user.id,
        name: user.name,
        document: user.document,
        email: user.email,
        role: user.role?.name || 'N/A',
        specialty: user.specialty,
        ips: user.ips,
        status: user.status,
      });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const updateData = {
        name: req.body.name,
        specialty: req.body.specialty,
        ips: req.body.ips,
      };

      const user = await this.userService.updateUser(userId, updateData, undefined, ipAddress, userAgent);

      return res.json({
        message: 'Perfil actualizado exitosamente',
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          specialty: user?.specialty,
          ips: user?.ips,
        },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { oldPassword, newPassword } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      await this.userService.changePassword(userId, oldPassword, newPassword, ipAddress, userAgent);

      return res.json({ message: 'Contraseña cambiada exitosamente' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  adminResetPassword = async (req, res, next) => {
    try {
      const adminUserId = req.user?.userId;
      const targetUserId = req.params.id;
      const { newPassword } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      await this.userService.resetUserPasswordByAdmin(adminUserId, targetUserId, newPassword, ipAddress, userAgent);

      return res.json({ message: 'Contraseña restablecida exitosamente por el administrador' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  getAuditLogs = async (req, res, next) => {
    try {
      const logs = await auditLogService.getLogs(300);
      return res.json(logs);
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req, res, next) => {
    try {
      const { NotificationRepository } = require('../repositories/NotificationRepository');
      const notifRepo = new NotificationRepository();
      const notifications = await notifRepo.findByRecipient(req.user.userId, true);
      return res.json(notifications);
    } catch (error) {
      next(error);
    }
  };

  markNotificationsRead = async (req, res, next) => {
    try {
      const { NotificationRepository } = require('../repositories/NotificationRepository');
      const notifRepo = new NotificationRepository();
      await notifRepo.markAllAsRead(req.user.userId);
      return res.json({ message: 'Notificaciones marcadas como leídas' });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { UserController };
