import express from 'express';
import Page from '../models/Page.js';
import Section from '../models/Section.js';

const router = express.Router();

// @route   GET /api/pages/:slug
// @desc    Public: get published page with sections by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    if (!slug) {
      return res.status(400).json({ message: 'slug is required' });
    }

    const page = await Page.findOne({
      slug,
      isDeleted: false,
      isVisible: true,
      status: 'published',
    })
      .lean()
      .exec();

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const sections = await Section.find({
      page: page._id,
      isDeleted: false,
      isVisible: true,
      status: 'published',
    })
      .sort({ order: 1 })
      .lean()
      .exec();

    res.json({
      page: {
        _id: page._id,
        slug: page.slug,
        title: page.title,
        type: page.type,
        seo: page.seo || {},
        version: page.version,
        updatedAt: page.updatedAt,
        createdAt: page.createdAt,
      },
      sections,
    });
  } catch (error) {
    console.error('Public page by slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

