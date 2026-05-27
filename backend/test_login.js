require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User');
  const user = await User.findOne({ email: 'advocate@test.com' }).select('+password');
  
  console.log('Testing password: Test@12345');
  
  const isMatch = await user.comparePassword('Test@12345');
  console.log('Password match:', isMatch);
  
  if (!isMatch) {
    console.log('\n❌ Password does NOT match!');
    console.log('Resetting password now...\n');
    
    const bcrypt = require('bcryptjs');
    user.password = await bcrypt.hash('Test@12345', 10);
    await user.save();
    
    console.log('✅ Password reset complete!');
    console.log('Try logging in again with:');
    console.log('Email: advocate@test.com');
    console.log('Password: Test@12345');
  } else {
    console.log('✅ Password is correct! Login should work.');
  }
  
  process.exit(0);
});
