require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['client', 'advocate', 'admin'], default: 'client' },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@legalitt.com' });
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);
    const admin = await User.create({
      email: 'admin@legalitt.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'client',
      isActive: true
    });

    console.log('✅ Admin user created:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
