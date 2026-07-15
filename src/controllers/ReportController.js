const { reportService } = require('../services/ReportService');

class ReportController {
  exportExcel = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        doctor: req.query.doctor,
        specialty: req.query.specialty,
        patientDoc: req.query.patientDoc,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      if (req.user?.role === 'medico') {
        filters.doctor = req.user.userId;
      }

      const buffer = await reportService.exportToExcel(filters);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Reporte_Solicitudes_${new Date().toISOString().slice(0, 10)}.xlsx"`
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { ReportController };
