import express from 'express';
import SiteSettings from '../models/SiteSettings.js';
import defaultSocials from '../data/defaultSocials.js';

const router = express.Router();

const SOCIALS_KEY = 'socials';

// Normalize unknown DB value into a safe { platform: string } object.
const normalizeSocialsValue = (value) => {
  const base = { ...defaultSocials };
  if (!value || typeof value !== 'object') return base;
  const obj = value;
  Object.keys(base).forEach((k) => {
    const v = obj?.[k];
    base[k] = typeof v === 'string' ? v : '';
  });
  return base;
};

// GET /api/site/socials — public access
router.get('/socials', async (req, res) => {
  try {
    const doc = await SiteSettings.findOne({
      key: SOCIALS_KEY,
      isDeleted: false,
      status: 'published',
      isVisible: true,
    }).lean();

    const socials = normalizeSocialsValue(doc?.value);
    res.json({ socials });
  } catch (e) {
    console.error('Get public socials error:', e);
    res.status(500).json({ message: 'Server error', error: e?.message });
  }
});

export default router;

