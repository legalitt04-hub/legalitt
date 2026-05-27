require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User');
  const user = await User.findOne({ email: 'advocate@test.com' }).select('+password');
  
  console.log('Found:', !!user);
  console.log('Email:', user?.email);
  console.log('Has password:', !!user?.password);
  console.log('Role:', user?.role);
  console.log('IsActive:', user?.isActive);
  
  process.exit(0);
});
