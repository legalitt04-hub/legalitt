const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary subfolder (e.g. 'avatars', 'documents')
 * @param {string} resourceType - 'image' | 'raw' | 'auto'
 */
exports.uploadBuffer = (buffer, folder, resourceType = 'auto') =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `legalitt/${folder}`,
        resource_type: resourceType,
        transformation: resourceType === 'image'
          ? [{ quality: 'auto:good', fetch_format: 'auto' }]
          : undefined,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error.message);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

/**
 * Delete a file from Cloudinary by public_id.
 */
exports.deleteFile = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    logger.error('Cloudinary delete error:', err.message);
  }
};

/**
 * Generate a signed URL for private files.
 */
exports.getSignedUrl = (publicId, options = {}) =>
  cloudinary.url(publicId, { sign_url: true, type: 'authenticated', ...options });
