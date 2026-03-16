import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const signupValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
  body('photoURL').isURL().withMessage('Photo URL must be a valid URL'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('website').optional().isURL().withMessage('Website URL must be a valid URL'),
];

// @route   POST /api/auth/register
// @desc    Register a new user for manual approval
// @access  Public
router.post(
  '/register',
  signupValidators,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map((err) => ({
            field: err.path || err.param,
            message: err.msg,
          })),
        });
      }

      const { name, email, password, photoURL, phone, company, website } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const user = new User({
        name,
        email,
        password,
        photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        phone,
        company,
        website: website || '',
        status: 'pending',
      });

      await user.save();

      res.status(201).json({
        message:
          'Your account has been submitted for approval. You will be able to log in once the admin approves your request.',
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
  }
);

// @route   POST /api/auth/signup
// @desc    Register a new user (legacy, immediate access)
// @access  Public
router.post(
  '/signup',
  [
    ...signupValidators,
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
          })),
        });
      }

      const { name, email, password, photoURL, phone, company, website } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        phone,
        company,
        website: website || '',
        status: 'approved',
      });

      await user.save();

      res.status(201).json({
        message:
          'Your account has been created. You can log in immediately because this signup endpoint auto-approves users.',
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error during signup', error: error.message });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
          })),
        });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        logger.warn('Authentication failure: user not found', { email: email?.slice(0, 3) + '***' });
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn('Authentication failure: invalid password', { userId: user._id?.toString() });
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Manual approval flow: check status (admins and super_admins can always log in)
      const isAdmin = user.role === 'admin' || user.role === 'super_admin';
      if (!isAdmin) {
        if (user.status === 'pending') {
          return res.status(403).json({ message: 'Your account is awaiting admin approval.' });
        }
        if (user.status === 'rejected') {
          return res.status(403).json({ message: 'Your registration was not approved.' });
        }
      }
      // Legacy users with no status are treated as approved

      // Track login timestamp and activity
      user.lastLoginAt = new Date();
      await user.save();

      try {
        await Activity.create({
          userId: user._id,
          type: 'login',
          action: 'Client login',
          entityType: 'user',
          entityId: user._id.toString(),
          description: `User ${user.email} logged in`,
          metadata: {},
        });
      } catch (activityError) {
        logger.warn('Failed to record login activity', { error: activityError.message });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
          role: user.role,
          balance: user.balance,
          status: user.status,
          lastLoginAt: user.lastLoginAt,
        },
      });
    } catch (error) {
      logger.error('Login error', { error: error.message });
      res.status(500).json({ message: 'Server error during login', error: error.message });
    }
  }
);

// @route   POST /api/auth/promote-admin
// @desc    Promote a user to admin by email (development only)
// @access  Public – only when NODE_ENV !== 'production'
router.post(
  '/promote-admin',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Not found' });
    }
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0]?.msg || 'Validation failed' });
      }
      const { email } = req.body;
      const user = await User.findOneAndUpdate(
        { email },
        { role: 'admin' },
        { new: true }
      ).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found with this email' });
      }
      res.json({
        message: 'User promoted to admin',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
          role: user.role,
          balance: user.balance,
        },
      });
    } catch (error) {
      console.error('Promote admin error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        photoURL: req.user.photoURL,
        balance: req.user.balance,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

