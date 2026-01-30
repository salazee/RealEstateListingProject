// scripts/createSuperAdmin.js
// Run this ONCE to create your first super admin
// Usage: node scripts/createSuperAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../model/auth');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to database');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      email: 'zainabsalawudeen03@gmail.com',
      role: 'admin' 
    });

    if (existingSuperAdmin) {
      console.log('Super admin already exists!');
      console.log('Email:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin credentials
    const superAdminData = {
        name: 'Zainab Super Admin',
        email: 'zainabsalawudeen03@gmail.com',
      password: '@SuperAdminPOWERFUL', 
      role: 'admin',
      isVerified: true,
      isActive: true
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(superAdminData.password, salt);

    // Create super admin
    const superAdmin = new User({
      name: superAdminData.name,
      email: superAdminData.email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    await superAdmin.save();

    console.log(' Super Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', superAdminData.email);
    console.log('Password:', superAdminData.password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' IMPORTANT: Change the password immediately after first login!');
    console.log(' Update the email in this script before running again!');

    process.exit(0);
  } catch (error) {
    console.error(' Error creating super admin:', error.message);
    process.exit(1);
  }
};

createSuperAdmin();
