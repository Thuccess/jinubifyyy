import express from 'express';
import { body, validationResult } from 'express-validator';
import Demo from '../models/Demo.js';
import Service from '../models/Service.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

const DEMO_PAGE_SIZE = 100;

// List demos (optionally filtered by service)
router.get('/', async (req, res) => {
  try {
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

    const query = { isDeleted: { $ne: true } };

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

// Public: get demo by slug (only active)
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const demo = await Demo.findOne({ slug: req.params.slug, isActive: true })
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

// Public: get demos by service slug (for overview page)
router.get('/by-service-slug/:serviceSlug', async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.serviceSlug, isActive: true }).lean();
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const items = await Demo.find({ service: service._id, isActive: true })
      .populate('service', 'title slug')
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({ data: items });
  } catch (error) {
    console.error('Get demos by service slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public: get single demo by service slug + demo slug (for gallery page)
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

// Admin-only routes below
router.use(requireAdmin);

const demoValidators = [
  body('service').notEmpty().withMessage('Service is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

router.get('/:id', async (req, res) => {
  try {
    const demo = await Demo.findById(req.params.id).lean();
    if (!demo || demo.isDeleted) {
      return res.status(404).json({ message: 'Demo not found' });
    }
    res.json({ data: demo });
  } catch (error) {
    console.error('Get demo by id error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', demoValidators, async (req, res) => {
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

    const { service } = req.body;
    const serviceExists = await Service.exists({ _id: service });
    if (!serviceExists) {
      return res.status(400).json({ message: 'Invalid service reference' });
    }

    const existing = await Demo.findOne({ service: req.body.service, slug: req.body.slug });
    if (existing) {
      return res.status(400).json({ message: 'A demo with this slug already exists for this service' });
    }

    const body = {
      ...req.body,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    };
    if (Array.isArray(body.images)) {
      body.images = body.images.map((img, i) => ({
        url: img.url && String(img.url).trim() ? img.url.trim() : '',
        order: typeof img.order === 'number' ? img.order : i,
      })).filter((img) => img.url);
    }
    if (body.coverImageUrl !== undefined) {
      body.coverImageUrl = body.coverImageUrl ? String(body.coverImageUrl).trim() : '';
    }

    const demo = await Demo.create(body);

    res.status(201).json({
      message: 'Demo created successfully',
      data: demo,
    });
  } catch (error) {
    console.error('Create demo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', demoValidators, async (req, res) => {
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

    const { service } = req.body;
    const serviceExists = await Service.exists({ _id: service });
    if (!serviceExists) {
      return res.status(400).json({ message: 'Invalid service reference' });
    }

    // Prevent slug collisions per service when updating
    if (req.body.slug) {
      const existing = await Demo.findOne({
        service: req.body.service,
        slug: req.body.slug,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({ message: 'Another demo already uses this slug for this service' });
      }
    }

    const update = { ...req.body, updatedBy: req.user?._id };
    if (Array.isArray(update.images)) {
      update.images = update.images.map((img, i) => ({
        url: img.url && String(img.url).trim() ? img.url.trim() : '',
        order: typeof img.order === 'number' ? img.order : i,
      })).filter((img) => img.url);
    }
    if (update.coverImageUrl !== undefined) {
      update.coverImageUrl = update.coverImageUrl ? String(update.coverImageUrl).trim() : '';
    }

    const demo = await Demo.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!demo) {
      return res.status(404).json({ message: 'Demo not found' });
    }

    res.json({
      message: 'Demo updated successfully',
      data: demo,
    });
  } catch (error) {
    console.error('Update demo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Soft delete
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

// PATCH /api/demos/:id/status
router.patch('/:id/status', body('isActive').isBoolean(), async (req, res) => {
  try {
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

// PATCH /api/demos/reorder
router.patch(
  '/reorder',
  body('order').isArray({ min: 1 }).withMessage('order must be a non-empty array'),
  async (req, res) => {
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

export default router;

