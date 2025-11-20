const createStorage = require('../utils/storageFactory');

class TaskModel {
  constructor() {
    this.storage = createStorage('tasks', [
      { id: '_id', title: '_id' },
      { id: 'title', title: 'title' },
      { id: 'description', title: 'description' },
      { id: 'project', title: 'project' },
      { id: 'assignedTo', title: 'assignedTo' },
      { id: 'dueDate', title: 'dueDate' },
      { id: 'status', title: 'status' },
      { id: 'priority', title: 'priority' },
      { id: 'checklist', title: 'checklist' },
      { id: 'attachments', title: 'attachments' },
      { id: 'internalNotes', title: 'internalNotes' },
      { id: 'activityLog', title: 'activityLog' },
      { id: 'deliverables', title: 'deliverables' },
      { id: 'createdAt', title: 'createdAt' },
      { id: 'updatedAt', title: 'updatedAt' },
    ]);
  }

  async find(query = {}) {
    let tasks = await this.storage.find(query);
    tasks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return tasks;
  }

  async findById(id) {
    return await this.storage.findById(id);
  }

  async create(data) {
    return await this.storage.create({
      ...data,
      status: data.status || 'To Do',
      priority: data.priority || 'Medium',
      checklist: data.checklist || [],
      attachments: data.attachments || [],
      internalNotes: data.internalNotes || [],
      activityLog: data.activityLog || [],
      deliverables: data.deliverables || [],
    });
  }

  async findByIdAndUpdate(id, updates) {
    const task = await this.storage.findById(id);
    if (!task) return null;
    
    return await this.storage.update(id, updates);
  }

  async findByIdAndDelete(id) {
    return await this.storage.delete(id);
  }

  async deleteMany(query) {
    const all = await this.storage.readAll();
    const filtered = all.filter(item => {
      return !Object.keys(query).every(key => {
        return item[key] === query[key] || item[key] === String(query[key]);
      });
    });
    await this.storage.writeAll(filtered);
    return { deletedCount: all.length - filtered.length };
  }
}

module.exports = new TaskModel();
