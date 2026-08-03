require('dotenv').config();
const app = require('./src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// mock token
const token = jwt.sign({ id: 'mocked_admin_id', role: 'superadmin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

console.log("Mock Token:", token);
app.listen(5001, () => {
  console.log("Server running on 5001");
});
