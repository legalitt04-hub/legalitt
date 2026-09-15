const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    // 1. Log in to get token
    const loginRes = await axios.post("https://legalitt-growth.onrender.com/api/v1/auth/login", {
      email: "testclient@legalitt.com",
      password: "Client@123"
    });
    const token = loginRes.data.data.accessToken;

    // 2. Create a dummy file
    fs.writeFileSync('dummy.txt', 'This is a test document');

    // 3. Upload file
    const form = new FormData();
    form.append('file', fs.createReadStream('dummy.txt'), {
      filename: 'dummy.txt',
      contentType: 'text/plain'
    });

    console.log("Uploading...");
    const uploadRes = await axios.post("https://legalitt-growth.onrender.com/api/v1/uploads/document", form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Upload Success:", uploadRes.data);
    fs.unlinkSync('dummy.txt');
  } catch (err) {
    console.error("Upload Failed:", err?.response?.data || err.message);
    if (fs.existsSync('dummy.txt')) fs.unlinkSync('dummy.txt');
  }
}
testUpload();
