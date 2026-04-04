import express from 'express';
import TeamPage from '../models/TeamPage.js';
import { defaultTeamPublicPayload } from '../data/defaultTeamPublic.js';

const router = express.Router();

/**
 * GET /api/team
 * Public: get Team page content (hero + members)
 */
router.get('/', async (req, res) => {
  try {
    const doc = await TeamPage.findOne().lean();
    if (!doc) {
      res.set('Cache-Control', 'public, max-age=60');
      return res.json(defaultTeamPublicPayload);
    }
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=3600');
    res.json(doc);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
