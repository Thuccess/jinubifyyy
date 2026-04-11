import express from 'express';
import { body, validationResult } from 'express-validator';
import Service from '../models/Service.js';
import Demo from '../models/Demo.js';
import { requireAdmin } from '../middleware/admin.js';
import { addMediaUsage, removeMediaUsage } from '../utils/mediaUsage.js';

const router = express.Router();

const SERVICE_PAGE_SIZE = 50;

/** Only persist schema-defined fields; never spread raw req.body (avoids cast errors / pollution). */
function serviceBodyPayload(body) {
  const b = body && typeof body === 'object' ? body : {};
  const bullets = Array.isArray(b.bullets) ? b.bullets.map((x) => String(x ?? '').trim()).filter(Boolean) : [];
  return {
    title: String(b.title ?? '').trim(),
    slug: String(b.slug ?? '').trim().toLowerCase(),
    description: String(b.description ?? '').trim(),
    shortDescription: String(b.shortDescription ?? '').trim(),
    intro: String(b.intro ?? '').trim(),
    bulletsLabel: String(b.bulletsLabel ?? '').trim(),
    bullets,
    hasDemo: Boolean(b.hasDemo),
    category: String(b.category ?? '').trim(),
    icon: String(b.icon ?? '').trim(),
    imageUrl: String(b.imageUrl ?? '').trim(),
    startingPrice: String(b.startingPrice ?? '').trim(),
    isActive: b.isActive !== false && b.isActive !== 'false',
    isFeatured: Boolean(b.isFeatured),
    order: typeof b.order === 'number' && Number.isFinite(b.order) ? b.order : parseInt(String(b.order ?? ''), 10) || 0,
    seoTitle: String(b.seoTitle ?? '').trim(),
    seoDescription: String(b.seoDescription ?? '').trim(),
  };
}

// Common list handler with pagination and sorting
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const {
      page = 1,
      limit = SERVICE_PAGE_SIZE,
      search,
      active,
      category,
      featured,
      sort = 'order',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || SERVICE_PAGE_SIZE, SERVICE_PAGE_SIZE);
    const skip = (pageNum - 1) * limitNum;

    const query = { isDeleted: { $ne: true } };

    if (typeof active !== 'undefined') {
      query.isActive = active === 'true';
    }
    if (category && String(category).trim()) {
      query.category = new RegExp('^' + String(category).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
    }
    if (typeof featured !== 'undefined') {
      query.isFeatured = featured === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortSpec =
      sort === 'createdAt'
        ? { createdAt: -1 }
        : { order: 1, createdAt: -1 };

    const [items, total] = await Promise.all([
      Service.find(query).sort(sortSpec).skip(skip).limit(limitNum).lean(),
      Service.countDocuments(query),
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
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public: services that have at least one active demo (for demos landing)
router.get('/with-demos', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const demoServiceIds = await Demo.distinct('service', {
      isActive: true,
      isDeleted: { $ne: true },
      websiteDemo: { $ne: true },
      service: { $exists: true, $ne: null },
    });
    if (demoServiceIds.length === 0) {
      return res.json({ data: [] });
    }
    const services = await Service.find({
      _id: { $in: demoServiceIds },
      isActive: true,
      isDeleted: { $ne: true },
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ data: services });
  } catch (error) {
    console.error('Get services with demos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single service by slug (public) or id (admin via query)
router.get('/by-slug/:slug', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      isActive: true,
      isDeleted: { $ne: true },
    }).lean();
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ data: service });
  } catch (error) {
    console.error('Get service by slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin-only routes below
router.use(requireAdmin);

const serviceValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

// PATCH /api/services/reorder — must be before /:id
router.patch('/reorder', body('order').isArray(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid order array', errors: errors.array() });
    }
    const order = req.body.order; // [{ id: string, order: number }]
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: 'Order must be a non-empty array of { id, order }' });
    }
    const bulkOps = order.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order, updatedBy: req.user?._id } },
      },
    }));
    await Service.bulkWrite(bulkOps);
    const updated = await Service.find({ _id: { $in: order.map((o) => o.id) } })
      .sort({ order: 1 })
      .lean();
    res.json({ message: 'Order updated', data: updated });
  } catch (error) {
    console.error('Reorder services error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH /api/services/:id/status
router.patch('/:id/status', body('isActive').isBoolean(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'isActive must be a boolean', errors: errors.array() });
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    ).lean();
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Status updated', data: service });
  } catch (error) {
    console.error('Update service status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/services/:id — admin: get single service by id
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).lean();
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ data: service });
  } catch (error) {
    console.error('Get service by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', serviceValidators, async (req, res) => {
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

    const body = serviceBodyPayload(req.body);
    const existing = await Service.findOne({ slug: body.slug, isDeleted: { $ne: true } });
    if (existing) {
      return res.status(400).json({ message: 'Service with this slug already exists' });
    }

    const payload = { ...body, createdBy: req.user?._id, updatedBy: req.user?._id };
    const service = await Service.create(payload);

    if (service.imageUrl) {
      await addMediaUsage(service.imageUrl, 'Service', String(service._id));
    }

    res.status(201).json({
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A service with this slug already exists' });
    }
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', serviceValidators, async (req, res) => {
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

    const { id } = req.params;
    const update = { ...serviceBodyPayload(req.body), updatedBy: req.user?._id };

    if (update.slug) {
      const existing = await Service.findOne({ slug: update.slug, _id: { $ne: id }, isDeleted: { $ne: true } });
      if (existing) {
        return res.status(400).json({ message: 'Another service already uses this slug' });
      }
    }

    const existing = await Service.findById(id).lean();

    const service = await Service.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (update.imageUrl && existing && existing.imageUrl !== update.imageUrl) {
      await removeMediaUsage(existing.imageUrl, 'Service', String(service._id));
      await addMediaUsage(update.imageUrl, 'Service', String(service._id));
    }

    res.json({
      message: 'Service updated successfully',
      data: service,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A service with this slug already exists' });
    }
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Soft delete
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?._id,
        isActive: false,
      },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

