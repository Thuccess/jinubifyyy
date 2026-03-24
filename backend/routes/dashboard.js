import express from 'express';
import Order from '../models/Order.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { authenticate, verifyApproved } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate, verifyApproved);

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview data
// @access  Private
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user balance
    const user = await User.findById(userId);
    const balance = user?.balance || 0;

    // Get total orders
    const totalOrders = await Order.countDocuments({ userId });

    // Get active services (orders with status 'processing' or 'completed')
    const activeServices = await Order.countDocuments({
      userId,
      status: { $in: ['processing', 'completed'] },
    });

    res.json({
      balance: balance.toFixed(2),
      totalOrders,
      activeServices,
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/orders
// @desc    Get user orders
// @access  Private
router.get('/orders', async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find({ userId })
      .select('serviceName quantity price status completedAt createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments({ userId });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/activities
// @desc    Get user activities
// @access  Private
router.get('/activities', async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const activities = await Activity.find({ userId })
      .select('type description metadata createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/dashboard/orders
// @desc    Create a new order
// @access  Private
router.post('/orders', async (req, res) => {
  try {
    const userId = req.user._id;
    const { serviceName, quantity, price } = req.body;

    if (!serviceName || !quantity || !price) {
      return res.status(400).json({ message: 'Service name, quantity, and price are required' });
    }

    const order = new Order({
      userId,
      serviceName,
      quantity,
      price,
      status: 'pending',
    });

    await order.save();

    // Create activity
    const activity = new Activity({
      userId,
      type: 'order',
      description: `Your order for '${serviceName}' was created.`,
      metadata: { orderId: order._id },
    });
    await activity.save();

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

