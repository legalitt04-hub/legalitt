const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/legalitt';
    console.log('Connecting to MongoDB at', mongoURI);
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected.');

    const adminEmail = 'admin@legalitt.com';
    const adminPassword = 'AdminPassword123!';

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`Admin user already exists with email: ${adminEmail}`);
      // Force update password just in case
      existingAdmin.password = adminPassword; // pre-save hook will hash it
      await existingAdmin.save();
      console.log('Admin password reset to default.');
    } else {
      const newAdmin = new User({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '+919999999999',
        role: 'admin',
        isEmailVerified: true,
        isActive: true
      });
      await newAdmin.save();
      console.log(`Admin user created successfully with email: ${adminEmail}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
