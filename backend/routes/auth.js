import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { authenticate, verifyApproved } from '../middleware/auth.js';
import { signAccessToken } from '../utils/accessToken.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';
import { registerOnboardingValidators } from '../utils/onboardingValidators.js';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

const hashVerificationToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// Generate raw token, but only store its hash in DB for safety.
const setEmailVerificationToken = (user) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = hashVerificationToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  user.isEmailVerified = false;
  return rawToken;
};

const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests / minute / IP
  message: 'Too many verification resend attempts. Please try again in a minute.',
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/auth/register
// @desc    Register a new user for manual approval
// @access  Public
router.post(
  '/register',
  registerOnboardingValidators,
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

      const {
        name,
        email,
        password,
        photoURL,
        phone: phoneRaw,
        company: companyRaw,
        website: websiteRaw,
        industry: industryRaw,
      } = req.body;
      const accountType = req.body.accountType === 'personal' ? 'personal' : 'business';
      const phone = (phoneRaw && String(phoneRaw).trim()) || '';
      const company =
        accountType === 'personal' ? '' : (companyRaw && String(companyRaw).trim()) || '';
      let website = '';
      if (websiteRaw && String(websiteRaw).trim()) {
        const w = String(websiteRaw).trim();
        website = w.startsWith('http') ? w : `https://${w}`;
      }
      const industry =
        accountType === 'personal' ? '' : (industryRaw && String(industryRaw).trim()) || '';

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
        website,
        industry,
        accountType,
        status: 'pending',
        isEmailVerified: false,
        socialLinks: [],
      });

      const rawVerificationToken = setEmailVerificationToken(user);
      await user.save();
      // Hardening: do not fail account creation if email delivery fails.
      // User remains created and can request resend later.
      try {
        await sendVerificationEmail(user, rawVerificationToken);
        res.status(201).json({
          message: 'Check your email to verify your account',
        });
      } catch (emailError) {
        logger.error('Register verification email send failed', {
          error: emailError.message,
          userId: user._id?.toString(),
          email: user.email,
        });
        res.status(201).json({
          message: 'Account created, but verification email failed. Please use resend verification.',
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
  }
);

// DEPRECATED: legacy /signup route removed. Use POST /register (pending approval).

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

      const email = String(req.body.email || '').toLowerCase().trim();
      const { password } = req.body;

      // Find user and include password for comparison (email stored lowercase; match explicitly)
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

      // Enforce email verification before allowing login.
      if (user.isEmailVerified === false) {
        return res.status(403).json({ message: 'Please verify your email before logging in' });
      }

      // Hardening: account must also be approved (applies to all roles).
      if (user.status === 'pending') {
        return res.status(403).json({ message: 'Your account is under review' });
      }
      if (user.status === 'rejected') {
        return res.status(403).json({
          message: 'Your application was not approved',
          rejectionReason: user.rejectionReason || undefined,
        });
      }
      if (user.status !== 'approved') {
        return res.status(403).json({ message: 'Your account is under review' });
      }

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

      const token = signAccessToken(user);

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

// @route   GET /api/auth/verify-email?token=...
// @desc    Verify user email address
// @access  Public
router.get('/verify-email', async (req, res) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const hashedToken = hashVerificationToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({
      message: 'Email verified successfully',
      status: user.status,
    });
  } catch (error) {
    logger.error('Verify email error', { error: error.message });
    return res.status(500).json({ message: 'Server error during email verification', error: error.message });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification link
// @access  Public
router.post(
  '/resend-verification',
  resendVerificationLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')],
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

      const { email } = req.body;
      const user = await User.findOne({ email });
      // Hardening: prevent account enumeration by always returning the same message.
      // Only send when account exists and is not verified.
      if (user && !user.isEmailVerified) {
        const rawVerificationToken = setEmailVerificationToken(user);
        await user.save();
        try {
          await sendVerificationEmail(user, rawVerificationToken);
        } catch (emailError) {
          logger.error('Resend verification email send failed', {
            error: emailError.message,
            userId: user._id?.toString(),
            email: user.email,
          });
        }
      }

      return res.json({ message: 'If an account exists, a verification email has been sent.' });
    } catch (error) {
      logger.error('Resend verification error', { error: error.message });
      return res.status(500).json({ message: 'Server error during verification resend', error: error.message });
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
router.get('/me', authenticate, verifyApproved, async (req, res) => {
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

// TEMP TEST ROUTE: verify Gmail SMTP can send a message.
router.get('/test-email', async (req, res) => {
  try {
    await sendVerificationEmail(
      { email: process.env.SMTP_USER, name: 'Test User' },
      'test-token',
    );
    res.json({ message: 'Test email sent' });
  } catch (err) {
    console.error('Test email failed:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

