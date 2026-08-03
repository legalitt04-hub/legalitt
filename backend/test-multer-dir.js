const express = require('express');
const multer = require('multer');

const app = express();
// Using a non-existent absolute path
const upload = multer({ dest: '/tmp/nonexistent-uploads-dir-8732/' });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, message: 'Upload success' });
});

app.use((err, req, res, next) => {
  console.log("Error caught:", err.message);
  res.status(500).json({ error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(5003, () => console.log('Listening on 5003'));
