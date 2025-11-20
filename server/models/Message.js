const { getDatabase } = require('../services/firebase');

class MessageModel {
  constructor() {
    this.basePath = 'messages';
  }

  getConversationRef(conversationId) {
    const db = getDatabase();
    if (!db) {
      throw new Error('Firebase database is not initialized. Please check your .env file and Firebase credentials.');
    }
    return db.ref(`${this.basePath}/${conversationId}`);
  }

  async list(conversationId) {
    if (!conversationId) return [];
    const snapshot = await this.getConversationRef(conversationId).get();
    const data = snapshot.val() || {};
    return Object.keys(data)
      .map((key) => ({ _id: key, ...data[key] }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  async create(conversationId, data) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    const ref = this.getConversationRef(conversationId).push();
    const message = {
      _id: ref.key,
      content: data.content,
      sender: data.sender,
      attachments: data.attachments || [],
      readBy: data.readBy || [data.sender],
      createdAt: new Date().toISOString(),
    };

    await ref.set(message);
    return message;
  }

  async appendReadReceipt(conversationId, messageId, userId) {
    if (!conversationId || !messageId || !userId) return;
    const messageRef = this.getConversationRef(conversationId).child(messageId).child('readBy');
    const snapshot = await messageRef.get();
    const current = snapshot.val() || [];
    if (!current.includes(userId)) {
      await messageRef.set([...current, userId]);
    }
  }
}

module.exports = new MessageModel();

