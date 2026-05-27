const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'],
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['client', 'advocate', 'admin'],
    default: 'client',
  },
  avatar: {
    type: String,
    default: null,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  refreshTokens: {
    type: [String],
    select: false,
    default: [],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  fcmToken: String, // Firebase push notification token
  expoPushToken: String, // Expo push notification token
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  // New Profile Fields
  personal: {
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  preferences: {
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false }
  },
  emergency: {
    contactName: String,
    contactPhone: String,
    relationship: String
  },
  profileVersion: { type: Number, default: 1 },
  savedAdvocates: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Advocate'
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ role: 1 });

// Virtual: advocate profile link
userSchema.virtual('advocateProfile', {
  ref: 'Advocate',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Instance method: compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: check if password changed after token issued
userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Remove sensitive fields from JSON output
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
