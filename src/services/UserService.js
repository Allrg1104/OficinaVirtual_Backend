const bcrypt = require('bcryptjs');
const { UserRepository } = require('../repositories/UserRepository');
const { RoleRepository } = require('../repositories/RoleRepository');
const { auditLogService } = require('./AuditLogService');

class UserService {
  constructor() {
    this.userRepo = new UserRepository();
    this.roleRepo = new RoleRepository();
  }

  async listUsers() {
    return await this.userRepo.find({}, {}, 'role');
  }

  async getUser(id) {
    const user = await this.userRepo.findById(id, 'role');
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async createUser(data, adminUserId, ipAddress, userAgent) {
    const existingEmail = await this.userRepo.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const existingDoc = await this.userRepo.findByDocument(data.document);
    if (existingDoc) {
      throw new Error('El número de documento ya está registrado');
    }

    const roleObj = await this.roleRepo.findByName(data.role);
    if (!roleObj) {
      throw new Error('El rol especificado no existe');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password || 'Salud123*', salt);

    const user = await this.userRepo.create({
      name: data.name,
      document: data.document,
      email: data.email,
      passwordHash,
      role: roleObj.id,
      specialty: data.specialty,
      ips: data.ips,
      status: data.status || 'active',
    });

    await auditLogService.logAction(
      adminUserId,
      'USER_CREATED',
      `Usuario creado: ${user.name} (${user.email}) con rol ${data.role}`,
      ipAddress,
      userAgent
    );

    return user;
  }

  async updateUser(id, data, adminUserId, ipAddress, userAgent) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const updateFields = {};
    if (data.name) updateFields.name = data.name;
    if (data.specialty !== undefined) updateFields.specialty = data.specialty;
    if (data.ips !== undefined) updateFields.ips = data.ips;
    if (data.status) updateFields.status = data.status;

    if (data.role) {
      const roleObj = await this.roleRepo.findByName(data.role);
      if (!roleObj) {
        throw new Error('El rol especificado no existe');
      }
      updateFields.role = roleObj.id;
    }

    const updatedUser = await this.userRepo.update(id, updateFields);

    await auditLogService.logAction(
      adminUserId || id,
      'USER_UPDATED',
      `Usuario actualizado: ${user.email}. Campos modificados: ${Object.keys(updateFields).join(', ')}`,
      ipAddress,
      userAgent
    );

    return updatedUser;
  }

  async changePassword(userId, oldPasswordPlan, newPasswordPlan, ipAddress, userAgent) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(oldPasswordPlan, user.passwordHash);
    if (!isMatch) {
      throw new Error('La contraseña actual es incorrecta');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPasswordPlan, salt);

    await this.userRepo.update(userId, { passwordHash });
    await auditLogService.logAction(userId, 'PASSWORD_CHANGED', 'Cambio de contraseña realizado por el propio usuario', ipAddress, userAgent);
  }

  async resetUserPasswordByAdmin(adminUserId, targetUserId, newPasswordPlan, ipAddress, userAgent) {
    const user = await this.userRepo.findById(targetUserId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPasswordPlan, salt);

    await this.userRepo.update(targetUserId, { passwordHash });
    await auditLogService.logAction(
      adminUserId,
      'USER_PASSWORD_RESET_BY_ADMIN',
      `Administrador restableció contraseña para el usuario: ${user.email}`,
      ipAddress,
      userAgent
    );
  }
}

module.exports = { UserService };
