import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import { orderCreateLimiter, adminLimiter } from '../middleware/rateLimiter.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

// @route   POST /api/orders/create
// @desc    Create a new order from public pricing page
// @access  Public (rate-limited)
router.post(
  '/create',
  orderCreateLimiter,
  [
    body('customer.name').trim().notEmpty().withMessage('Name is required'),
    body('customer.phone').trim().notEmpty().withMessage('Phone is required'),
    body('customer.email').trim().isEmail().withMessage('Valid email is required'),
    body('customer.country').trim().notEmpty().withMessage('Country is required'),
    body('order.service').trim().notEmpty().withMessage('Service is required'),
    body('order.packageName').trim().notEmpty().withMessage('Package name is required'),
    body('order.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('order.currency').optional().isString().trim(),
    body('order.pricingCategory').optional().isString().trim(),
    body('order.serviceSlug').optional().isString().trim(),
  ],
  async (req, res) => {
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

      const { customer, order } = req.body;
      const now = new Date();

      const orderDoc = new Order({
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          country: customer.country,
          city: customer.city || '',
          company: customer.company || '',
          industry: customer.industry || '',
          notes: customer.notes || '',
        },
        order: {
          service: order.service,
          serviceSlug: order.serviceSlug || '',
          packageName: order.packageName,
          price: Number(order.price),
          currency: order.currency || 'USD',
          pricingCategory: order.pricingCategory || '',
          sourcePage: order.sourcePage || 'pricing',
          status: order.status || 'pending',
          briefId: order.briefId,
          assetIds: order.assetIds || [],
          orderTimestamp: order.orderTimestamp ? new Date(order.orderTimestamp) : now,
        },
        // Legacy fields for existing admin/dashboard views
        serviceName: order.service,
        quantity: 1,
        price: Number(order.price),
        status: order.status || 'pending',
        createdAt: now,
      });

      await orderDoc.save();

      console.log('New public order created from pricing page:', {
        id: orderDoc._id.toString(),
        service: orderDoc.order?.service,
        packageName: orderDoc.order?.packageName,
        country: orderDoc.customer?.country,
      });

      res.status(201).json({
        message: 'Order created successfully',
        orderId: orderDoc._id,
      });
    } catch (error) {
      console.error('Create public order error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Minimal admin endpoints under /api/orders for completeness

// @route   GET /api/orders
// @desc    List orders (admin)
// @access  Private (Admin)
router.get('/', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, serviceSlug, country } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (serviceSlug) {
      query['order.serviceSlug'] = String(serviceSlug).trim();
    }
    if (country) {
      query['customer.country'] = new RegExp(`^${String(country).trim()}$`, 'i');
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('List orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by id (admin)
// @access  Private (Admin)
router.get('/:id', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status (admin)
// @access  Private (Admin)
router.patch('/:id/status', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'processing', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const update = {
      status,
      'order.status': status,
      updatedAt: new Date(),
    };
    if (status === 'completed') {
      update.completedAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Patch order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order (admin)
// @access  Private (Admin)
router.delete('/:id', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

