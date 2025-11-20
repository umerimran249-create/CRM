const { getDatabase } = require('../services/firebase');

class FirebaseStorage {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  getRef(childPath = '') {
    const db = getDatabase();
    if (!db) {
      throw new Error('Firebase database is not initialized. Please check your .env file and Firebase credentials.');
    }
    const base = this.collectionName.startsWith('/')
      ? this.collectionName.slice(1)
      : this.collectionName;
    const path = childPath ? `${base}/${childPath}` : base;
    return db.ref(path);
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  normalizeRecord(record, fallbackId) {
    if (!record) return null;
    const now = new Date().toISOString();
    return {
      _id: record._id || fallbackId || this.generateId(),
      ...record,
      createdAt: record.createdAt || now,
      updatedAt: record.updatedAt || now,
    };
  }

  formatFromSnapshot(key, value) {
    if (!value) return null;
    return {
      _id: value._id || key,
      ...value,
    };
  }

  async readAll() {
    const snapshot = await this.getRef().get();
    const data = snapshot.val() || {};
    return Object.keys(data).map((key) => this.formatFromSnapshot(key, data[key]));
  }

  matchesQuery(item, query) {
    const keys = Object.keys(query || {});
    if (!keys.length) return true;
    return keys.every((key) => {
      const value = this.getValueByPath(item, key);
      const queryValue = query[key];
      if (Array.isArray(queryValue)) {
        return Array.isArray(value) && queryValue.every((v) => value.includes(v));
      }
      return value === queryValue;
    });
  }

  getValueByPath(obj, path) {
    return path.split('.').reduce((acc, part) => {
      if (acc === null || acc === undefined) return undefined;
      if (Array.isArray(acc)) {
        const index = Number(part);
        return acc[index];
      }
      return acc[part];
    }, obj);
  }

  async find(query = {}) {
    const all = await this.readAll();
    return all.filter((item) => this.matchesQuery(item, query));
  }

  async findOne(query = {}) {
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    if (!id) return null;
    const snapshot = await this.getRef(id).get();
    if (!snapshot.exists()) return null;
    return this.formatFromSnapshot(id, snapshot.val());
  }

  async create(data) {
    const record = this.normalizeRecord(data);
    await this.getRef(record._id).set(record);
    return record;
  }

  async update(id, updates) {
    if (!id) return null;
    const existing = await this.findById(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      _id: id,
      updatedAt: new Date().toISOString(),
    };
    await this.getRef(id).set(updated);
    return updated;
  }

  async delete(id) {
    if (!id) return null;
    await this.getRef(id).remove();
    return { _id: id };
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length;
  }

  async writeAll(data = []) {
    if (!Array.isArray(data) || !data.length) {
      await this.getRef().set(null);
      return;
    }

    const payload = {};
    data.forEach((item) => {
      const record = this.normalizeRecord(item);
      payload[record._id] = record;
    });

    await this.getRef().set(payload);
  }
}

module.exports = FirebaseStorage;

