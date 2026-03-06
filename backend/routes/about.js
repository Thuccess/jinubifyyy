import express from 'express';
import AboutPage from '../models/AboutPage.js';

const router = express.Router();

/**
 * GET /api/about
 * Public: get About page content (single document)
 */
router.get('/', async (req, res) => {
  try {
    const doc = await AboutPage.findOne().lean();
    if (!doc) {
      return res.status(404).json({ message: 'About content not found' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Get about error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
