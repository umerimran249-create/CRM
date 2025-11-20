const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    const adminEmail = 'admin@crm.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin123', // Change this in production!
      role: 'Admin',
      department: 'Management',
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@crm.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the default password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
