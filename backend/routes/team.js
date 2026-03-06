import express from 'express';
import TeamPage from '../models/TeamPage.js';

const router = express.Router();

/**
 * GET /api/team
 * Public: get Team page content (hero + members)
 */
router.get('/', async (req, res) => {
  try {
    const doc = await TeamPage.findOne().lean();
    if (!doc) {
      return res.status(404).json({ message: 'Team content not found' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
