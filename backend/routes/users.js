import express from 'express';
import { body, validationResult } from 'express-validator';
import QRCode from 'qrcode';
import User from '../models/User.js';
import { authenticate, verifyApproved } from '../middleware/auth.js';
import {
  canonicalizeSocialLinks,
  normalizeSocialPlatformKey,
  SOCIAL_PLATFORM_ORDER,
} from '../constants/socialPlatforms.js';
import { getPublicBaseUrl } from '../services/onboarding/qrService.js';

const router = express.Router();

const normalizeSocialUrl = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return '';
  const withProto = s.startsWith('http') ? s : `https://${s}`;
  const u = new URL(withProto);
  if (!['http:', 'https:'].includes(u.protocol)) {
    throw new Error('Invalid URL');
  }
  return u.toString();
};

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, verifyApproved, async (req, res) => {
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
        publicTagline: user.publicTagline || '',
        publicBio: user.publicBio || '',
        accountType: user.accountType,
        profileSlug: user.profileSlug,
        qrCodeUrl: user.qrCodeUrl,
        socialLinks: canonicalizeSocialLinks(user.socialLinks || []),
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

// @route   GET /api/users/me
// @desc    Alias for current authenticated user profile
// @access  Private
router.get('/me', authenticate, verifyApproved, async (req, res) => {
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
        publicTagline: user.publicTagline || '',
        publicBio: user.publicBio || '',
        accountType: user.accountType,
        profileSlug: user.profileSlug,
        qrCodeUrl: user.qrCodeUrl,
        socialLinks: canonicalizeSocialLinks(user.socialLinks || []),
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
    console.error('Get me profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/me/qr
// @desc    Generate QR code for user's public profile URL
// @access  Private
router.get('/me/qr', authenticate, verifyApproved, async (req, res) => {
  try {
    const dbUser = await User.findById(req.user._id).select('profileSlug qrCodeUrl').lean();
    const baseUrl = getPublicBaseUrl();
    if (dbUser?.profileSlug && dbUser?.qrCodeUrl) {
      return res.json({
        message: 'QR code',
        qrDataUrl: dbUser.qrCodeUrl,
        profileUrl: `${baseUrl}/u/${dbUser.profileSlug}`,
      });
    }
    const profileUrl = `${baseUrl}/user/${req.user._id}`;
    const qrDataUrl = await QRCode.toDataURL(profileUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
    });

    res.json({
      message: 'QR code generated',
      qrDataUrl,
      profileUrl,
    });
  } catch (error) {
    console.error('Generate profile QR error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/social-links
// @desc    Upsert a social link (by platform key)
// @access  Private + approved
router.post(
  '/social-links',
  authenticate,
  verifyApproved,
  [body('platform').trim().notEmpty().withMessage('platform is required')],
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
      const canonical = normalizeSocialPlatformKey(req.body.platform);
      if (!canonical) {
        return res.status(400).json({
          message: `Unsupported platform. Use one of: ${SOCIAL_PLATFORM_ORDER.join(', ')}`,
          allowedPlatforms: [...SOCIAL_PLATFORM_ORDER],
        });
      }
      let urlNorm;
      try {
        urlNorm = normalizeSocialUrl(req.body.url);
      } catch {
        return res.status(400).json({ message: 'Valid https URL is required' });
      }
      if (!urlNorm) {
        return res.status(400).json({ message: 'URL is required' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const map = new Map();
      for (const l of user.socialLinks || []) {
        const k = normalizeSocialPlatformKey(l.platform);
        if (k) map.set(k, { platform: k, url: l.url });
      }
      map.set(canonical, { platform: canonical, url: urlNorm });
      user.socialLinks = SOCIAL_PLATFORM_ORDER.filter((k) => map.has(k)).map((k) => map.get(k));
      await user.save();

      res.json({
        message: 'Social link saved',
        socialLinks: canonicalizeSocialLinks(user.socialLinks || []),
      });
    } catch (error) {
      console.error('Save social link error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   DELETE /api/users/social-links/:platform
// @desc    Remove a social link by platform key
// @access  Private + approved
router.delete('/social-links/:platform', authenticate, verifyApproved, async (req, res) => {
  try {
    const canonical = normalizeSocialPlatformKey(req.params.platform);
    if (!canonical) {
      return res.status(400).json({ message: 'Unknown platform', allowedPlatforms: [...SOCIAL_PLATFORM_ORDER] });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const map = new Map();
    for (const l of user.socialLinks || []) {
      const k = normalizeSocialPlatformKey(l.platform);
      if (k) map.set(k, { platform: k, url: l.url });
    }
    map.delete(canonical);
    user.socialLinks = SOCIAL_PLATFORM_ORDER.filter((k) => map.has(k)).map((k) => map.get(k));
    await user.save();

    res.json({
      message: 'Social link removed',
      socialLinks: canonicalizeSocialLinks(user.socialLinks || []),
    });
  } catch (error) {
    console.error('Delete social link error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  authenticate,
  verifyApproved,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('photoURL').optional().isURL().withMessage('Photo URL must be a valid URL'),
    body('company').optional().trim(),
    body('industry').optional().trim(),
    body('publicTagline').optional().trim().isLength({ max: 220 }).withMessage('Tagline is too long'),
    body('publicBio').optional().trim().isLength({ max: 4000 }).withMessage('Bio is too long'),
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

      const { name, photoURL, company, industry, publicTagline, publicBio, preferredChannels, brandGuidelines } =
        req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (photoURL !== undefined) updateData.photoURL = photoURL;
      if (company !== undefined) updateData.company = company;
      if (industry !== undefined) updateData.industry = industry;
      if (publicTagline !== undefined) updateData.publicTagline = publicTagline;
      if (publicBio !== undefined) updateData.publicBio = publicBio;
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
          publicTagline: user.publicTagline || '',
          publicBio: user.publicBio || '',
          accountType: user.accountType,
          profileSlug: user.profileSlug,
          qrCodeUrl: user.qrCodeUrl,
          socialLinks: canonicalizeSocialLinks(user.socialLinks || []),
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

