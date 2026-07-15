class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(item) {
    return await this.model.create(item);
  }

  async findById(id, populate) {
    const query = this.model.findById(id);
    if (populate) {
      query.populate(populate);
    }
    return await query.exec();
  }

  async findOne(filter, populate) {
    const query = this.model.findOne(filter);
    if (populate) {
      query.populate(populate);
    }
    return await query.exec();
  }

  async find(filter, options, populate) {
    const query = this.model.find(filter, null, options);
    if (populate) {
      query.populate(populate);
    }
    return await query.exec();
  }

  async update(id, update) {
    return await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async count(filter) {
    return await this.model.countDocuments(filter).exec();
  }
}

module.exports = { BaseRepository };
