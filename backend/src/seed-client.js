require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedClient() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB successfully.');

    // We will find or create the client user: client@legalitt.com / Seed@12345
    const email = 'client@legalitt.com';
    const password = 'Seed@12345';
    
    // Hash password to match model logic
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const clientUser = await User.findOneAndUpdate(
      { email: email },
      {
        name: 'Priya Verma',
        email: email,
        password: hashedPassword,
        role: 'client',
        isEmailVerified: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Success! Seeded client credentials:');
    console.log(`📧 Email: ${clientUser.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: ${clientUser.role}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding client:', err);
    process.exit(1);
  }
}

seedClient();
