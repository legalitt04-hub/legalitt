require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB successfully.');

    const email = 'admin@legalitt.com';
    const password = 'Admin@1234';
    
    // Hash password to match model logic
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = await User.findOneAndUpdate(
      { email: email },
      {
        name: 'Admin',
        email: email,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Success! Reset admin credentials to matching user input:');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: ${adminUser.role}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting admin:', err);
    process.exit(1);
  }
}

resetAdmin();
