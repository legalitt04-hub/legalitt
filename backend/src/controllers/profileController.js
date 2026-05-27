const User = require('../models/User');
const Advocate = require('../models/Advocate');
const { AppError } = require('../middlewares/errorHandler');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Calculate completeness here to avoid extra call
    let totalFields = 10;
    let filledFields = 0;
    if (user.name) filledFields++;
    if (user.email) filledFields++;
    if (user.phone) filledFields++;
    if (user.avatar) filledFields++;
    if (user.personal?.dateOfBirth) filledFields++;
    if (user.personal?.gender) filledFields++;
    if (user.address?.city) filledFields++;
    if (user.address?.pincode) filledFields++;
    if (user.emergency?.contactName) filledFields++;
    if (user.emergency?.contactPhone) filledFields++;
    const percentage = Math.round((filledFields / totalFields) * 100);

    res.json({ 
      success: true, 
      data: { ...user.toObject(), completeness: percentage } 
    });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, personal, address, preferences, emergency } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    // Update basic info
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Update nested objects safely
    if (personal) user.personal = { ...user.personal, ...personal };
    if (address) user.address = { ...user.address, ...address };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (emergency) user.emergency = { ...user.emergency, ...emergency };

    user.profileVersion += 1;
    await user.save();

    res.json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (err) { next(err); }
};

exports.getCompleteness = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    let totalFields = 10;
    let filledFields = 0;

    if (user.name) filledFields++;
    if (user.email) filledFields++;
    if (user.phone) filledFields++;
    if (user.avatar) filledFields++;
    if (user.personal?.dateOfBirth) filledFields++;
    if (user.personal?.gender) filledFields++;
    if (user.address?.city) filledFields++;
    if (user.address?.pincode) filledFields++;
    if (user.emergency?.contactName) filledFields++;
    if (user.emergency?.contactPhone) filledFields++;

    const percentage = Math.round((filledFields / totalFields) * 100);

    res.json({ success: true, data: { percentage } });
  } catch (err) { next(err); }
};

exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded', 400));
    
    const avatarUrl = req.file.path; // Cloudinary URL
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { avatar: avatarUrl }, 
      { new: true }
    );

    res.json({ success: true, data: user, message: 'Avatar updated successfully' });
  } catch (err) { next(err); }
};

// Toggle Save Advocate
exports.toggleSavedAdvocate = async (req, res, next) => {
  try {
    const { advocateId } = req.body;
    if (!advocateId) return next(new AppError('Advocate ID is required', 400));

    const user = await User.findById(req.user.id);
    
    const isSaved = user.savedAdvocates.includes(advocateId);
    
    if (isSaved) {
      user.savedAdvocates.pull(advocateId);
    } else {
      user.savedAdvocates.addToSet(advocateId);
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: isSaved ? 'Advocate removed from saved' : 'Advocate saved successfully',
      isSaved: !isSaved 
    });
  } catch (err) { next(err); }
};

// Get Saved Advocates
exports.getSavedAdvocates = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedAdvocates',
      populate: {
        path: 'user',
        select: 'name avatar email'
      }
    });

    res.json({ success: true, data: user.savedAdvocates });
  } catch (err) { next(err); }
};

// GDPR: Permanent Account & Data Deletion
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));

    // Delete advocate profile if exists
    await Advocate.findOneAndDelete({ user: userId });

    // Delete user record
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.'
    });
  } catch (err) { next(err); }
};
