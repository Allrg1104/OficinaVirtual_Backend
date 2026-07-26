const { BaseRepository } = require('./BaseRepository');
const Ips = require('../models/Ips');

class IpsRepository extends BaseRepository {
  constructor() {
    super(Ips);
  }
}

module.exports = { IpsRepository };
