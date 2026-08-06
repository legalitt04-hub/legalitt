const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
  try {
    // Get token by logging in as super admin
    const loginRes = await axios.post('https://legalitt-growth.onrender.com/api/v1/auth/login', {
      email: 'admin@legalitt.com',
      password: 'Admin@12345'
    });
    
    const token = loginRes.data.token;
    console.log("Logged in:", !!token);

    const form = new FormData();
    form.append('file', fs.createReadStream('advocates_sample.csv'));

    const uploadRes = await axios.post('https://legalitt-growth.onrender.com/api/v1/admin/advocates/bulk-upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Upload Success:", uploadRes.data);
  } catch (err) {
    console.error("Upload Error:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}
run();
