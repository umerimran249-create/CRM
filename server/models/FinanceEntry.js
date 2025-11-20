const createStorage = require('../utils/storageFactory');

class FinanceEntryModel {
  constructor() {
    this.storage = createStorage('finance', [
      { id: '_id', title: '_id' },
      { id: 'type', title: 'type' },
      { id: 'project', title: 'project' },
      { id: 'date', title: 'date' },
      { id: 'amount', title: 'amount' },
      { id: 'description', title: 'description' },
      { id: 'category', title: 'category' },
      { id: 'enteredBy', title: 'enteredBy' },
      { id: 'invoiceNumber', title: 'invoiceNumber' },
      { id: 'paymentDeadline', title: 'paymentDeadline' },
      { id: 'isPaid', title: 'isPaid' },
      { id: 'createdAt', title: 'createdAt' },
      { id: 'updatedAt', title: 'updatedAt' },
    ]);
  }

  async find(query = {}) {
    let entries = await this.storage.find(query);
    entries.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return entries;
  }

  async findById(id) {
    return await this.storage.findById(id);
  }

  async create(data) {
    return await this.storage.create({
      ...data,
      date: data.date || new Date().toISOString(),
      isPaid: data.isPaid !== undefined ? data.isPaid : false,
    });
  }

  async findByIdAndUpdate(id, updates) {
    const entry = await this.storage.findById(id);
    if (!entry) return null;
    
    return await this.storage.update(id, updates);
  }

  async findByIdAndDelete(id) {
    return await this.storage.delete(id);
  }
}

module.exports = new FinanceEntryModel();
