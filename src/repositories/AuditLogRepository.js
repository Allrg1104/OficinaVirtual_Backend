const { BaseRepository } = require('./BaseRepository');
const AuditLog = require('../models/AuditLog');

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  async findRecent(limit = 200) {
    return await this.find({}, { sort: { createdAt: -1 }, limit });
  }
}

module.exports = { AuditLogRepository };
