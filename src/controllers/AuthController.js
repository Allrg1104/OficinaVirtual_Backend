const { AuthService } = require('../services/AuthService');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await this.authService.login(email, password, ipAddress, userAgent);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Inicio de sesión exitoso',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  };

  refresh = async (req, res, next) => {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      if (!token) {
        return res.status(401).json({ message: 'Refresh token requerido' });
      }

      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await this.authService.refresh(token, ipAddress, userAgent);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  };

  logout = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      if (userId) {
        await this.authService.logout(userId, ipAddress, userAgent);
      }

      res.clearCookie('refreshToken');
      return res.json({ message: 'Cierre de sesión exitoso' });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const token = await this.authService.forgotPassword(email, ipAddress, userAgent);

      return res.json({
        message: 'Si el correo electrónico está registrado, se ha enviado un token de recuperación.',
        ...(process.env.NODE_ENV !== 'production' && { debugToken: token }),
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { token, email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      await this.authService.resetPassword(token, email, password, ipAddress, userAgent);

      return res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
}

module.exports = { AuthController };
