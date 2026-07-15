const bcrypt = require('bcryptjs');
const { UserRepository } = require('../repositories/UserRepository');
const { RoleRepository } = require('../repositories/RoleRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { auditLogService } = require('./AuditLogService');
const { logger } = require('../config/logger');

class AuthService {
  constructor() {
    this.userRepo = new UserRepository();
    this.roleRepo = new RoleRepository();
  }

  async login(email, passwordPlan, ipAddress, userAgent) {
    const user = await this.userRepo.findByEmail(email);
    if (!user || user.status === 'inactive') {
      await auditLogService.logAction(undefined, 'LOGIN_FAILED', `Intento fallido para el correo: ${email}`, ipAddress, userAgent);
      throw new Error('Credenciales incorrectas o cuenta inactiva');
    }

    const isMatch = await bcrypt.compare(passwordPlan, user.passwordHash);
    if (!isMatch) {
      await auditLogService.logAction(undefined, 'LOGIN_FAILED', `Intento fallido para el correo: ${email}`, ipAddress, userAgent);
      throw new Error('Credenciales incorrectas');
    }

    const roleName = user.role.name;

    const accessToken = generateAccessToken(user.id, user.email, roleName);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token to user
    await this.userRepo.update(user.id, { refreshToken });

    await auditLogService.logAction(user.id, 'LOGIN_SUCCESS', 'Inicio de sesión exitoso', ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        name: user.name,
        document: user.document,
        email: user.email,
        role: roleName,
        specialty: user.specialty,
        ips: user.ips,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token, ipAddress, userAgent) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await this.userRepo.findByIdWithRole(decoded.userId);
      
      if (!user || user.refreshToken !== token || user.status === 'inactive') {
        throw new Error('Token no válido');
      }

      const roleName = user.role.name;

      const accessToken = generateAccessToken(user.id, user.email, roleName);
      const newRefreshToken = generateRefreshToken(user.id);

      await this.userRepo.update(user.id, { refreshToken: newRefreshToken });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Sesión inválida o expirada');
    }
  }

  async logout(userId, ipAddress, userAgent) {
    await this.userRepo.update(userId, { $unset: { refreshToken: 1 } });
    await auditLogService.logAction(userId, 'LOGOUT', 'Cierre de sesión', ipAddress, userAgent);
  }

  async forgotPassword(email, ipAddress, userAgent) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return null;
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry

    await this.userRepo.update(user.id, {
      passwordResetToken: token,
      passwordResetExpires: expires,
    });

    logger.info(`[FORGOT_PASSWORD] Token de recuperación para ${email}: ${token}`);
    await auditLogService.logAction(user.id, 'PASSWORD_RESET_REQUESTED', 'Solicitud de recuperación de contraseña', ipAddress, userAgent);

    return token;
  }

  async resetPassword(token, email, passwordPlan, ipAddress, userAgent) {
    const user = await this.userRepo.findOne({
      email: email.toLowerCase(),
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlan, salt);

    await this.userRepo.update(user.id, {
      passwordHash,
      $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
    });

    await auditLogService.logAction(user.id, 'PASSWORD_RESET_SUCCESS', 'Restablecimiento de contraseña exitoso', ipAddress, userAgent);
  }
}

module.exports = { AuthService };
