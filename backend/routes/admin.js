import express from 'express';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import BlogPost from '../models/BlogPost.js';
import Order from '../models/Order.js';
import Activity from '../models/Activity.js';
import Testimonial from '../models/Testimonial.js';
import {
  getJobApplicationStats,
  listJobApplications,
  updateJobApplicationStatus,
  deleteJobApplication,
} from '../services/applicationService.js';
import {
  getInvestorStats,
  listInvestmentInquiries,
  updateInvestmentStage,
  deleteInvestmentInquiry,
} from '../services/investorService.js';
import AboutPage from '../models/AboutPage.js';
import TeamPage from '../models/TeamPage.js';
import Service from '../models/Service.js';
import Page from '../models/Page.js';
import PricingPackage from '../models/PricingPackage.js';
import MediaAsset from '../models/MediaAsset.js';
import Message from '../models/Message.js';
import SiteSettings from '../models/SiteSettings.js';
import { addMediaUsage, removeMediaUsage } from '../utils/mediaUsage.js';
import { body, validationResult } from 'express-validator';
import { requireAdmin } from '../middleware/admin.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { adminLimiter } from '../middleware/rateLimiter.js';
import { formatValidationErrors } from '../middleware/errorHandler.js';
import defaultSocials from '../data/defaultSocials.js';
import { defaultTeamPublicPayload } from '../data/defaultTeamPublic.js';
import { getUploadsDir } from '../config/uploadsPath.js';
import cloudinary from '../config/cloudinary.js';
import { authenticate, verifyApproved } from '../middleware/auth.js';
import { invalidatePublicSocialsCache } from '../utils/shortCache.js';
import { approveUserById } from '../services/onboarding/approveUser.js';

const router = express.Router();

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(formatValidationErrors(errors.array()));
  }
  next();
};

const UPLOAD_DIR = getUploadsDir();

// Apply rate limiting to admin routes
router.use(adminLimiter);

// Enforce production-grade account readiness before any admin access.
router.use(authenticate, verifyApproved);

// All admin routes require admin role
router.use(requireAdmin);

// @route   GET /api/admin/activity
// @desc    Get paginated activity logs (admin)
// @access  Admin only
router.get('/activity', async (req, res) => {
  try {
    const { page = 1, limit = 20, user: userSearch, entityType, dateFrom, dateTo } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (userSearch && String(userSearch).trim()) {
      const userIds = await User.find({
        $or: [
          { name: { $regex: String(userSearch).trim(), $options: 'i' } },
          { email: { $regex: String(userSearch).trim(), $options: 'i' } },
        ],
      }).distinct('_id');
      query.userId = { $in: userIds };
    }
    if (entityType && String(entityType).trim()) {
      query.entityType = String(entityType).trim();
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(String(dateFrom));
      if (dateTo) {
        const end = new Date(String(dateTo));
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const [items, total] = await Promise.all([
      Activity.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Activity.countDocuments(query),
    ]);

    const activities = items.map((a) => ({
      _id: a._id,
      user: a.userId ? { name: a.userId.name, email: a.userId.email } : null,
      action: a.action || a.type,
      entityType: a.entityType || null,
      entityId: a.entityId || null,
      description: a.description,
      timestamp: a.createdAt,
    }));

    res.json({
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get admin activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/:id/messages
// @desc    Get messages between admin team and a specific user
// @access  Admin and Super Admin
router.get('/users/:id/messages', authorizeRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({
      $or: [{ senderId: id }, { receiverId: id }],
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      messages: messages.map((m) => ({
        id: m._id,
        project_id: m.projectId || null,
        sender_id: m.senderId,
        receiver_id: m.receiverId,
        message: m.message,
        attachments: m.attachments || [],
        created_at: m.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin get user messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/users/:id/messages
// @desc    Send a message from admin to a specific user
// @access  Admin and Super Admin
router.post(
  '/users/:id/messages',
  authorizeRole('admin', 'super_admin'),
  [body('message').trim().notEmpty().withMessage('Message is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(formatValidationErrors(errors.array()));
      }

      const adminId = req.user._id;
      const { id } = req.params;
      const { projectId, message } = req.body;

      const msg = await Message.create({
        projectId: projectId || undefined,
        senderId: adminId,
        receiverId: id,
        message,
        attachments: [],
      });

      res.status(201).json({
        message: 'Message sent',
        item: {
          id: msg._id,
          project_id: msg.projectId || null,
          sender_id: msg.senderId,
          receiver_id: msg.receiverId,
          message: msg.message,
          attachments: msg.attachments || [],
          created_at: msg.createdAt,
        },
      });
    } catch (error) {
      console.error('Admin send user message error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   GET /api/admin/search
// @desc    Global admin search across users, orders, services, blog posts, CMS pages
// @access  Admin only
router.get('/search', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit, 10) || 5));

    if (!q) {
      return res.json({ users: [], orders: [], services: [], blogPosts: [], cmsPages: [] });
    }

    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [users, orders, services, blogPosts, cmsPages] = await Promise.all([
      User.find({ $or: [{ name: { $regex: re } }, { email: { $regex: re } }] })
        .select('_id name email role')
        .limit(limit)
        .lean(),
      Order.find({
        $or: [
          { serviceName: { $regex: re } },
          { 'customer.name': { $regex: re } },
          { 'customer.email': { $regex: re } },
        ],
      })
        .select('_id serviceName status createdAt customer')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Service.find({ isDeleted: { $ne: true }, $or: [{ title: { $regex: re } }, { description: { $regex: re } }] })
        .select('_id title slug')
        .limit(limit)
        .lean(),
      BlogPost.find({ $or: [{ title: { $regex: re } }, { excerpt: { $regex: re } }, { category: { $regex: re } }] })
        .select('_id title slug status published')
        .limit(limit)
        .lean(),
      Page.find({ $or: [{ slug: { $regex: re } }, { title: { $regex: re } }] })
        .select('_id slug title type')
        .limit(limit)
        .lean(),
    ]);

    res.json({
      users: users.map((u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role })),
      orders: orders.map((o) => ({
        _id: o._id,
        serviceName: o.serviceName,
        status: o.status,
        createdAt: o.createdAt,
        customer: o.customer,
      })),
      services: services.map((s) => ({ _id: s._id, title: s.title, slug: s.slug })),
      blogPosts: blogPosts.map((p) => ({ _id: p._id, title: p.title, slug: p.slug, status: p.status, published: p.published })),
      cmsPages: cmsPages.map((p) => ({ _id: p._id, slug: p.slug, title: p.title, type: p.type })),
    });
  } catch (error) {
    console.error('Admin search error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/media
// @desc    Get paginated media assets with optional search and tag filter
// @access  Admin only
router.get('/media', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 24,
      search,
      tag,
      sort = 'createdAt-desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search && String(search).trim()) {
      const re = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.filename = { $regex: re };
    }
    if (tag && String(tag).trim()) {
      query.tags = String(tag).trim();
    }

    const sortSpec =
      sort === 'createdAt-asc'
        ? { createdAt: 1 }
        : { createdAt: -1 };

    const [items, total] = await Promise.all([
      MediaAsset.find(query)
        .sort(sortSpec)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MediaAsset.countDocuments(query),
    ]);

    const media = items.map((m) => ({
      _id: m._id,
      filename: m.filename,
      url: m.url,
      tags: m.tags || [],
      usedBy: m.usedBy || [],
      usageCount: Array.isArray(m.usedBy) ? m.usedBy.length : 0,
      createdAt: m.createdAt,
    }));

    res.json({
      media,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get admin media error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/admin/media/:id/tags
// @desc    Update tags on a media asset
// @access  Admin only
router.patch('/media/:id/tags', async (req, res) => {
  try {
    let tags = req.body?.tags;
    if (typeof tags === 'string') {
      tags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: 'tags must be an array of strings or a comma-separated string' });
    }

    const normalized = Array.from(
      new Set(
        tags
          .map((t) => String(t || '').trim())
          .filter(Boolean)
      )
    );

    const media = await MediaAsset.findByIdAndUpdate(
      req.params.id,
      { $set: { tags: normalized } },
      { new: true }
    ).lean();

    if (!media) {
      return res.status(404).json({ message: 'Media asset not found' });
    }

    res.json({
      message: 'Tags updated',
      media,
    });
  } catch (error) {
    console.error('Update media tags error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/media/:id
// @desc    Delete a media asset if it is unused
// @access  Admin only
router.delete('/media/:id', async (req, res) => {
  try {
    const media = await MediaAsset.findById(req.params.id).lean();
    if (!media) {
      return res.status(404).json({ message: 'Media asset not found' });
    }

    const usageCount = Array.isArray(media.usedBy) ? media.usedBy.length : 0;
    if (usageCount > 0) {
      return res.status(400).json({
        message: 'Media asset is still in use and cannot be deleted',
        usageCount,
      });
    }

    // If Cloudinary is enabled, delete the remote asset so we don't leak storage.
    // Otherwise, fall back to local disk deletion for legacy uploads.
    if (process.env.CLOUDINARY_CLOUD_NAME && media.url) {
      try {
        const u = new URL(media.url);
        const folder = 'jinubify';
        const marker = `/${folder}/`;
        const idx = u.pathname.indexOf(marker);
        if (idx !== -1) {
          const after = u.pathname.slice(idx + marker.length);
          const last = after.split('/').pop() || '';
          const dot = last.lastIndexOf('.');
          const base = dot !== -1 ? last.slice(0, dot) : last;
          const publicId = `${folder}/${base}`;
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (e) {
        console.error('Failed to delete media file from Cloudinary:', e);
      }
    } else {
      const filename = media.filename;
      if (filename) {
        const filePath = path.join(UPLOAD_DIR, filename);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.error('Failed to delete media file from disk:', e);
        }
      }
    }

    await MediaAsset.findByIdAndDelete(req.params.id);

    res.json({ message: 'Media asset deleted' });
  } catch (error) {
    console.error('Delete media asset error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data for dashboard (traffic, leads, conversions, top services, top blog posts)
// @access  Admin only
router.get('/analytics', async (req, res) => {
  try {
    const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 30));
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const [trafficAgg, leadsAgg, conversionsAgg, topServicesAgg, topBlogPostsAgg] = await Promise.all([
      Activity.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Contact.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: '$serviceName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      BlogPost.aggregate([
        { $match: { $or: [{ published: true }, { status: 'published' }] } },
        { $project: { title: 1, slug: 1, 'metrics.views': 1, views: 1, date: 1 } },
        { $addFields: { viewCount: { $ifNull: ['$metrics.views', '$views'] } } },
        { $sort: { viewCount: -1, date: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const traffic = trafficAgg.map((t) => ({ date: t._id, count: t.count }));
    const leads = leadsAgg.map((l) => ({ date: l._id, count: l.count }));
    const conversions = conversionsAgg.map((c) => ({ date: c._id, count: c.count }));
    const topServices = topServicesAgg.map((s) => ({ name: s._id, count: s.count }));
    const topBlogPosts = topBlogPostsAgg.map((p) => ({
      title: p.title,
      slug: p.slug,
      views: p.viewCount ?? 0,
      date: p.date,
    }));

    res.json({ traffic, leads, conversions, topServices, topBlogPosts });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBlogPosts = await BlogPost.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalTestimonials = await Testimonial.countDocuments();
    const { totalApplications, newApplications } = await getJobApplicationStats();
    const { totalInvestors, newInvestors } = await getInvestorStats();
    const pendingContacts = await Contact.countDocuments({ status: 'new' });
    const publishedPosts = await BlogPost.countDocuments({ published: true });

    res.json({
      stats: {
        totalUsers,
        totalBlogPosts,
        totalContacts,
        totalOrders,
        totalTestimonials,
        totalApplications,
        newApplications,
        totalInvestors,
        newInvestors,
        pendingContacts,
        publishedPosts,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/applications
// @desc    List job applications
// @access  Admin only
router.get('/applications', async (req, res) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await listJobApplications({ status, search, page, limit });
    res.json({
      applications: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('List applications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/admin/applications/:id/status
// @desc    Update job application status (and optional admin notes)
// @access  Admin only
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['new', 'reviewing', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const application = await updateJobApplicationStatus(req.params.id, status, adminNotes);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application updated', application });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/applications/:id
// @desc    Delete job application
// @access  Admin only
router.delete('/applications/:id', async (req, res) => {
  try {
    await deleteJobApplication(req.params.id);
    res.json({ message: 'Application deleted' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/investors
// @desc    List investment inquiries
// @access  Admin only
router.get('/investors', async (req, res) => {
  try {
    const { stage, search, page, limit } = req.query;
    const result = await listInvestmentInquiries({ stage, search, page, limit });
    res.json({
      investors: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('List investors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/admin/investors/:id/stage
// @desc    Update investment inquiry stage (and optional admin notes)
// @access  Admin only
router.patch('/investors/:id/stage', async (req, res) => {
  try {
    const { stage, adminNotes } = req.body;
    if (!['new', 'contacted', 'negotiating', 'closed-won', 'closed-lost'].includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage value' });
    }
    const inquiry = await updateInvestmentStage(req.params.id, stage, adminNotes);
    if (!inquiry) {
      return res.status(404).json({ message: 'Investor inquiry not found' });
    }
    res.json({ message: 'Investor updated', inquiry });
  } catch (error) {
    console.error('Update investor stage error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/investors/:id
// @desc    Delete investment inquiry
// @access  Admin only
router.delete('/investors/:id', async (req, res) => {
  try {
    await deleteInvestmentInquiry(req.params.id);
    res.json({ message: 'Investor inquiry deleted' });
  } catch (error) {
    console.error('Delete investor inquiry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (optionally filtered by status)
// @access  Admin and Super Admin
router.get('/users', authorizeRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && ['pending', 'approved', 'rejected'].includes(String(status))) {
      query.status = status;
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

// Helper to build status-specific user list routes
const buildUserStatusRoute = (status) => {
  router.get(`/users/${status}`, authorizeRole('admin', 'super_admin'), async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const query = { status };
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
        .limit(parseInt(limit, 10))
        .lean();

      const total = await User.countDocuments(query);

      res.json({
        users,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      });
    } catch (error) {
      console.error(`Get ${status} users error:`, error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};

buildUserStatusRoute('pending');
buildUserStatusRoute('approved');
buildUserStatusRoute('rejected');

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
// @access  Admin and Super Admin
router.put('/users/:id', authorizeRole('admin', 'super_admin'), async (req, res) => {
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

// @route   PATCH /api/admin/users/:id/approve
// @desc    Approve user account
// @access  Admin and Super Admin
router.patch('/users/:id/approve', authorizeRole('admin', 'super_admin'), async (req, res) => {
  try {
    const result = await approveUserById(req.params.id, req.user?._id || null);
    if (result.error === 'not_found') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User approved successfully', user: result.user });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/admin/users/:id/reject
// @desc    Reject user account
// @access  Admin and Super Admin
router.patch('/users/:id/reject', authorizeRole('admin', 'super_admin'), async (req, res) => {
  try {
    const rawReason = req.body?.rejectionReason;
    const rejectionReason =
      typeof rawReason === 'string' ? String(rawReason).trim().slice(0, 2000) : '';

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approvedAt: null,
        approvedBy: null,
        rejectionReason: rejectionReason || '',
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User rejected successfully', user });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Admin and Super Admin
router.delete('/users/:id', authorizeRole('admin', 'super_admin'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting self
    if (String(req.user._id) === String(targetUser._id)) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    // Prevent deleting the last admin
    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'At least one admin user is required. You cannot delete the last admin.' });
      }
    }

    await User.findByIdAndDelete(targetUser._id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
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
router.put(
  '/orders/:id',
  [
    body('status').isIn(['pending', 'processing', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('adminNotes').optional().isString(),
  ],
  runValidation,
  async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

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
  }
);

// --- Testimonials CRUD ---

// @route   GET /api/admin/testimonials
// @desc    Get all testimonials (admin)
// @access  Admin only
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json({ testimonials });
  } catch (error) {
    console.error('Get admin testimonials error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/testimonials
// @desc    Create a testimonial
// @access  Admin only
router.post(
  '/testimonials',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('text').trim().notEmpty().withMessage('Text is required'),
    body('stars').optional().isInt({ min: 1, max: 5 }).withMessage('Stars must be 1–5'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  ],
  runValidation,
  async (req, res) => {
  try {
    const { name, title, avatar, text, stars, order, isActive } = req.body;

    const testimonial = await Testimonial.create({
      name: String(name).trim(),
      title: String(title).trim(),
      avatar: avatar ? String(avatar).trim() : '',
      text: String(text).trim(),
      stars: Math.min(5, Math.max(1, parseInt(stars, 10) || 5)),
      order: typeof order === 'number' ? order : parseInt(order, 10) || 0,
      isActive: typeof isActive !== 'undefined' ? Boolean(isActive) : true,
    });

    if (testimonial.avatar) {
      await addMediaUsage(testimonial.avatar, 'Testimonial', String(testimonial._id));
    }

    res.status(201).json({ testimonial });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
  }
);

// @route   PUT /api/admin/testimonials/:id
// @desc    Update a testimonial
// @access  Admin only
router.put('/testimonials/:id', async (req, res) => {
  try {
    const { name, title, avatar, text, stars, order, isActive } = req.body;

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (title !== undefined) update.title = String(title).trim();
    if (avatar !== undefined) update.avatar = String(avatar).trim();
    if (text !== undefined) update.text = String(text).trim();
    if (stars !== undefined) update.stars = Math.min(5, Math.max(1, parseInt(stars, 10) || 5));
    if (order !== undefined) update.order = typeof order === 'number' ? order : parseInt(order, 10) || 0;
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const existing = await Testimonial.findById(req.params.id).lean();

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).lean();

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    if (update.avatar && existing && existing.avatar !== update.avatar) {
      await removeMediaUsage(existing.avatar, 'Testimonial', String(testimonial._id));
      await addMediaUsage(update.avatar, 'Testimonial', String(testimonial._id));
    }

    res.json({ testimonial });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/testimonials/:id
// @desc    Delete a testimonial
// @access  Admin only
router.delete('/testimonials/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    if (testimonial.avatar) {
      await removeMediaUsage(testimonial.avatar, 'Testimonial', String(testimonial._id));
    }

    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- About Page (singleton) ---

// @route   GET /api/admin/about
// @desc    Get About page content for editing (returns defaults if none saved yet)
// @access  Admin only
router.get('/about', async (req, res) => {
  try {
    const doc = await AboutPage.findOne().lean();
    if (doc) {
      return res.json(doc);
    }
    res.json({
      hero: { eyebrow: 'About', heading: 'Pioneering Digital Excellence', subtitle: '', primaryCtaText: 'Our Services', primaryCtaLink: '/services', secondaryCtaText: 'Contact Us', secondaryCtaLink: '/contact' },
      ourStory: { heading: '', imageUrl: '', paragraph1: '', paragraph2: '' },
      stats: { heading: 'By The Numbers', subtext: 'Our track record speaks for itself.', items: [] },
      whyJinubify: {
        heading: 'Why Jinubify',
        intro: 'We blend expertise with a passion for innovation and the principles that guide our work.',
        tagline: 'Expertise, innovation, and accountability.',
        differentiators: [],
        coreValues: [],
      },
    });
  } catch (error) {
    console.error('Get admin about error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/about
// @desc    Update About page content (upsert)
// @access  Admin only
router.put('/about', async (req, res) => {
  try {
    const body = req.body || {};
    let doc = await AboutPage.findOne().lean();
    if (!doc) {
      doc = await AboutPage.create({
        slug: 'about',
        hero: body.hero || {},
        ourStory: body.ourStory || {},
        stats: body.stats || { items: [] },
        whyJinubify: body.whyJinubify || { differentiators: [], coreValues: [] },
      });
      return res.json(doc.toObject ? doc.toObject() : doc);
    }
    const update = {};
    if (body.hero != null) update.hero = body.hero;
    if (body.ourStory != null) update.ourStory = body.ourStory;
    if (body.stats != null) update.stats = body.stats;
    if (body.whyJinubify != null) update.whyJinubify = body.whyJinubify;
    const updated = await AboutPage.findByIdAndUpdate(doc._id, { $set: update }, { new: true }).lean();
    res.json(updated);
  } catch (error) {
    console.error('Update about error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Team Page (singleton: hero + members) ---

// @route   GET /api/admin/team
// @desc    Get Team page content for editing
// @access  Admin only
router.get('/team', async (req, res) => {
  try {
    const doc = await TeamPage.findOne().lean();
    if (doc) return res.json(doc);
    res.json(defaultTeamPublicPayload);
  } catch (error) {
    console.error('Get admin team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/team
// @desc    Update Team page content (upsert)
// @access  Admin only
router.put('/team', async (req, res) => {
  try {
    const body = req.body || {};
    let doc = await TeamPage.findOne();
    if (!doc) {
      doc = await TeamPage.create({
        slug: 'team',
        hero: body.hero || {},
        ceoFounder: body.ceoFounder != null ? body.ceoFounder : undefined,
        stripHeading: body.stripHeading != null ? body.stripHeading : 'Browse team',
        members: body.members || [],
      });
      return res.json(doc.toObject ? doc.toObject() : doc);
    }
    const update = {};
    if (body.hero != null) update.hero = body.hero;
    if (body.ceoFounder != null) update.ceoFounder = body.ceoFounder;
    if (body.stripHeading != null) update.stripHeading = body.stripHeading;
    if (body.members != null) update.members = body.members;
    const updated = await TeamPage.findByIdAndUpdate(doc._id, { $set: update }, { new: true }).lean();
    res.json(updated);
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ——— Bulk actions ———

// @route   POST /api/admin/blog/bulk
// @desc    Bulk action on blog posts (publish, unpublish, delete)
// @access  Admin only
router.post('/blog/bulk', async (req, res) => {
  try {
    const { action, ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required and must not be empty' });
    }
    if (!['publish', 'unpublish', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'action must be publish, unpublish, or delete' });
    }
    const objectIds = ids.map((id) => id).filter(Boolean);
    if (action === 'delete') {
      const result = await BlogPost.deleteMany({ _id: { $in: objectIds } });
      return res.json({ message: 'Posts deleted', count: result.deletedCount });
    }
    const update = action === 'publish' ? { published: true, status: 'published' } : { published: false, status: 'draft' };
    const result = await BlogPost.updateMany({ _id: { $in: objectIds } }, { $set: update });
    res.json({ message: action === 'publish' ? 'Posts published' : 'Posts unpublished', count: result.modifiedCount });
  } catch (error) {
    console.error('Blog bulk error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/services/bulk
// @desc    Bulk action on services (activate, deactivate, delete)
// @access  Admin only
router.post('/services/bulk', async (req, res) => {
  try {
    const { action, ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required and must not be empty' });
    }
    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'action must be activate, deactivate, or delete' });
    }
    const objectIds = ids.map((id) => id).filter(Boolean);
    if (action === 'delete') {
      const result = await Service.updateMany({ _id: { $in: objectIds } }, { $set: { isDeleted: true } });
      return res.json({ message: 'Services deleted', count: result.modifiedCount });
    }
    const isActive = action === 'activate';
    const result = await Service.updateMany({ _id: { $in: objectIds } }, { $set: { isActive } });
    res.json({ message: isActive ? 'Services activated' : 'Services deactivated', count: result.modifiedCount });
  } catch (error) {
    console.error('Services bulk error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/pricing/bulk
// @desc    Bulk action on pricing packages (activate, deactivate, delete)
// @access  Admin only
router.post('/pricing/bulk', async (req, res) => {
  try {
    const { action, ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required and must not be empty' });
    }
    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'action must be activate, deactivate, or delete' });
    }
    const objectIds = ids.map((id) => id).filter(Boolean);
    if (action === 'delete') {
      const result = await PricingPackage.deleteMany({ _id: { $in: objectIds } });
      return res.json({ message: 'Packages deleted', count: result.deletedCount });
    }
    const isActive = action === 'activate';
    const result = await PricingPackage.updateMany({ _id: { $in: objectIds } }, { $set: { isActive } });
    res.json({ message: isActive ? 'Packages activated' : 'Packages deactivated', count: result.modifiedCount });
  } catch (error) {
    console.error('Pricing bulk error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/orders/bulk
// @desc    Bulk update order status
// @access  Admin only
router.post('/orders/bulk', async (req, res) => {
  try {
    const { action, ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required and must not be empty' });
    }
    if (action !== 'updateStatus' || !['pending', 'processing', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'action must be updateStatus with status one of pending, processing, confirmed, completed, cancelled' });
    }
    const objectIds = ids.map((id) => id).filter(Boolean);
    const update = { status, 'order.status': status, updatedAt: new Date() };
    if (status === 'completed') update.completedAt = new Date();
    const result = await Order.updateMany({ _id: { $in: objectIds } }, { $set: update });
    res.json({ message: 'Orders updated', count: result.modifiedCount });
  } catch (error) {
    console.error('Orders bulk error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/users/bulk
// @desc    Bulk action on users (changeRole, delete). Prevent self-demotion and last-admin removal.
// @access  Admin and Super Admin
router.post('/users/bulk', authorizeRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { action, ids, role } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required and must not be empty' });
    }
    const objectIds = ids.map((id) => id).filter(Boolean);
    const currentUserId = String(req.user._id);

    if (action === 'changeRole') {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'role must be user or admin' });
      }
      const targets = await User.find({ _id: { $in: objectIds } }).select('role');
      const cannotDemote = targets.filter((t) => String(t._id) === currentUserId && role !== 'admin');
      if (cannotDemote.length > 0) {
        return res.status(400).json({ message: 'You cannot change your own role from admin to user.' });
      }
      const adminCount = await User.countDocuments({ role: 'admin' });
      const demoting = targets.filter((t) => t.role === 'admin' && role !== 'admin').length;
      if (adminCount - demoting < 1) {
        return res.status(400).json({ message: 'At least one admin user is required.' });
      }
      const result = await User.updateMany(
        { _id: { $in: objectIds } },
        { $set: { role } }
      );
      return res.json({ message: 'Users updated', count: result.modifiedCount });
    }

    if (action === 'delete') {
      const targets = await User.find({ _id: { $in: objectIds } }).select('role');
      const self = targets.find((t) => String(t._id) === currentUserId);
      if (self) {
        return res.status(400).json({ message: 'You cannot delete your own account.' });
      }
      const adminCount = await User.countDocuments({ role: 'admin' });
      const deletingAdmins = targets.filter((t) => t.role === 'admin').length;
      if (adminCount - deletingAdmins < 1) {
        return res.status(400).json({ message: 'At least one admin user is required.' });
      }
      const result = await User.deleteMany({ _id: { $in: objectIds } });
      return res.json({ message: 'Users deleted', count: result.deletedCount });
    }

    return res.status(400).json({ message: 'action must be changeRole or delete' });
  } catch (error) {
    console.error('Users bulk error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/socials
// @desc    Update global social media URLs
// @access  Admin only
router.put('/socials', async (req, res) => {
  try {
    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'];
    const resultSocials = {};

    for (const platform of platforms) {
      const raw = req.body?.[platform];
      const value = typeof raw === 'string' ? raw.trim() : '';

      if (!value) {
        resultSocials[platform] = '';
        continue;
      }

      let parsed;
      try {
        parsed = new URL(value);
      } catch {
        return res.status(400).json({ message: `Invalid URL for ${platform}` });
      }

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ message: `URL protocol for ${platform} must be http or https` });
      }

      resultSocials[platform] = parsed.toString();
    }

    const doc = await SiteSettings.findOneAndUpdate(
      { key: 'socials' },
      {
        $set: {
          value: resultSocials,
          isVisible: true,
          isDeleted: false,
          status: 'published',
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    invalidatePublicSocialsCache();
    res.json({ data: doc?.value ?? resultSocials });
  } catch (error) {
    console.error('Update social links error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

