import express from 'express';
import Testimonial from '../models/Testimonial.js';

const router = express.Router();

/**
 * GET /api/testimonials
 * Public: list active testimonials for the home page (ordered by order, then createdAt)
 */
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('name title avatar text stars')
      .lean();

    res.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
