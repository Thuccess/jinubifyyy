import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Don't return password by default
  },
  photoURL: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=random',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  balance: {
    type: Number,
    default: 50.0,
  },
  role: {
    type: String,
    enum: ['user', 'editor', 'admin', 'super_admin'],
    default: 'user',
  },
  // Email verification state for signup/login gating.
  isEmailVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  emailVerificationToken: {
    type: String,
    default: null,
    index: true,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  // Optional profile / brand fields
  company: {
    type: String,
    trim: true,
    default: '',
  },
  website: {
    type: String,
    trim: true,
    default: '',
  },
  industry: {
    type: String,
    trim: true,
    default: '',
  },
  preferredChannels: [
    {
      type: String,
      trim: true,
    },
  ],
  brandGuidelines: {
    primaryColor: { type: String, trim: true, default: '' },
    secondaryColor: { type: String, trim: true, default: '' },
    logoUrl: { type: String, trim: true, default: '' },
    toneOfVoice: { type: String, trim: true, default: '' },
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update the updatedAt field before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Indexes for performance
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;

