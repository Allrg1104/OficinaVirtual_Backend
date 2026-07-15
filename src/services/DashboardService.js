const Request = require('../models/Request');

class DashboardService {
  async getDashboardData(filters) {
    const matchStage = this.buildMatchStage(filters);

    const statsPromise = Request.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyPromise = Request.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const doctorPromise = Request.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            doctorId: '$doctor',
            doctorName: '$doctorSnapshot.name',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const specialtyPromise = Request.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$doctorSnapshot.specialty',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const [statsResult, monthlyResult, doctorResult, specialtyResult] = await Promise.all([
      statsPromise,
      monthlyPromise,
      doctorPromise,
      specialtyPromise,
    ]);

    const indicators = {
      total: 0,
      pendiente: 0,
      en_revision: 0,
      aprobada: 0,
      rechazada: 0,
      informacion_adicional: 0,
    };

    statsResult.forEach((item) => {
      const statusKey = item._id;
      if (statusKey in indicators) {
        indicators[statusKey] = item.count;
      }
      indicators.total += item.count;
    });

    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    const requestsByMonth = monthlyResult.map((item) => {
      const idx = item._id.month - 1;
      return {
        label: `${monthNames[idx]} ${item._id.year}`,
        count: item.count,
      };
    });

    const requestsByDoctor = doctorResult.map((item) => ({
      name: item._id.doctorName || 'Desconocido',
      count: item.count,
    }));

    const requestsBySpecialty = specialtyResult.map((item) => ({
      name: item._id || 'Sin Especialidad',
      count: item.count,
    }));

    const requestsByStatus = Object.entries(indicators)
      .filter(([key]) => key !== 'total')
      .map(([key, val]) => ({
        status: key.replace('_', ' ').toUpperCase(),
        count: val,
      }));

    return {
      indicators,
      requestsByMonth,
      requestsByDoctor,
      requestsBySpecialty,
      requestsByStatus,
    };
  }

  buildMatchStage(filters) {
    const match = {};

    if (filters.status) {
      match.status = filters.status;
    }

    if (filters.doctor) {
      match.doctor = filters.doctor;
    }

    if (filters.specialty) {
      match['doctorSnapshot.specialty'] = { $regex: filters.specialty, $options: 'i' };
    }

    if (filters.startDate || filters.endDate) {
      match.createdAt = {};
      if (filters.startDate) {
        match.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        match.createdAt.$lte = end;
      }
    }

    return match;
  }
}

const dashboardService = new DashboardService();
module.exports = { DashboardService, dashboardService };
