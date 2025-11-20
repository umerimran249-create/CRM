const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const CSVStorage = require('../utils/CSVStorage');
const FirebaseStorage = require('../utils/FirebaseStorage');

const COLLECTIONS = [
  {
    name: 'users',
    columns: [
      { id: '_id' },
      { id: 'name' },
      { id: 'email' },
      { id: 'password' },
      { id: 'role' },
      { id: 'department' },
      { id: 'permissions' },
      { id: 'isActive' },
      { id: 'createdAt' },
      { id: 'updatedAt' },
    ],
  },
  {
    name: 'clients',
    columns: [
      { id: '_id' },
      { id: 'name' },
      { id: 'contactInfo' },
      { id: 'industry' },
      { id: 'contractDate' },
      { id: 'accountManager' },
      { id: 'status' },
      { id: 'notes' },
      { id: 'createdAt' },
      { id: 'updatedAt' },
    ],
  },
  {
    name: 'projects',
    columns: [
      { id: '_id' },
      { id: 'name' },
      { id: 'client' },
      { id: 'category' },
      { id: 'description' },
      { id: 'startDate' },
      { id: 'endDate' },
      { id: 'status' },
      { id: 'estimatedBudget' },
      { id: 'actualExpenses' },
      { id: 'revenueReceived' },
      { id: 'projectLead' },
      { id: 'teamMembers' },
      { id: 'completionSummary' },
      { id: 'createdAt' },
      { id: 'updatedAt' },
    ],
  },
  {
    name: 'tasks',
    columns: [
      { id: '_id' },
      { id: 'title' },
      { id: 'description' },
      { id: 'project' },
      { id: 'assignedTo' },
      { id: 'dueDate' },
      { id: 'status' },
      { id: 'priority' },
      { id: 'checklist' },
      { id: 'attachments' },
      { id: 'internalNotes' },
      { id: 'activityLog' },
      { id: 'deliverables' },
      { id: 'createdAt' },
      { id: 'updatedAt' },
    ],
  },
  {
    name: 'finance',
    columns: [
      { id: '_id' },
      { id: 'type' },
      { id: 'project' },
      { id: 'date' },
      { id: 'amount' },
      { id: 'description' },
      { id: 'category' },
      { id: 'enteredBy' },
      { id: 'invoiceNumber' },
      { id: 'paymentDeadline' },
      { id: 'isPaid' },
      { id: 'createdAt' },
      { id: 'updatedAt' },
    ],
  },
];

async function migrateCollection({ name, columns }) {
  const csvStorage = new CSVStorage(name, columns);
  const firebaseStorage = new FirebaseStorage(name);

  console.log(`📦 Migrating ${name}...`);
  const records = await csvStorage.readAll();

  if (!records.length) {
    console.log(`   No records found in ${name}. Skipping.`);
    return;
  }

  await firebaseStorage.writeAll(records);
  console.log(`   ✅ Migrated ${records.length} ${name} records`);
}

async function migrate() {
  try {
    for (const collection of COLLECTIONS) {
      await migrateCollection(collection);
    }
    console.log('\n🎉 Migration complete! Firebase now contains your CSV data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

