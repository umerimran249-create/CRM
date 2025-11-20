const createStorage = require('../utils/storageFactory');

class ConversationModel {
  constructor() {
    this.storage = createStorage('conversations', [
      { id: '_id', title: '_id' },
      { id: 'name', title: 'name' },
      { id: 'participants', title: 'participants' },
      { id: 'createdBy', title: 'createdBy' },
      { id: 'lastMessage', title: 'lastMessage' },
      { id: 'createdAt', title: 'createdAt' },
      { id: 'updatedAt', title: 'updatedAt' },
    ]);
  }

  async findByParticipant(userId) {
    const conversations = await this.storage.readAll();
    return conversations.filter((conversation) =>
      Array.isArray(conversation.participants) &&
      conversation.participants.includes(userId)
    );
  }

  async findById(id) {
    return this.storage.findById(id);
  }

  async create(data) {
    const participants = Array.isArray(data.participants)
      ? Array.from(new Set(data.participants))
      : [];

    return this.storage.create({
      ...data,
      participants,
    });
  }

  async update(id, updates) {
    return this.storage.update(id, updates);
  }

  async updateLastMessage(id, lastMessage) {
    return this.storage.update(id, {
      lastMessage,
      updatedAt: new Date().toISOString(),
    });
  }
}

module.exports = new ConversationModel();

