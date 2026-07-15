const { dashboardService } = require('../services/DashboardService');

class DashboardController {
  getStats = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        doctor: req.query.doctor,
        specialty: req.query.specialty,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      if (req.user?.role === 'medico') {
        filters.doctor = req.user.userId;
      }

      const stats = await dashboardService.getDashboardData(filters);
      return res.json(stats);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { DashboardController };
