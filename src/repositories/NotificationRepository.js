const { BaseRepository } = require('./BaseRepository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findByRecipient(recipientId, unreadOnly = false) {
    const filter = { recipient: recipientId };
    if (unreadOnly) {
      filter.read = false;
    }
    return await this.find(filter, { sort: { createdAt: -1 } });
  }

  async markAllAsRead(recipientId) {
    await this.model.updateMany({ recipient: recipientId, read: false }, { read: true }).exec();
  }
}

module.exports = { NotificationRepository };
