import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        balance: user.balance,
        company: user.company,
        industry: user.industry,
        preferredChannels: user.preferredChannels || [],
        brandGuidelines: user.brandGuidelines || {
          primaryColor: '',
          secondaryColor: '',
          logoUrl: '',
          toneOfVoice: '',
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('photoURL').optional().isURL().withMessage('Photo URL must be a valid URL'),
    body('company').optional().trim(),
    body('industry').optional().trim(),
    body('preferredChannels').optional().isArray().withMessage('Preferred channels must be an array'),
  ],
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

      const { name, photoURL, company, industry, preferredChannels, brandGuidelines } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (photoURL !== undefined) updateData.photoURL = photoURL;
      if (company !== undefined) updateData.company = company;
      if (industry !== undefined) updateData.industry = industry;
      if (preferredChannels !== undefined) updateData.preferredChannels = preferredChannels;
      if (brandGuidelines !== undefined) updateData.brandGuidelines = brandGuidelines;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      res.json({
        message: 'Profile updated successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          photoURL: user.photoURL,
          balance: user.balance,
          company: user.company,
          industry: user.industry,
          preferredChannels: user.preferredChannels || [],
          brandGuidelines: user.brandGuidelines || {
            primaryColor: '',
            secondaryColor: '',
            logoUrl: '',
            toneOfVoice: '',
          },
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;

