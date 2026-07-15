const { BaseRepository } = require('./BaseRepository');
const Role = require('../models/Role');

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }

  async findByName(name) {
    return await this.findOne({ name: name.toLowerCase() });
  }
}

module.exports = { RoleRepository };
