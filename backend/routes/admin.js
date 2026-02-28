import express from 'express';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import BlogPost from '../models/BlogPost.js';
import Order from '../models/Order.js';
import Activity from '../models/Activity.js';
import { requireAdmin } from '../middleware/admin.js';
import { adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to admin routes
router.use(adminLimiter);

// All admin routes require admin role
router.use(requireAdmin);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBlogPosts = await BlogPost.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingContacts = await Contact.countDocuments({ status: 'new' });
    const publishedPosts = await BlogPost.countDocuments({ published: true });

    res.json({
      stats: {
        totalUsers,
        totalBlogPosts,
        totalContacts,
        totalOrders,
        pendingContacts,
        publishedPosts,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/contacts
// @desc    Get all contact submissions
// @access  Admin only
router.get('/contacts', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/contacts/:id
// @desc    Update contact status
// @access  Admin only
router.put('/contacts/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact status updated', contact });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user role
// @access  Admin only
router.put('/users/:id', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }

    const targetUser = await User.findById(req.params.id).select('-password');

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent an admin from demoting themselves, which would immediately lock them out
    if (String(req.user._id) === String(targetUser._id) && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot change your own role from admin to user.' });
    }

    // Prevent removing the last remaining admin account
    if (targetUser.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'At least one admin user is required. You cannot remove the last admin.' });
      }
    }

    const user = await User.findByIdAndUpdate(
      targetUser._id,
      { role },
      { new: true }
    ).select('-password');

    res.json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders (legacy + public pricing orders) with filters
// @access  Admin only
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, serviceSlug, country, dateFrom, dateTo } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
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
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(String(dateFrom));
      }
      if (dateTo) {
        const end = new Date(String(dateTo));
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    if (search) {
      const s = String(search).trim();
      query.$or = [
        { serviceName: { $regex: s, $options: 'i' } },
        { 'customer.name': { $regex: s, $options: 'i' } },
        { 'customer.email': { $regex: s, $options: 'i' } },
        { 'customer.phone': { $regex: s, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .select('serviceName quantity price status completedAt createdAt userId customer order adminNotes')
      .populate('userId', 'name email')
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
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/orders/:id
// @desc    Update order status and optional admin notes
// @access  Admin only
router.put('/orders/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['pending', 'processing', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = {
      status,
      'order.status': status,
      updatedAt: new Date(),
    };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    if (typeof adminNotes === 'string') {
      updateData.adminNotes = adminNotes;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

