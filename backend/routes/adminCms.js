import express from 'express';
import SiteSettings from '../models/SiteSettings.js';
import Page from '../models/Page.js';
import Section from '../models/Section.js';
import NavItem from '../models/NavItem.js';
import { requireAdmin } from '../middleware/admin.js';
import { adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.use(adminLimiter);
router.use(requireAdmin);

// ——— Site settings (key-value) ———
router.get('/site-settings', async (req, res) => {
  try {
    const list = await SiteSettings.find({ isDeleted: false })
      .sort({ order: 1, key: 1 })
      .lean();
    res.json({ data: list });
  } catch (e) {
    console.error('Admin CMS site-settings list:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.put('/site-settings', async (req, res) => {
  try {
    const { key, value, isVisible, isDeleted, status, order } = req.body;
    if (!key) {
      return res.status(400).json({ message: 'key is required' });
    }
    const doc = await SiteSettings.findOneAndUpdate(
      { key },
      {
        $set: {
          ...(value !== undefined && { value }),
          ...(typeof isVisible === 'boolean' && { isVisible }),
          ...(typeof isDeleted === 'boolean' && { isDeleted }),
          ...(status && { status }),
          ...(typeof order === 'number' && { order }),
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    res.json({ data: doc });
  } catch (e) {
    console.error('Admin CMS site-settings put:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// ——— Nav items ———
router.get('/nav', async (req, res) => {
  try {
    const list = await NavItem.find({}).sort({ order: 1 }).lean();
    res.json({ data: list });
  } catch (e) {
    console.error('Admin CMS nav list:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.post('/nav', async (req, res) => {
  try {
    const { label, href, order, isVisible, status } = req.body;
    if (!label || !href) {
      return res.status(400).json({ message: 'label and href are required' });
    }
    const maxOrder = await NavItem.findOne().sort({ order: -1 }).select('order').lean();
    const orderNum = typeof order === 'number' ? order : (maxOrder?.order ?? -1) + 1;
    const doc = await NavItem.create({
      label,
      href,
      order: orderNum,
      isVisible: isVisible !== false,
      status: status || 'published',
    });
    res.status(201).json({ data: doc });
  } catch (e) {
    console.error('Admin CMS nav create:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.put('/nav/:id', async (req, res) => {
  try {
    const { label, href, isVisible, isDeleted, status, order } = req.body;
    const doc = await NavItem.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(label !== undefined && { label }),
          ...(href !== undefined && { href }),
          ...(typeof isVisible === 'boolean' && { isVisible }),
          ...(typeof isDeleted === 'boolean' && { isDeleted }),
          ...(status && { status }),
          ...(typeof order === 'number' && { order }),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Nav item not found' });
    res.json({ data: doc });
  } catch (e) {
    console.error('Admin CMS nav update:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.delete('/nav/:id', async (req, res) => {
  try {
    const doc = await NavItem.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true, updatedAt: new Date() } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Nav item not found' });
    res.json({ data: doc });
  } catch (e) {
    console.error('Admin CMS nav delete:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// ——— Pages ———
router.get('/pages', async (req, res) => {
  try {
    const list = await Page.find({}).sort({ order: 1, slug: 1 }).lean();
    res.json({ data: list });
  } catch (e) {
    console.error('Admin CMS pages list:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.post('/pages', async (req, res) => {
  try {
    const { slug, title, metaDescription, content, isVisible, status, order } = req.body;
    if (!slug) return res.status(400).json({ message: 'slug is required' });
    const doc = await Page.create({
      slug: slug.trim().toLowerCase(),
      title: title || '',
      metaDescription: metaDescription || '',
      content: content || {},
      isVisible: isVisible !== false,
      status: status || 'published',
      order: typeof order === 'number' ? order : 0,
    });
    res.status(201).json({ data: doc });
  } catch (e) {
    console.error('Admin CMS pages create:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.get('/pages/:id', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id).lean();
    if (!page) return res.status(404).json({ message: 'Page not found' });
    const sections = await Section.find({ page: page._id }).sort({ order: 1 }).lean();
    res.json({ data: { ...page, sections } });
  } catch (e) {
    console.error('Admin CMS page get:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.put('/pages/:id', async (req, res) => {
  try {
    const { slug, title, metaDescription, content, isVisible, isDeleted, status, order } = req.body;
    const update = {};
    if (slug !== undefined) update.slug = slug.trim().toLowerCase();
    if (title !== undefined) update.title = title;
    if (metaDescription !== undefined) update.metaDescription = metaDescription;
    if (content !== undefined) update.content = content;
    if (typeof isVisible === 'boolean') update.isVisible = isVisible;
    if (typeof isDeleted === 'boolean') update.isDeleted = isDeleted;
    if (status) update.status = status;
    if (typeof order === 'number') update.order = order;
    update.updatedAt = new Date();
    const doc = await Page.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Page not found' });
    res.json({ data: doc });
  } catch (e) {
    console.error('Admin CMS page update:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.delete('/pages/:id', async (req, res) => {
  try {
    const doc = await Page.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true, updatedAt: new Date() } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Page not found' });
    res.json({ data: doc });
  } catch (e) {
    console.error('Admin CMS page delete:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// ——— Sections (by page) ———
router.get('/pages/:pageId/sections', async (req, res) => {
  try {
    const list = await Section.find({ page: req.params.pageId }).sort({ order: 1 }).lean();
    res.json({ data: list });
  } catch (e) {
    console.error('Admin CMS sections list:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.post('/pages/:pageId/sections', async (req, res) => {
  try {
    const { sectionKey, content, isVisible, status, order } = req.body;
    if (!sectionKey) return res.status(400).json({ message: 'sectionKey is required' });
    const pageId = req.params.pageId;
    const maxOrder = await Section.findOne({ page: pageId }).sort({ order: -1 }).select('order').lean();
    const orderNum = typeof order === 'number' ? order : (maxOrder?.order ?? -1) + 1;
    const doc = await Section.create({
      page: pageId,
      sectionKey,
      content: content || {},
      isVisible: isVisible !== false,
      status: status || 'published',
      order: orderNum,
    });
    res.status(201).json({ data: doc });
  } catch (e) {
    console.error('Admin CMS section create:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.put('/pages/:pageId/sections/:id', async (req, res) => {
  try {
    const { sectionKey, content, isVisible, isDeleted, status, order } = req.body;
    const update = {};
    if (sectionKey !== undefined) update.sectionKey = sectionKey;
    if (content !== undefined) update.content = content;
    if (typeof isVisible === 'boolean') update.isVisible = isVisible;
    if (typeof isDeleted === 'boolean') update.isDeleted = isDeleted;
    if (status) update.status = status;
    if (typeof order === 'number') update.order = order;
    update.updatedAt = new Date();
    const doc = await Section.findOneAndUpdate(
      { _id: req.params.id, page: req.params.pageId },
      { $set: update },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Section not found' });
    res.json({ data: doc });
  } catch (e) {
    console.error('Admin CMS section update:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

router.delete('/pages/:pageId/sections/:id', async (req, res) => {
  try {
    const doc = await Section.findOneAndUpdate(
      { _id: req.params.id, page: req.params.pageId },
      { $set: { isDeleted: true, updatedAt: new Date() } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Section not found' });
    res.json({ data: doc });
  } catch (e) {
    console.error('Admin CMS section delete:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

export default router;
