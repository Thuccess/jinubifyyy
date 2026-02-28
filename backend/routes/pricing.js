import express from 'express';
import { body, validationResult } from 'express-validator';
import PricingPackage from '../models/PricingPackage.js';
import Service from '../models/Service.js';
import { requireAdmin } from '../middleware/admin.js';
import { DEFAULT_PRICING_PACKAGES } from '../data/defaultPricing.js';

const router = express.Router();

const PRICING_PAGE_SIZE = 100;

// List pricing packages (optionally filtered by service)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = PRICING_PAGE_SIZE,
      service,
      active,
      sort = 'order',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || PRICING_PAGE_SIZE, PRICING_PAGE_SIZE);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (service) {
      query.service = service;
    }

    if (typeof active !== 'undefined') {
      query.isActive = active === 'true';
    } else {
      // Public and admin lists should not show inactive packages by default
      query.isActive = true;
    }

    const sortSpec =
      sort === 'createdAt'
        ? { createdAt: -1 }
        : { order: 1, createdAt: -1 };

    const [items, total] = await Promise.all([
      PricingPackage.find(query)
        .populate('service', 'title slug intro description shortDescription category icon isActive order')
        .sort(sortSpec)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      PricingPackage.countDocuments(query),
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
    console.error('Get pricing packages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin-only routes below
router.use(requireAdmin);

const pricingValidators = [
  body('service').notEmpty().withMessage('Service is required'),
  body('name').trim().notEmpty().withMessage('Package name is required'),
  body('price').trim().notEmpty().withMessage('Price is required'),
  body('billingPeriod')
    .optional()
    .isIn(['monthly', 'one-time', 'custom'])
    .withMessage('Invalid billingPeriod'),
];

router.post('/', pricingValidators, async (req, res) => {
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

    const pkg = await PricingPackage.create(req.body);

    res.status(201).json({
      message: 'Pricing package created successfully',
      data: pkg,
    });
  } catch (error) {
    console.error('Create pricing package error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', pricingValidators, async (req, res) => {
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

    const pkg = await PricingPackage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!pkg) {
      return res.status(404).json({ message: 'Pricing package not found' });
    }

    res.json({
      message: 'Pricing package updated successfully',
      data: pkg,
    });
  } catch (error) {
    console.error('Update pricing package error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pkg = await PricingPackage.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Pricing package not found' });
    }
    res.json({ message: 'Pricing package deleted successfully' });
  } catch (error) {
    console.error('Delete pricing package error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Seed default pricing packages (creates/updates from defaultPricing data)
router.post('/seed', async (req, res) => {
  try {
    let created = 0;
    let updated = 0;
    const skipped = [];

    for (const group of DEFAULT_PRICING_PACKAGES) {
      const service = await Service.findOne({
        slug: group.serviceSlug,
        isActive: true,
        isDeleted: { $ne: true },
      }).lean();
      if (!service) {
        skipped.push(group.serviceSlug);
        continue;
      }

      for (const pkg of group.packages) {
        const existing = await PricingPackage.findOne({
          service: service._id,
          name: pkg.name,
        });
        const payload = {
          service: service._id,
          name: pkg.name,
          price: pkg.price,
          description: pkg.description,
          ctaText: pkg.ctaText,
          billingPeriod: 'custom',
          features: pkg.features,
          isFeatured: pkg.isFeatured,
          isActive: true,
          order: pkg.order,
        };

        if (existing) {
          await PricingPackage.findByIdAndUpdate(existing._id, payload, {
            runValidators: true,
          });
          updated++;
        } else {
          await PricingPackage.create(payload);
          created++;
        }
      }
    }

    res.json({
      message: 'Pricing seed completed',
      created,
      updated,
      skipped: skipped.length ? skipped : undefined,
    });
  } catch (error) {
    console.error('Pricing seed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

