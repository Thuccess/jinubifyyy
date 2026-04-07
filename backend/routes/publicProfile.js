import express from 'express';
import { body, validationResult } from 'express-validator';
import { canonicalizeSocialLinks } from '../constants/socialPlatforms.js';
import User from '../models/User.js';
import PublicProfileEvent from '../models/PublicProfileEvent.js';

const router = express.Router();

function normalizeSlugParam(req) {
  return String(req.params.slug || '')
    .trim()
    .toLowerCase();
}

function normalizeWebsiteUrl(raw) {
  if (!raw || !String(raw).trim()) return '';
  const w = String(raw).trim();
  const withProto = w.startsWith('http') ? w : `https://${w}`;
  try {
    const u = new URL(withProto);
    if (!['http:', 'https:'].includes(u.protocol)) return '';
    return u.toString();
  } catch {
    return '';
  }
}

// @route   GET /api/public/profile/:slug
// @desc    Public read-only profile for approved users
// @access  Public
router.get('/profile/:slug', async (req, res) => {
  try {
    const slug = normalizeSlugParam(req);
    if (!slug) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const user = await User.findOne({ profileSlug: slug })
      .select(
        'name company accountType socialLinks status profileSlug phone website email photoURL industry qrCodeUrl publicTagline publicBio brandGuidelines preferredChannels',
      )
      .lean();

    if (!user || user.status !== 'approved') {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const viewCount = await PublicProfileEvent.countDocuments({
      profileSlug: slug,
      kind: 'view',
    });

    const accountType = user.accountType || 'business';
    const logoUrl = user.brandGuidelines?.logoUrl?.trim() || '';
    const displayName =
      accountType === 'business' && user.company?.trim() ? user.company.trim() : user.name;

    const heroImageUrl =
      accountType === 'business' && logoUrl ? logoUrl : user.photoURL || '';

    const websiteUrl = normalizeWebsiteUrl(user.website);
    const publicTagline = (user.publicTagline && String(user.publicTagline).trim()) || '';
    const industry = (user.industry && String(user.industry).trim()) || '';
    const tagline = publicTagline || industry || null;
    const about = (user.publicBio && String(user.publicBio).trim()) || '';
    const bg = user.brandGuidelines || {};
    const brandGuidelines = {
      toneOfVoice: (bg.toneOfVoice && String(bg.toneOfVoice).trim()) || '',
      primaryColor: (bg.primaryColor && String(bg.primaryColor).trim()) || '',
      secondaryColor: (bg.secondaryColor && String(bg.secondaryColor).trim()) || '',
    };
    const preferredChannels = Array.isArray(user.preferredChannels)
      ? user.preferredChannels.map((c) => String(c || '').trim()).filter(Boolean)
      : [];

    res.json({
      profile: {
        slug: user.profileSlug,
        username: user.profileSlug,
        accountType,
        displayName,
        name: user.name,
        company: user.company || '',
        publicTagline,
        industry,
        tagline,
        about,
        heroImageUrl,
        phone: (user.phone && String(user.phone).trim()) || '',
        website: websiteUrl,
        email: user.email,
        socialLinks: canonicalizeSocialLinks(user.socialLinks || []),
        preferredChannels,
        brandGuidelines,
        qrCodeUrl: user.qrCodeUrl || '',
        verified: true,
        viewCount,
      },
    });
  } catch (error) {
    console.error('Public profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/public/profile/:slug/view
// @desc    Record a profile page view (fire-and-forget friendly)
// @access  Public
router.post('/profile/:slug/view', (req, res) => {
  const slug = normalizeSlugParam(req);
  res.status(204).end();
  if (!slug) return;
  void (async () => {
    try {
      const exists = await User.findOne({ profileSlug: slug, status: 'approved' }).select('_id').lean();
      if (!exists) return;
      await PublicProfileEvent.create({
        profileSlug: slug,
        kind: 'view',
        target: '',
      });
    } catch (err) {
      console.error('Public profile view event error:', err.message);
    }
  })();
});

// @route   POST /api/public/profile/:slug/click
// @desc    Record a CTA / link click
// @access  Public
router.post(
  '/profile/:slug/click',
  [body('target').trim().notEmpty().isLength({ max: 64 }).withMessage('target is required')],
  (req, res) => {
    const slug = normalizeSlugParam(req);
    const errors = validationResult(req);
    if (!errors.isEmpty() || !slug) {
      return res.status(204).end();
    }
    const target = String(req.body.target || '').trim().slice(0, 64);
    res.status(204).end();
    void (async () => {
      try {
        const exists = await User.findOne({ profileSlug: slug, status: 'approved' }).select('_id').lean();
        if (!exists) return;
        await PublicProfileEvent.create({
          profileSlug: slug,
          kind: 'click',
          target,
        });
      } catch (err) {
        console.error('Public profile click event error:', err.message);
      }
    })();
  },
);

export default router;
