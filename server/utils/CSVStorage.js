const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class CSVStorage {
  constructor(fileName, columns) {
    this.fileName = fileName;
    this.columns = columns;
    this.dataDir = path.join(__dirname, '..', 'data');
    this.filePath = path.join(this.dataDir, `${fileName}.csv`);
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Initialize CSV file with headers if it doesn't exist
    if (!fs.existsSync(this.filePath)) {
      this.initializeFile();
    }
  }

  initializeFile() {
    const headers = this.columns.map(col => col.id);
    const headerRow = headers.join(',');
    fs.writeFileSync(this.filePath, headerRow + '\n');
  }

  async readAll() {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(this.filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Parse JSON fields
          Object.keys(data).forEach(key => {
            if (data[key] && (data[key].startsWith('{') || data[key].startsWith('['))) {
              try {
                data[key] = JSON.parse(data[key]);
              } catch (e) {
                // Keep as string if not valid JSON
              }
            }
          });
          results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  async find(query = {}) {
    const all = await this.readAll();
    return all.filter(item => {
      return Object.keys(query).every(key => {
        if (key.includes('.')) {
          // Handle nested queries like 'client._id'
          const [parent, child] = key.split('.');
          return item[parent] && JSON.parse(item[parent])[child] === query[key];
        }
        return item[key] === query[key] || item[key] === String(query[key]);
      });
    });
  }

  async findById(id) {
    const all = await this.readAll();
    return all.find(item => item._id === id) || null;
  }

  async findOne(query) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async create(data) {
    const all = await this.readAll();
    const _id = this.generateId();
    const now = new Date().toISOString();
    
    const newItem = {
      _id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    // Stringify object/array fields
    const itemToWrite = { ...newItem };
    this.columns.forEach(col => {
      if (typeof itemToWrite[col.id] === 'object' && itemToWrite[col.id] !== null) {
        itemToWrite[col.id] = JSON.stringify(itemToWrite[col.id]);
      } else if (itemToWrite[col.id] === undefined) {
        itemToWrite[col.id] = '';
      } else {
        itemToWrite[col.id] = String(itemToWrite[col.id]);
      }
    });

    all.push(newItem);
    await this.writeAll(all);
    return newItem;
  }

  async update(id, updates) {
    const all = await this.readAll();
    const index = all.findIndex(item => item._id === id);
    
    if (index === -1) return null;

    updates.updatedAt = new Date().toISOString();
    all[index] = { ...all[index], ...updates };
    await this.writeAll(all);
    return all[index];
  }

  async delete(id) {
    const all = await this.readAll();
    const filtered = all.filter(item => item._id !== id);
    await this.writeAll(filtered);
    return { _id: id };
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length;
  }

  async writeAll(data) {
    const csvWriter = createCsvWriter({
      path: this.filePath,
      header: this.columns.map(col => ({ id: col.id, title: col.id })),
    });

    const dataToWrite = data.map(item => {
      const row = {};
      this.columns.forEach(col => {
        if (typeof item[col.id] === 'object' && item[col.id] !== null) {
          row[col.id] = JSON.stringify(item[col.id]);
        } else {
          row[col.id] = item[col.id] || '';
        }
      });
      return row;
    });

    await csvWriter.writeRecords(dataToWrite);
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = CSVStorage;

