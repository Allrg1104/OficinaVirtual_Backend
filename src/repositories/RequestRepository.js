const { BaseRepository } = require('./BaseRepository');
const Request = require('../models/Request');

class RequestRepository extends BaseRepository {
  constructor() {
    super(Request);
  }

  async findWithFilters(filters, limit = 100, skip = 0) {
    const query = this.buildFilterQuery(filters);
    return await this.find(query, { limit, skip, sort: { createdAt: -1 } }, ['doctor', 'attachments']);
  }

  async countWithFilters(filters) {
    const query = this.buildFilterQuery(filters);
    return await this.count(query);
  }

  buildFilterQuery(filters) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.doctor) {
      query.doctor = filters.doctor;
    }

    if (filters.specialty) {
      query['doctorSnapshot.specialty'] = { $regex: filters.specialty, $options: 'i' };
    }

    if (filters.patientDoc) {
      query['patient.document'] = filters.patientDoc;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    return query;
  }
}

module.exports = { RequestRepository };
