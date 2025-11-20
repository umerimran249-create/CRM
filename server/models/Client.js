const createStorage = require('../utils/storageFactory');

class ClientModel {
  constructor() {
    this.storage = createStorage('clients', [
      { id: '_id', title: '_id' },
      { id: 'clientId', title: 'clientId' },
      { id: 'name', title: 'name' },
      { id: 'contactInfo', title: 'contactInfo' },
      { id: 'industry', title: 'industry' },
      { id: 'contractDate', title: 'contractDate' },
      { id: 'accountManager', title: 'accountManager' },
      { id: 'isActive', title: 'isActive' },
      { id: 'createdAt', title: 'createdAt' },
      { id: 'updatedAt', title: 'updatedAt' },
    ]);
  }

  async find(query = {}) {
    let clients = await this.storage.find(query);
    clients.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return clients;
  }

  async findById(id) {
    return await this.storage.findById(id);
  }

  async create(data) {
    const clients = await this.storage.readAll();
    const count = clients.length;
    const clientId = `CLI-${String(count + 1).padStart(5, '0')}`;
    
    const contactInfo = typeof data.contactInfo === 'string' 
      ? JSON.parse(data.contactInfo) 
      : data.contactInfo;
    
    return await this.storage.create({
      ...data,
      clientId,
      contactInfo,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  async findByIdAndUpdate(id, updates) {
    const client = await this.storage.findById(id);
    if (!client) return null;
    
    if (updates.contactInfo && typeof updates.contactInfo === 'object') {
      // Keep as object, will be stringified by storage
    }
    
    return await this.storage.update(id, updates);
  }

  async findByIdAndDelete(id) {
    return await this.storage.delete(id);
  }

  async countDocuments(query = {}) {
    return await this.storage.countDocuments(query);
  }
}

module.exports = new ClientModel();
