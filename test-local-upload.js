const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'backend/.env' });

async function run() {
  const token = jwt.sign({ id: 'mock', role: 'superadmin' }, process.env.JWT_SECRET || 'secret');
  
  const form = new FormData();
  form.append('file', fs.createReadStream('advocates_sample.csv'));

  try {
    const res = await axios.post('http://localhost:5000/api/v1/admin/advocates/bulk-upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
