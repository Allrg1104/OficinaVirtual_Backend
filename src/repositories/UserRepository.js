const { BaseRepository } = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email }, 'role');
  }

  async findByDocument(document) {
    return await this.findOne({ document }, 'role');
  }

  async findByIdWithRole(id) {
    return await this.findById(id, 'role');
  }
}

module.exports = { UserRepository };
