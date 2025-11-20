const CSVStorage = require('./CSVStorage');
const FirebaseStorage = require('./FirebaseStorage');
const { getDatabase } = require('../services/firebase');

function createStorage(collectionName, columns = []) {
  const backend = (process.env.DATA_BACKEND || 'FIREBASE').toUpperCase();
  
  // If Firebase is not initialized and backend is FIREBASE, fall back to CSV
  if (backend === 'FIREBASE') {
    const db = getDatabase();
    if (!db) {
      console.warn(`⚠️  Firebase not initialized. Falling back to CSV storage for ${collectionName}`);
      return new CSVStorage(collectionName, columns);
    }
    return new FirebaseStorage(collectionName);
  }
  
  return new CSVStorage(collectionName, columns);
}

module.exports = createStorage;

