const { BaseRepository } = require('./BaseRepository');
const Attachment = require('../models/Attachment');

class AttachmentRepository extends BaseRepository {
  constructor() {
    super(Attachment);
  }

  async findByRequestId(requestId) {
    return await this.find({ request: requestId });
  }
}

module.exports = { AttachmentRepository };
