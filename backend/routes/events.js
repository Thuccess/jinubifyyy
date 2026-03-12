import express from 'express';
import { body, validationResult } from 'express-validator';
import EventItem from '../models/EventItem.js';
import { requireAdmin } from '../middleware/admin.js';
import { adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public: GET /api/events
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const { page = 1, limit = 50, featured, sort = 'order' } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      status: 'published',
      isDeleted: { $ne: true },
    };

    if (typeof featured !== 'undefined') {
      query.isFeatured = featured === 'true';
    }

    const sortSpec =
      sort === 'date'
        ? { date: -1, order: 1 }
        : { order: 1, date: -1, createdAt: -1 };

    const [items, total] = await Promise.all([
      EventItem.find(query).sort(sortSpec).skip(skip).limit(limitNum).lean(),
      EventItem.countDocuments(query),
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
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public: GET /api/events/:slug
router.get('/:slug', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const eventItem = await EventItem.findOne({
      slug: req.params.slug,
      status: 'published',
      isDeleted: { $ne: true },
    }).lean();
    if (!eventItem) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ data: eventItem });
  } catch (error) {
    console.error('Get event by slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes
router.use(adminLimiter);
router.use(requireAdmin);

const eventValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
];

// PATCH /api/events/reorder
router.patch('/reorder', body('order').isArray(), async (req, res) => {
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
        update: { $set: { order: item.order } },
      },
    }));
    await EventItem.bulkWrite(bulkOps);
    const updated = await EventItem.find({ _id: { $in: order.map((o) => o.id) } })
      .sort({ order: 1 })
      .lean();
    res.json({ message: 'Order updated', data: updated });
  } catch (error) {
    console.error('Reorder events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin list
router.get('/admin/list', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const query = { isDeleted: { $ne: true } };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      const s = String(search).trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      EventItem.find(query).sort({ order: 1, date: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      EventItem.countDocuments(query),
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
    console.error('Admin events list error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin create
router.post('/admin', eventValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const existing = await EventItem.findOne({ slug: req.body.slug, isDeleted: { $ne: true } });
    if (existing) {
      return res.status(400).json({ message: 'Event with this slug already exists' });
    }
    const payload = {
      ...req.body,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    };
    const created = await EventItem.create(payload);
    res.status(201).json({ message: 'Event created', data: created });
  } catch (error) {
    console.error('Admin create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin update
router.put('/admin/:id', eventValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { id } = req.params;
    const update = { ...req.body, updatedBy: req.user?._id };

    if (update.slug) {
      const existing = await EventItem.findOne({ slug: update.slug, _id: { $ne: id }, isDeleted: { $ne: true } });
      if (existing) {
        return res.status(400).json({ message: 'Another event already uses this slug' });
      }
    }

    const doc = await EventItem.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!doc) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event updated', data: doc });
  } catch (error) {
    console.error('Admin update event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin soft delete
router.delete('/admin/:id', async (req, res) => {
  try {
    const doc = await EventItem.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        status: 'draft',
        updatedBy: req.user?._id,
      },
      { new: true }
    ).lean();
    if (!doc) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Admin delete event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

