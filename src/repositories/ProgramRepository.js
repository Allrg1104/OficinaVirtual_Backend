const { BaseRepository } = require('./BaseRepository');
const Program = require('../models/Program');

class ProgramRepository extends BaseRepository {
  constructor() {
    super(Program);
  }
}

module.exports = { ProgramRepository };
