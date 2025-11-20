const admin = require('firebase-admin');

let database = null;
let initializationAttempted = false;

function initializeFirebase() {
  if (database || initializationAttempted) return database;
  initializationAttempted = true;

  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_DATABASE_URL',
  ];

  const hasAllEnv = requiredEnvVars.every((key) => Boolean(process.env[key]));
  if (!hasAllEnv) {
    console.warn(
      'Firebase not initialized: missing credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL.'
    );
    return null;
  }

  try {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    database = admin.database();
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    database = null;
  }

  return database;
}

function getDatabase() {
  return database || initializeFirebase();
}

async function setData(path, value) {
  const db = getDatabase();
  if (!db) return null;
  await db.ref(path).set(value);
  return value;
}

async function updateData(path, value) {
  const db = getDatabase();
  if (!db) return null;
  await db.ref(path).update(value);
  return value;
}

async function pushData(path, value) {
  const db = getDatabase();
  if (!db) return null;
  const ref = db.ref(path).push();
  await ref.set(value);
  return { key: ref.key, ...value };
}

async function removeData(path) {
  const db = getDatabase();
  if (!db) return null;
  await db.ref(path).remove();
}

module.exports = {
  getDatabase,
  setData,
  updateData,
  pushData,
  removeData,
};

