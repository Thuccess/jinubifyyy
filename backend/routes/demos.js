import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Demo, { slugifyTitle } from '../models/Demo.js';
import Service from '../models/Service.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

const DEMO_PAGE_SIZE = 100;

function parsePriceField(priceRaw) {
  if (priceRaw === '' || priceRaw === null || typeof priceRaw === 'undefined') return null;
  if (typeof priceRaw === 'number' && Number.isFinite(priceRaw)) {
    return priceRaw >= 0 ? priceRaw : null;
  }
  const s = String(priceRaw)
    .trim()
    .replace(/[$€£,\s]/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

async function ensureUniqueWebsiteSlug(excludeId, base) {
  const root = base || 'demo';
  let slug = root;
  let n = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const q = { websiteDemo: true, slug, isDeleted: { $ne: true } };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await Demo.exists(q);
    if (!exists) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

function normalizeWebsitePayload(body, { isCreate }) {
  const b = body && typeof body === 'object' ? body : {};
  const gallery = Array.isArray(b.gallery)
    ? b.gallery.map((x) => String(x ?? '').trim()).filter(Boolean)
    : [];
  const features = Array.isArray(b.features)
    ? b.features.map((x) => String(x ?? '').trim()).filter(Boolean)
    : [];
  const previewMode = b.previewMode === 'iframe' || b.previewMode === 'new_tab' ? b.previewMode : 'new_tab';
  const visibility = b.visibility === 'hidden' ? 'hidden' : 'active';
  const price = parsePriceField(b.price);
  const out = {
    websiteDemo: true,
    service: null,
    title: String(b.title ?? '').trim(),
    slug: String(b.slug ?? '').trim().toLowerCase(),
    category: String(b.category ?? '').trim(),
    demoUrl: String(b.demoUrl ?? '').trim(),
    previewMode,
    thumbnail: String(b.thumbnail ?? '').trim(),
    gallery,
    video: String(b.video ?? '').trim(),
    shortDescription: String(b.shortDescription ?? '').trim(),
    description: String(b.description ?? '').trim(),
    features,
    ctaPrimary: String(b.ctaPrimary ?? 'View Demo').trim() || 'View Demo',
    ctaSecondary: String(b.ctaSecondary ?? 'Get This Website').trim() || 'Get This Website',
    price,
    isFeatured: Boolean(b.isFeatured),
    visibility,
    isActive: b.isActive !== false && b.isActive !== 'false',
    tags: Array.isArray(b.tags) ? b.tags.map((t) => String(t ?? '').trim()).filter(Boolean) : [],
    techStack: Array.isArray(b.techStack)
      ? b.techStack.map((t) => String(t ?? '').trim()).filter(Boolean)
      : [],
    repoUrl: String(b.repoUrl ?? '').trim(),
    seoTitle: String(b.seoTitle ?? '').trim(),
    seoDescription: String(b.seoDescription ?? '').trim(),
  };
  if (isCreate) {
    out.order = typeof b.order === 'number' && Number.isFinite(b.order) ? b.order : 0;
  }
  return out;
}

function normalizeServiceDemoPayload(body) {
  const b = body && typeof body === 'object' ? body : {};
  const images = Array.isArray(b.images)
    ? b.images
        .map((img, i) => ({
          url: img.url && String(img.url).trim() ? String(img.url).trim() : '',
          order: typeof img.order === 'number' ? img.order : i,
        }))
        .filter((img) => img.url)
    : [];
  return {
    websiteDemo: false,
    service: b.service,
    title: String(b.title ?? '').trim(),
    slug: String(b.slug ?? '').trim().toLowerCase(),
    description: String(b.description ?? '').trim(),
    category: String(b.category ?? '').trim(),
    demoUrl: String(b.demoUrl ?? '').trim(),
    repoUrl: String(b.repoUrl ?? '').trim(),
    techStack: Array.isArray(b.techStack)
      ? b.techStack.map((s) => String(s ?? '').trim()).filter(Boolean)
      : [],
    tags: Array.isArray(b.tags) ? b.tags.map((s) => String(s ?? '').trim()).filter(Boolean) : [],
    isFeatured: Boolean(b.isFeatured),
    isActive: b.isActive !== false && b.isActive !== 'false',
    order: typeof b.order === 'number' && Number.isFinite(b.order) ? b.order : 0,
    images,
    coverImageUrl: b.coverImageUrl ? String(b.coverImageUrl).trim() : '',
    embeddedConfig: b.embeddedConfig,
    seoTitle: String(b.seoTitle ?? '').trim(),
    seoDescription: String(b.seoDescription ?? '').trim(),
  };
}

// ——— Public: website catalog ———
router.get('/website', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  try {
    const { category, featured, q } = req.query;
    const filter = {
      websiteDemo: true,
      isDeleted: { $ne: true },
      visibility: 'active',
      isActive: true,
    };
    if (category && String(category).trim()) {
      filter.category = new RegExp(
        '^' + String(category).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
        'i'
      );
    }
    if (String(featured).toLowerCase() === 'true') {
      filter.isFeatured = true;
    }
    if (q && String(q).trim()) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: rx },
        { shortDescription: rx },
        { description: rx },
        { category: rx },
      ];
    }
    const items = await Demo.find(filter).sort({ isFeatured: -1, order: 1, createdAt: -1 }).lean();
    res.json({ data: items });
  } catch (error) {
    console.error('List website demos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Admin: all website demos including hidden/inactive.
 * MUST be registered before GET /website/:slug — otherwise "manage" is treated as a demo slug and the list returns 404.
 */
router.get('/website/manage', requireAdmin, async (req, res) => {
  try {
    const items = await Demo.find({ websiteDemo: true, isDeleted: { $ne: true } })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ data: items });
  } catch (error) {
    console.error('Admin list website demos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/website/:slug', async (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  try {
    const slug = String(req.params.slug || '').toLowerCase();
    const updated = await Demo.findOneAndUpdate(
      {
        slug,
        websiteDemo: true,
        isDeleted: { $ne: true },
        visibility: 'active',
        isActive: true,
      },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Demo not found' });
    }

    res.json({ data: updated });
  } catch (error) {
    console.error('Get website demo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/website/:slug/click', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase();
    const doc = await Demo.findOneAndUpdate(
      {
        slug,
        websiteDemo: true,
        isDeleted: { $ne: true },
        visibility: 'active',
        isActive: true,
      },
      { $inc: { clicks: 1 } },
      { new: true }
    ).select('clicks slug').lean();

    if (!doc) {
      return res.status(404).json({ message: 'Demo not found' });
    }

    res.json({ data: { clicks: doc.clicks, slug: doc.slug } });
  } catch (error) {
    console.error('Demo click error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List service-linked demos (default) or ?catalog=website reuses /website semantics
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=3600');
  try {
    if (String(req.query.catalog || '').toLowerCase() === 'website') {
      const { category, featured, q } = req.query;
      const filter = {
        websiteDemo: true,
        isDeleted: { $ne: true },
        visibility: 'active',
        isActive: true,
      };
      if (category && String(category).trim()) {
        filter.category = new RegExp(
          '^' + String(category).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
          'i'
        );
      }
      if (String(featured).toLowerCase() === 'true') {
        filter.isFeatured = true;
      }
      if (q && String(q).trim()) {
        const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
          { title: rx },
          { shortDescription: rx },
          { description: rx },
          { category: rx },
        ];
      }
      const items = await Demo.find(filter).sort({ isFeatured: -1, order: 1, createdAt: -1 }).lean();
      return res.json({
        data: items,
        pagination: { page: 1, limit: items.length, total: items.length, pages: 1 },
      });
    }

    const {
      page = 1,
      limit = DEMO_PAGE_SIZE,
      service,
      active,
      sort = 'order',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || DEMO_PAGE_SIZE, DEMO_PAGE_SIZE);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      isDeleted: { $ne: true },
      websiteDemo: { $ne: true },
    };

    if (service) {
      query.service = service;
    }

    if (typeof active !== 'undefined') {
      query.isActive = active === 'true';
    }

    const sortSpec =
      sort === 'createdAt'
        ? { createdAt: -1 }
        : { order: 1, createdAt: -1 };

    const [items, total] = await Promise.all([
      Demo.find(query)
        .populate('service', 'title slug')
        .sort(sortSpec)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Demo.countDocuments(query),
    ]);

    res.json({
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get demos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public: get legacy service-linked demo by slug (not website catalog)
router.get('/by-slug/:slug', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=3600');
  try {
    const demo = await Demo.findOne({
      slug: req.params.slug,
      isActive: true,
      websiteDemo: { $ne: true },
      isDeleted: { $ne: true },
    })
      .populate('service', 'title slug description')
      .lean();

    if (!demo) {
      return res.status(404).json({ message: 'Demo not found' });
    }

    res.json({ data: demo });
  } catch (error) {
    console.error('Get demo by slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/by-service-slug/:serviceSlug', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=3600');
  try {
    const service = await Service.findOne({ slug: req.params.serviceSlug, isActive: true }).lean();
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const items = await Demo.find({
      service: service._id,
      isActive: true,
      websiteDemo: { $ne: true },
      isDeleted: { $ne: true },
    })
      .populate('service', 'title slug')
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({ data: items });
  } catch (error) {
    console.error('Get demos by service slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/by-service-demo/:serviceSlug/:demoSlug', async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.serviceSlug, isActive: true }).lean();
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const demo = await Demo.findOne({
      service: service._id,
      slug: req.params.demoSlug,
      isActive: true,
      websiteDemo: { $ne: true },
      isDeleted: { $ne: true },
    })
      .populate('service', 'title slug')
      .lean();

    if (!demo) {
      return res.status(404).json({ message: 'Demo not found' });
    }

    res.json({ data: demo });
  } catch (error) {
    console.error('Get demo by service and slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.use(requireAdmin);

router.patch(
  '/reorder',
  body('order').isArray({ min: 1 }).withMessage('order must be a non-empty array'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid order array', errors: errors.array() });
      }
      const order = req.body.order;
      if (!Array.isArray(order) || order.length === 0) {
        return res.status(400).json({ message: 'Order must be a non-empty array of { id, order }' });
      }
      const bulkOps = order.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { order: item.order, updatedBy: req.user?._id } },
        },
      }));
      await Demo.bulkWrite(bulkOps);
      const updated = await Demo.find({ _id: { $in: order.map((o) => o.id) }, isDeleted: { $ne: true } })
        .sort({ order: 1 })
        .lean();
      res.json({ message: 'Order updated', data: updated });
    } catch (error) {
      console.error('Reorder demos error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.patch('/:id/featured', body('isFeatured').isBoolean(), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Demo not found' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'isFeatured must be a boolean', errors: errors.array() });
    }
    const demo = await Demo.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isFeatured: req.body.isFeatured, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    ).lean();
    if (!demo) {
      return res.status(404).json({ message: 'Demo not found' });
    }
    res.json({ message: 'Featured updated', data: demo });
  } catch (error) {
    console.error('Update demo featured error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Demo not found' });
    }
    const demo = await Demo.findById(req.params.id).populate('service', 'title slug').lean();
    if (!demo || demo.isDeleted) {
      return res.status(404).json({ message: 'Demo not found' });
    }
    res.json({ data: demo });
  } catch (error) {
    console.error('Get demo by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

function validateServiceSlug(slug) {
  if (!slug || !String(slug).trim()) return 'Slug is required';
  if (!/^[a-z0-9-]+$/.test(String(slug))) {
    return 'Slug can only contain lowercase letters, numbers, and hyphens';
  }
  return null;
}

router.post('/', async (req, res) => {
  try {
    const isWebsite = req.body.websiteDemo === true || req.body.websiteDemo === 'true';

    if (isWebsite) {
      const w = normalizeWebsitePayload(req.body, { isCreate: true });
      if (!w.title) {
        return res.status(400).json({ message: 'Title is required' });
      }
      if (!w.demoUrl) {
        return res.status(400).json({ message: 'Demo URL is required' });
      }
      if (!w.thumbnail) {
        return res.status(400).json({ message: 'Thumbnail is required' });
      }
      if (!w.description && !w.shortDescription) {
        return res.status(400).json({ message: 'Description or short description is required' });
      }
      let slug = w.slug || slugifyTitle(w.title);
      if (!slug) slug = 'demo';
      slug = await ensureUniqueWebsiteSlug(null, slug);

      const doc = await Demo.create({
        ...w,
        slug,
        images: [],
        coverImageUrl: w.thumbnail,
        createdBy: req.user?._id,
        updatedBy: req.user?._id,
      });

      return res.status(201).json({
        message: 'Demo created successfully',
        data: doc,
      });
    }

    if (!req.body.service) {
      return res.status(400).json({ message: 'Service is required' });
    }
    if (!String(req.body.title || '').trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const slugErrCreate = validateServiceSlug(req.body.slug);
    if (slugErrCreate) {
      return res.status(400).json({ message: slugErrCreate });
    }
    if (!String(req.body.description || '').trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const { service } = req.body;
    const serviceExists = await Service.exists({ _id: service });
    if (!serviceExists) {
      return res.status(400).json({ message: 'Invalid service reference' });
    }

    const body = normalizeServiceDemoPayload(req.body);
    body.createdBy = req.user?._id;
    body.updatedBy = req.user?._id;

    const existing = await Demo.findOne({ service: body.service, slug: body.slug, isDeleted: { $ne: true } });
    if (existing) {
      return res.status(400).json({ message: 'A demo with this slug already exists for this service' });
    }

    const demo = await Demo.create(body);

    res.status(201).json({
      message: 'Demo created successfully',
      data: demo,
    });
  } catch (error) {
    console.error('Create demo error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already in use' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Demo not found' });
    }
    const existingDoc = await Demo.findById(req.params.id);
    if (!existingDoc || existingDoc.isDeleted) {
      return res.status(404).json({ message: 'Demo not found' });
    }

    const isWebsite = existingDoc.websiteDemo === true;

    if (isWebsite) {
      const w = normalizeWebsitePayload(req.body, { isCreate: false });
      if (!w.title) {
        return res.status(400).json({ message: 'Title is required' });
      }
      if (!w.demoUrl) {
        return res.status(400).json({ message: 'Demo URL is required' });
      }
      if (!w.thumbnail) {
        return res.status(400).json({ message: 'Thumbnail is required' });
      }
      if (!w.description && !w.shortDescription) {
        return res.status(400).json({ message: 'Description or short description is required' });
      }

      let slug = w.slug || slugifyTitle(w.title);
      if (!slug) slug = existingDoc.slug;
      if (slug !== existingDoc.slug) {
        slug = await ensureUniqueWebsiteSlug(existingDoc._id, slug);
      }

      const demo = await Demo.findByIdAndUpdate(
        req.params.id,
        {
          ...w,
          slug,
          service: null,
          coverImageUrl: w.thumbnail,
          updatedBy: req.user?._id,
        },
        { new: true, runValidators: true }
      );

      return res.json({
        message: 'Demo updated successfully',
        data: demo,
      });
    }

    if (!req.body.service) {
      return res.status(400).json({ message: 'Service is required' });
    }
    if (!String(req.body.title || '').trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const slugErrPut = validateServiceSlug(req.body.slug);
    if (slugErrPut) {
      return res.status(400).json({ message: slugErrPut });
    }
    if (!String(req.body.description || '').trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const { service } = req.body;
    const serviceExists = await Service.exists({ _id: service });
    if (!serviceExists) {
      return res.status(400).json({ message: 'Invalid service reference' });
    }

    const update = normalizeServiceDemoPayload(req.body);
    update.updatedBy = req.user?._id;

    if (update.slug) {
      const clash = await Demo.findOne({
        service: update.service,
        slug: update.slug,
        _id: { $ne: req.params.id },
        isDeleted: { $ne: true },
      });
      if (clash) {
        return res.status(400).json({ message: 'Another demo already uses this slug for this service' });
      }
    }

    const demo = await Demo.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: 'Demo updated successfully',
      data: demo,
    });
  } catch (error) {
    console.error('Update demo error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Slug already in use' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const demo = await Demo.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?._id,
        isActive: false,
      },
      { new: true }
    );
    if (!demo) {
      return res.status(404).json({ message: 'Demo not found' });
    }
    res.json({ message: 'Demo deleted successfully' });
  } catch (error) {
    console.error('Delete demo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id/status', body('isActive').isBoolean(), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Demo not found' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'isActive must be a boolean', errors: errors.array() });
    }
    const demo = await Demo.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    ).lean();
    if (!demo) {
      return res.status(404).json({ message: 'Demo not found' });
    }
    res.json({ message: 'Status updated', data: demo });
  } catch (error) {
    console.error('Update demo status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
