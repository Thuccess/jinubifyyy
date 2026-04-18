import express from 'express';
import { body, validationResult } from 'express-validator';
import QRCode from 'qrcode';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import User from '../models/User.js';
import PublicProfileEvent from '../models/PublicProfileEvent.js';
import { authenticate, verifyApproved } from '../middleware/auth.js';
import { blockRejectedWrites } from '../middleware/accountAccess.js';
import cloudinary from '../config/cloudinary.js';
import {
  canonicalizeSocialLinks,
  normalizeSocialPlatformKey,
  SOCIAL_PLATFORM_ORDER,
} from '../constants/socialPlatforms.js';
import { getPublicBaseUrl } from '../services/onboarding/qrService.js';

const router = express.Router();

const extractFilename = (input) => {
  if (!input) return '';
  const str = String(input);
  try {
    const url = new URL(str);
    const parts = url.pathname.split('/');
    return parts[parts.length - 1] || '';
  } catch {
    return str.split('/').pop() || '';
  }
};

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Normalize optional hex for brand guideline color fields. Empty string allowed.
 * @returns {string|{error:string}}
 */
function normalizeGuidelineHex(value) {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  if (s === '') return '';
  if (!HEX_COLOR_RE.test(s)) return { error: 'Color must be empty or #RGB / #RRGGBB hex' };
  return s;
}

/**
 * Merge incoming brandGuidelines with existing doc; only keys present on incoming are updated.
 * Validates hex fields when provided.
 */
function mergeBrandGuidelines(existing, incoming) {
  if (incoming === undefined) return { ok: true, value: undefined };
  if (incoming === null || typeof incoming !== 'object' || Array.isArray(incoming)) {
    return { ok: false, message: 'brandGuidelines must be an object' };
  }
  const ex = existing && typeof existing === 'object' ? { ...existing } : {};
  const out = { ...ex };
  const colorKeys = [
    'primaryColor',
    'secondaryColor',
    'publicProfileAccentColor',
    'publicProfileTextColor',
    'publicProfileBackgroundColor',
  ];
  for (const key of colorKeys) {
    if (!Object.prototype.hasOwnProperty.call(incoming, key)) continue;
    const n = normalizeGuidelineHex(incoming[key]);
    if (n && typeof n === 'object' && n.error) {
      return { ok: false, message: `${key}: ${n.error}` };
    }
    if (n !== undefined) out[key] = n;
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'logoUrl')) {
    out.logoUrl = incoming.logoUrl == null ? '' : String(incoming.logoUrl).trim().slice(0, 2000);
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'toneOfVoice')) {
    out.toneOfVoice =
      incoming.toneOfVoice == null ? '' : String(incoming.toneOfVoice).trim().slice(0, 2000);
  }
  return { ok: true, value: out };
}

function profilePayload(user) {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
    galleryImages: Array.isArray(user.galleryImages) ? user.galleryImages : [],
    balance: user.balance,
    status: user.status,
    rejectionReason: user.rejectionReason || '',
    company: user.company,
    industry: user.industry,
    publicTagline: user.publicTagline || '',
    publicBio: user.publicBio || '',
    professionalTitle: user.professionalTitle || '',
    skillsExpertise: Array.isArray(user.skillsExpertise) ? user.skillsExpertise : [],
    workExperience: Array.isArray(user.workExperience) ? user.workExperience : [],
    educationCertifications: Array.isArray(user.educationCertifications)
      ? user.educationCertifications
      : [],
    achievementsProjects: Array.isArray(user.achievementsProjects) ? user.achievementsProjects : [],
    personalInterests: Array.isArray(user.personalInterests) ? user.personalInterests : [],
    accountType: user.accountType,
    profileSlug: user.profileSlug,
    qrCodeUrl: user.qrCodeUrl,
    phone: user.phone || '',
    website: user.website || '',
    location: user.location || '',
    servicesOffered: Array.isArray(user.servicesOffered) ? user.servicesOffered : [],
    socialLinks: canonicalizeSocialLinks(user.socialLinks || []),
    preferredChannels: user.preferredChannels || [],
    brandGuidelines: (() => {
      const bg = user.brandGuidelines || {};
      return {
        primaryColor: bg.primaryColor || '',
        secondaryColor: bg.secondaryColor || '',
        logoUrl: bg.logoUrl || '',
        toneOfVoice: bg.toneOfVoice || '',
        publicProfileAccentColor: bg.publicProfileAccentColor || '',
        publicProfileTextColor: bg.publicProfileTextColor || '',
        publicProfileBackgroundColor: bg.publicProfileBackgroundColor || '',
      };
    })(),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function connectionUserPayload(user) {
  const isBusiness = user?.accountType === 'business';
  const displayName = isBusiness && user?.company ? user.company : user?.name || '';
  return {
    _id: user?._id,
    name: user?.name || '',
    displayName,
    profileSlug: user?.profileSlug || '',
    publicTagline: user?.publicTagline || '',
    photoURL: user?.photoURL || '',
  };
}

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'jinubify/avatars',
    resource_type: 'image',
    public_id: (_req, file) => {
      const parsed = path.parse(file.originalname || '');
      const base = (parsed.name || 'avatar').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'avatar';
      const timestamp = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      return `${base}-${timestamp}-${rand}`;
    },
    format: (_req, file) => {
      const parsed = path.parse(file.originalname || '');
      const ext = (parsed.ext || '').replace('.', '').toLowerCase();
      const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const safe = allowed.includes(ext) ? ext : 'jpg';
      return safe === 'jpeg' ? 'jpg' : safe;
    },
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

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

const normalizeWebsiteField = (raw) => {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  if (!s) return '';
  const withProto = s.startsWith('http') ? s : `https://${s}`;
  const u = new URL(withProto);
  if (!['http:', 'https:'].includes(u.protocol)) {
    throw new Error('Invalid website URL');
  }
  return u.toString();
};

const normalizeStringArrayField = (value, maxItems, maxItemLength) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || '').trim().slice(0, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
};

const normalizeUrlArrayField = (value, maxItems) => {
  if (!Array.isArray(value)) return [];
  const urls = [];
  for (const raw of value) {
    const s = String(raw || '').trim();
    if (!s) continue;
    try {
      const u = new URL(s);
      if (!['http:', 'https:'].includes(u.protocol)) continue;
      urls.push(u.toString().slice(0, 2000));
    } catch {
      // Skip invalid URLs silently; request validation handles strict checks.
    }
    if (urls.length >= maxItems) break;
  }
  return urls;
};

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private (verified email)
router.get('/profile', authenticate, verifyApproved, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user: profilePayload(user) });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/me
// @desc    Alias for current authenticated user profile
// @access  Private (verified email)
router.get('/me', authenticate, verifyApproved, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user: profilePayload(user) });
  } catch (error) {
    console.error('Get me profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/connections
// @desc    List saved connections for current user
// @access  Private (verified email)
router.get('/connections', authenticate, verifyApproved, async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('connections').lean();
    const ids = Array.isArray(me?.connections) ? me.connections : [];
    if (ids.length === 0) {
      return res.json({ connections: [] });
    }
    const users = await User.find({ _id: { $in: ids }, status: 'approved' })
      .select('name company accountType profileSlug publicTagline photoURL')
      .lean();
    const byId = new Map(users.map((u) => [String(u._id), connectionUserPayload(u)]));
    const ordered = ids.map((id) => byId.get(String(id))).filter(Boolean);
    return res.json({ connections: ordered });
  } catch (error) {
    console.error('List connections error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/connections/search?q=slug
// @desc    Search approved users by profile slug/name (only when query provided)
// @access  Private (verified email)
router.get('/connections/search', authenticate, verifyApproved, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().replace(/^@+/, '').toLowerCase();
    if (!q) return res.json({ results: [] });
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      status: 'approved',
      _id: { $ne: req.user._id },
      $or: [{ profileSlug: rx }, { name: rx }, { company: rx }],
    })
      .select('name company accountType profileSlug publicTagline photoURL')
      .limit(20)
      .lean();
    return res.json({ results: users.map(connectionUserPayload) });
  } catch (error) {
    console.error('Search connections error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/connections/:connectedUserId
// @desc    Add a connection
// @access  Private (verified email; not rejected)
router.post('/connections/:connectedUserId', authenticate, verifyApproved, blockRejectedWrites, async (req, res) => {
  try {
    const connectedUserId = String(req.params.connectedUserId || '');
    if (!mongoose.Types.ObjectId.isValid(connectedUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (String(req.user._id) === connectedUserId) {
      return res.status(400).json({ message: 'You cannot connect to yourself' });
    }
    const target = await User.findOne({ _id: connectedUserId, status: 'approved' })
      .select('name company accountType profileSlug publicTagline photoURL')
      .lean();
    if (!target) return res.status(404).json({ message: 'User not found' });
    const me = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { connections: target._id } },
      { new: true, runValidators: true },
    )
      .select('connections')
      .lean();
    return res.json({
      message: 'Connected',
      connected: true,
      connectionCount: Array.isArray(me?.connections) ? me.connections.length : 0,
      user: connectionUserPayload(target),
    });
  } catch (error) {
    console.error('Add connection error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/users/connections/:connectedUserId
// @desc    Remove a connection
// @access  Private (verified email; not rejected)
router.delete('/connections/:connectedUserId', authenticate, verifyApproved, blockRejectedWrites, async (req, res) => {
  try {
    const connectedUserId = String(req.params.connectedUserId || '');
    if (!mongoose.Types.ObjectId.isValid(connectedUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const me = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { connections: connectedUserId } },
      { new: true, runValidators: true },
    )
      .select('connections')
      .lean();
    return res.json({
      message: 'Connection removed',
      connectionCount: Array.isArray(me?.connections) ? me.connections.length : 0,
    });
  } catch (error) {
    console.error('Remove connection error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/analytics/summary
// @desc    Aggregate public profile events for the authenticated user's slug
// @access  Private (verified email)
router.get('/analytics/summary', authenticate, verifyApproved, async (req, res) => {
  try {
    const daysRaw = parseInt(String(req.query.days || '7'), 10);
    const periodDays = Number.isFinite(daysRaw) ? Math.min(90, Math.max(1, daysRaw)) : 7;
    const u = await User.findById(req.user._id).select('profileSlug').lean();
    const slug = u?.profileSlug ? String(u.profileSlug).toLowerCase().trim() : '';
    if (!slug) {
      return res.json({
        periodDays,
        profileViews: 0,
        qrScans: 0,
        linkClicks: 0,
        contactsSaved: 0,
        topLinks: [],
      });
    }
    const since = new Date(Date.now() - periodDays * 86400000);
    const base = { profileSlug: slug, createdAt: { $gte: since } };
    const [profileViews, qrScans, linkClicks, contactsSaved, topAgg] = await Promise.all([
      PublicProfileEvent.countDocuments({ ...base, kind: 'view', target: { $nin: ['qr'] } }),
      PublicProfileEvent.countDocuments({ ...base, kind: 'view', target: 'qr' }),
      PublicProfileEvent.countDocuments({ ...base, kind: 'click' }),
      PublicProfileEvent.countDocuments({ ...base, kind: 'contact_save' }),
      PublicProfileEvent.aggregate([
        { $match: { ...base, kind: 'click', target: { $nin: ['', null] } } },
        { $group: { _id: '$target', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);
    res.json({
      periodDays,
      profileViews,
      qrScans,
      linkClicks,
      contactsSaved,
      topLinks: topAgg.map((t) => ({ target: String(t._id || ''), count: t.count })),
    });
  } catch (error) {
    console.error('User analytics summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/me/qr
// @desc    QR code for user's public profile URL (tracking param in encoded URL only)
// @access  Private (verified email)
router.get('/me/qr', authenticate, verifyApproved, async (req, res) => {
  try {
    const dbUser = await User.findById(req.user._id).select('profileSlug qrCodeUrl').lean();
    const baseUrl = getPublicBaseUrl();
    const displayUrl = dbUser?.profileSlug
      ? `${baseUrl}/u/${dbUser.profileSlug}`
      : `${baseUrl}/user/${req.user._id}`;
    const encodeUrl = `${displayUrl}?ref=qr`;

    if (dbUser?.profileSlug && dbUser?.qrCodeUrl) {
      return res.json({
        message: 'QR code',
        qrDataUrl: dbUser.qrCodeUrl,
        profileUrl: displayUrl,
        profileUrlTracked: encodeUrl,
      });
    }
    const qrDataUrl = await QRCode.toDataURL(encodeUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
    });

    res.json({
      message: 'QR code generated',
      qrDataUrl,
      profileUrl: displayUrl,
      profileUrlTracked: encodeUrl,
    });
  } catch (error) {
    console.error('Generate profile QR error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/profile/avatar
// @desc    Upload profile avatar for authenticated user
// @access  Private (verified email; not rejected)
router.post('/profile/avatar', authenticate, verifyApproved, blockRejectedWrites, (req, res, next) => {
  avatarUpload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large. Max 5MB.' });
      return res.status(400).json({ message: err.message || 'Invalid file' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided. Use field name "image".' });
    }
    const url = req.file.path;
    const filename = extractFilename(url);
    return res.status(201).json({ url, filename, image: url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ message: 'Avatar upload failed', error: error.message });
  }
});

// @route   POST /api/users/social-links
// @desc    Upsert a social link (by platform key)
// @access  Private (verified email; not rejected)
router.post(
  '/social-links',
  authenticate,
  verifyApproved,
  blockRejectedWrites,
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
  },
);

// @route   DELETE /api/users/social-links/:platform
// @desc    Remove a social link by platform key
// @access  Private (verified email; not rejected)
router.delete('/social-links/:platform', authenticate, verifyApproved, blockRejectedWrites, async (req, res) => {
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
// @desc    Update user profile (identity dashboard)
// @access  Private (verified email; not rejected)
router.put(
  '/profile',
  authenticate,
  verifyApproved,
  blockRejectedWrites,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('photoURL')
      .optional({ values: 'null' })
      .custom((v) => {
        if (v === '' || v === null || v === undefined) return true;
        try {
          const u = new URL(String(v));
          return ['http:', 'https:'].includes(u.protocol);
        } catch {
          throw new Error('Photo URL must be a valid URL');
        }
      }),
    body('galleryImages').optional().isArray({ max: 4 }).withMessage('Gallery supports up to 4 images'),
    body('galleryImages.*')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Gallery image URL is too long')
      .custom((v) => {
        if (v === '' || v === null || v === undefined) return true;
        try {
          const u = new URL(String(v));
          return ['http:', 'https:'].includes(u.protocol);
        } catch {
          throw new Error('Gallery image URL must be a valid URL');
        }
      }),
    body('company').optional().trim(),
    body('industry').optional().trim(),
    body('publicTagline').optional().trim().isLength({ max: 220 }).withMessage('Tagline is too long'),
    body('publicBio').optional().trim().isLength({ max: 4000 }).withMessage('Bio is too long'),
    body('professionalTitle')
      .optional()
      .trim()
      .isLength({ max: 220 })
      .withMessage('Professional title is too long'),
    body('skillsExpertise').optional().isArray(),
    body('skillsExpertise.*').optional().trim().isLength({ max: 120 }),
    body('workExperience').optional().isArray(),
    body('workExperience.*').optional().trim().isLength({ max: 300 }),
    body('educationCertifications').optional().isArray(),
    body('educationCertifications.*').optional().trim().isLength({ max: 300 }),
    body('achievementsProjects').optional().isArray(),
    body('achievementsProjects.*').optional().trim().isLength({ max: 300 }),
    body('personalInterests').optional().isArray(),
    body('personalInterests.*').optional().trim().isLength({ max: 120 }),
    body('preferredChannels').optional().isArray().withMessage('Preferred channels must be an array'),
    body('profileSlug')
      .optional({ values: 'falsy' })
      .trim()
      .isLength({ min: 3, max: 64 })
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage('Slug must be lowercase letters, numbers, and single hyphens'),
    body('accountType').optional().isIn(['personal', 'business']).withMessage('Invalid account type'),
    body('phone').optional().trim().isLength({ max: 40 }),
    body('website').optional({ values: 'null' }).trim(),
    body('location').optional().trim().isLength({ max: 200 }),
    body('servicesOffered').optional().isArray(),
    body('servicesOffered.*').optional().trim().isLength({ max: 120 }),
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

      const {
        name,
        photoURL,
        galleryImages,
        company,
        industry,
        publicTagline,
        publicBio,
        professionalTitle,
        skillsExpertise,
        workExperience,
        educationCertifications,
        achievementsProjects,
        personalInterests,
        preferredChannels,
        brandGuidelines,
        profileSlug,
        accountType,
        phone,
        website,
        location,
        servicesOffered,
      } = req.body;

      if (profileSlug !== undefined && profileSlug !== null) {
        const slug = String(profileSlug).trim().toLowerCase();
        const taken = await User.findOne({
          profileSlug: slug,
          _id: { $ne: req.user._id },
        })
          .select('_id')
          .lean();
        if (taken) {
          return res.status(400).json({ message: 'This profile URL is already taken' });
        }
      }

      let websiteNorm;
      try {
        websiteNorm = website !== undefined ? normalizeWebsiteField(website) : undefined;
      } catch {
        return res.status(400).json({ message: 'Invalid website URL' });
      }

      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (photoURL !== undefined) updateData.photoURL = photoURL;
      if (galleryImages !== undefined) {
        updateData.galleryImages = normalizeUrlArrayField(galleryImages, 4);
      }
      if (company !== undefined) updateData.company = company;
      if (industry !== undefined) updateData.industry = industry;
      if (publicTagline !== undefined) updateData.publicTagline = publicTagline;
      if (publicBio !== undefined) updateData.publicBio = publicBio;
      if (professionalTitle !== undefined) updateData.professionalTitle = professionalTitle;
      if (skillsExpertise !== undefined) {
        updateData.skillsExpertise = normalizeStringArrayField(skillsExpertise, 30, 120);
      }
      if (workExperience !== undefined) {
        updateData.workExperience = normalizeStringArrayField(workExperience, 20, 300);
      }
      if (educationCertifications !== undefined) {
        updateData.educationCertifications = normalizeStringArrayField(educationCertifications, 20, 300);
      }
      if (achievementsProjects !== undefined) {
        updateData.achievementsProjects = normalizeStringArrayField(achievementsProjects, 20, 300);
      }
      if (personalInterests !== undefined) {
        updateData.personalInterests = normalizeStringArrayField(personalInterests, 30, 120);
      }
      if (preferredChannels !== undefined) updateData.preferredChannels = preferredChannels;
      if (brandGuidelines !== undefined) {
        const currentUser = await User.findById(req.user._id).select('brandGuidelines').lean();
        const merged = mergeBrandGuidelines(currentUser?.brandGuidelines, brandGuidelines);
        if (!merged.ok) {
          return res.status(400).json({ message: merged.message || 'Invalid brand guidelines' });
        }
        updateData.brandGuidelines = merged.value;
      }
      if (profileSlug !== undefined && profileSlug !== null) {
        updateData.profileSlug = String(profileSlug).trim().toLowerCase();
      }
      if (accountType !== undefined) updateData.accountType = accountType;
      if (phone !== undefined) updateData.phone = String(phone).trim();
      if (websiteNorm !== undefined) updateData.website = websiteNorm;
      if (location !== undefined) updateData.location = String(location).trim();
      if (servicesOffered !== undefined) {
        updateData.servicesOffered = normalizeStringArrayField(servicesOffered, 24, 120);
      }

      const user = await User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true, runValidators: true });

      res.json({
        message: 'Profile updated successfully',
        user: profilePayload(user),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
);

export default router;
