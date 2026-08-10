const mongoose = require('mongoose');
const uri = "mongodb+srv://legalitt_admin:iIbMGpbZSMkFf16G@legalitt-prod.sjiugqg.mongodb.net/legalitt?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({ role: { $nin: ['client', 'advocate'] } }).toArray();
    console.log(users.map(u => ({ email: u.email, role: u.role, name: u.name })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
