const createStorage = require('../utils/storageFactory');
const bcrypt = require('bcryptjs');
const { getPermissionsForRole } = require('../constants/permissions');

class UserModel {
  constructor() {
    this.storage = createStorage('users', [
      { id: '_id', title: '_id' },
      { id: 'name', title: 'name' },
      { id: 'email', title: 'email' },
      { id: 'password', title: 'password' },
      { id: 'role', title: 'role' },
      { id: 'department', title: 'department' },
      { id: 'permissions', title: 'permissions' },
      { id: 'isActive', title: 'isActive' },
      { id: 'createdAt', title: 'createdAt' },
      { id: 'updatedAt', title: 'updatedAt' },
    ]);
  }

  async findOne(query) {
    const users = await this.storage.find(query);
    return users[0] || null;
  }

  async findById(id) {
    return await this.storage.findById(id);
  }

  async find(query = {}) {
    return await this.storage.find(query);
  }

  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const permissions = Array.isArray(data.permissions) && data.permissions.length
      ? data.permissions
      : getPermissionsForRole(data.role);

    return await this.storage.create({
      ...data,
      permissions,
      password: hashedPassword,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  async findByIdAndUpdate(id, updates) {
    const user = await this.storage.findById(id);
    if (!user) return null;
    
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    if (updates.permissions && !Array.isArray(updates.permissions)) {
      updates.permissions = [updates.permissions];
    } else if (!updates.permissions && updates.role && !user.permissions) {
      updates.permissions = getPermissionsForRole(updates.role);
    }
    
    return await this.storage.update(id, updates);
  }

  async findByIdAndDelete(id) {
    return await this.storage.delete(id);
  }

  async comparePassword(user, candidatePassword) {
    return bcrypt.compare(candidatePassword, user.password);
  }
}

module.exports = new UserModel();
