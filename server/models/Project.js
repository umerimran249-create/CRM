const createStorage = require('../utils/storageFactory');

class ProjectModel {
  constructor() {
    this.storage = createStorage('projects', [
      { id: '_id', title: '_id' },
      { id: 'projectId', title: 'projectId' },
      { id: 'name', title: 'name' },
      { id: 'client', title: 'client' },
      { id: 'category', title: 'category' },
      { id: 'startDate', title: 'startDate' },
      { id: 'endDate', title: 'endDate' },
      { id: 'status', title: 'status' },
      { id: 'estimatedBudget', title: 'estimatedBudget' },
      { id: 'actualExpenses', title: 'actualExpenses' },
      { id: 'revenueReceived', title: 'revenueReceived' },
      { id: 'projectLead', title: 'projectLead' },
      { id: 'teamMembers', title: 'teamMembers' },
      { id: 'completionSummary', title: 'completionSummary' },
      { id: 'createdAt', title: 'createdAt' },
      { id: 'updatedAt', title: 'updatedAt' },
    ]);
  }

  async find(query = {}) {
    let projects = await this.storage.find(query);
    projects.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return projects;
  }

  async findById(id) {
    return await this.storage.findById(id);
  }

  async create(data) {
    const projects = await this.storage.readAll();
    const count = projects.length;
    const projectId = `PROJ-${String(count + 1).padStart(5, '0')}`;
    
    const teamMembers = Array.isArray(data.teamMembers) 
      ? data.teamMembers 
      : [];
    
    return await this.storage.create({
      ...data,
      projectId,
      teamMembers,
      status: data.status || 'Planning',
      actualExpenses: data.actualExpenses || 0,
      revenueReceived: data.revenueReceived || 0,
    });
  }

  async findByIdAndUpdate(id, updates) {
    const project = await this.storage.findById(id);
    if (!project) return null;
    
    if (updates.teamMembers && Array.isArray(updates.teamMembers)) {
      // Keep as array, will be stringified by storage
    }
    if (updates.completionSummary && typeof updates.completionSummary === 'object') {
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

module.exports = new ProjectModel();
