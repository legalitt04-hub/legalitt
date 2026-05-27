require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  const email = process.argv[2];
  const targetRole = process.argv[3];

  if (!email || !targetRole) {
    console.log('Usage: node change-role.js <email> <client|advocate>');
    process.exit(1);
  }

  if (!['client', 'advocate'].includes(targetRole.toLowerCase())) {
    console.log('Error: Role must be either "client" or "advocate"');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to Database');

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      console.log(`❌ Error: User with email "${email}" not found.`);
      process.exit(1);
    }

    user.role = targetRole.toLowerCase();
    await user.save({ validateBeforeSave: false });

    console.log(`\n✅ Success! Updated role for user:`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 New Role: ${user.role}\n`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating role:', err.message);
    process.exit(1);
  }
};

run();
