const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middlewares/auth');
const { AppError } = require('../middlewares/errorHandler');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new AppError('Only images and PDFs are allowed.', 400));
  },
});

const uploadToCloudinary = (buffer, folder, resourceType = 'auto') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `legalitt/${folder}`, resource_type: resourceType },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });

router.post('/avatar', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded.', 400));
    const result = await uploadToCloudinary(req.file.buffer, 'avatars', 'image');
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url });
    res.json({ success: true, data: { url: result.secure_url } });
  } catch (err) { next(err); }
});

router.post('/document', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded.', 400));
    const result = await uploadToCloudinary(req.file.buffer, 'documents');
    res.json({ success: true, data: { url: result.secure_url, name: req.file.originalname, size: req.file.size } });
  } catch (err) { next(err); }
});

module.exports = router;
