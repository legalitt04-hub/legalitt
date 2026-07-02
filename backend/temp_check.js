const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/legalitt')
  .then(async () => {
    const users = await mongoose.connection.collection('users').countDocuments();
    const advocates = await mongoose.connection.collection('advocates').countDocuments();
    console.log(`Local DB: ${users} users, ${advocates} advocates`);
    process.exit(0);
  }).catch(e => { console.log('Local DB fail:', e.message); process.exit(1); });
