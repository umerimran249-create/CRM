const createStorage = require('../utils/storageFactory');

class CalendarEventModel {
  constructor() {
    this.storage = createStorage('calendarEvents', [
      { id: '_id', title: '_id' },
      { id: 'title', title: 'title' },
      { id: 'description', title: 'description' },
      { id: 'startDate', title: 'startDate' },
      { id: 'endDate', title: 'endDate' },
      { id: 'createdBy', title: 'createdBy' },
      { id: 'assignedTo', title: 'assignedTo' },
      { id: 'type', title: 'type' },
      { id: 'color', title: 'color' },
      { id: 'createdAt', title: 'createdAt' },
      { id: 'updatedAt', title: 'updatedAt' },
    ]);
  }

  async find(query = {}) {
    return await this.storage.find(query);
  }

  async findById(id) {
    return await this.storage.findById(id);
  }

  async create(data) {
    return await this.storage.create({
      ...data,
      type: data.type || 'personal',
      color: data.color || '#1976d2',
    });
  }

  async findByIdAndUpdate(id, updates) {
    return await this.storage.update(id, updates);
  }

  async findByIdAndDelete(id) {
    return await this.storage.delete(id);
  }

  async findByUser(userId) {
    // Get events created by user or assigned to user
    const created = await this.find({ createdBy: userId });
    const assigned = await this.find({ assignedTo: userId });
    
    // Combine and deduplicate
    const eventMap = new Map();
    [...created, ...assigned].forEach(event => {
      eventMap.set(event._id, event);
    });
    
    return Array.from(eventMap.values());
  }
}

module.exports = new CalendarEventModel();

