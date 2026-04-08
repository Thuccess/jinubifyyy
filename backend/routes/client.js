import express from 'express';
import { authenticate, verifyApproved } from '../middleware/auth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Activity from '../models/Activity.js';
import MediaAsset from '../models/MediaAsset.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Message from '../models/Message.js';
import Report from '../models/Report.js';

const router = express.Router();

// All client routes require authentication
router.use(authenticate, verifyApproved);

// @route   GET /api/client/dashboard-summary
// @desc    Get high-level dashboard metrics for the logged-in client
// @access  Private
router.get('/dashboard-summary', async (req, res) => {
  try {
    const clientId = req.user._id;

    const [user, orders, recentActivities, recentAssets] = await Promise.all([
      User.findById(clientId).select('balance'),
      Order.find({ userId: clientId })
        .select('status createdAt')
        .sort({ createdAt: -1 })
        .limit(25)
        .lean(),
      Activity.find({ userId: clientId })
        .select('type description createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      MediaAsset.find({ owner: clientId })
        .select('originalName url createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .catch(() => []),
    ]);

    const activeProjects = orders.filter(o => ['processing', 'confirmed'].includes(o.status)).length;
    const pendingTasks = orders.filter(o => o.status === 'pending').length;

    res.json({
      summary: {
        activeProjects,
        pendingTasks,
        recentUpdates: recentActivities.length,
        unreadMessages: 0,
      },
      notifications: recentActivities,
      recentFiles: recentAssets,
      recentPayments: [], // placeholder – wired when payments are modeled
      balance: user?.balance ?? 0,
    });
  } catch (error) {
    console.error('Client dashboard summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/client/projects
// @desc    List projects/services for client (backed by orders for now)
// @access  Private
router.get('/projects', async (req, res) => {
  try {
    const clientId = req.user._id;

    const orders = await Order.find({ userId: clientId })
      .sort({ createdAt: -1 })
      .lean();

    const projects = orders.map(o => ({
      id: o._id,
      title: o.serviceName,
      description: o.notes || '',
      status: o.status || 'pending',
      timeline: null,
      milestones: [],
      client_id: clientId,
      created_at: o.createdAt,
    }));

    res.json({ projects });
  } catch (error) {
    console.error('Client projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/client/projects/:id
// @desc    Get single project detail for client
// @access  Private
router.get('/projects/:id', async (req, res) => {
  try {
    const clientId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId: clientId }).lean();
    if (!order) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const activities = await Activity.find({ userId: clientId, 'metadata.orderId': order._id })
      .select('type description createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const files = await MediaAsset.find({ owner: clientId, 'usage.orderId': order._id })
      .select('originalName url createdAt')
      .lean()
      .catch(() => []);

    res.json({
      project: {
        id: order._id,
        title: order.serviceName,
        description: order.notes || '',
        status: order.status || 'pending',
        timeline: null,
        milestones: [],
        client_id: clientId,
        created_at: order.createdAt,
      },
      updates: activities,
      files: files.map(f => ({
        id: f._id,
        name: f.originalName,
        url: f.url,
        created_at: f.createdAt,
      })),
      messages: [],
    });
  } catch (error) {
    console.error('Client project detail error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/client/messages
// @desc    List messages for the client, optionally filtered by project
// @access  Private
router.get('/messages', async (req, res) => {
  try {
    const clientId = req.user._id;
    const { projectId } = req.query;

    const query = {
      $or: [{ senderId: clientId }, { receiverId: clientId }],
    };
    if (projectId) {
      query.projectId = projectId;
    }

    const messages = await Message.find(query)
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
    console.error('Client messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/client/messages
// @desc    Send a message to Jinubify team (optionally tied to a project)
// @access  Private
router.post('/messages', async (req, res) => {
  try {
    const clientId = req.user._id;
    const { projectId, message, attachments } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // For now, receiver is null; admin-facing UI can populate specific staff IDs.
    const msg = new Message({
      projectId: projectId || undefined,
      senderId: clientId,
      receiverId: clientId, // placeholder until team accounts are wired
      message,
      attachments,
    });

    await msg.save();

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
    console.error('Client send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/client/files
// @desc    List media assets owned by the client
// @access  Private
router.get('/files', async (req, res) => {
  try {
    const clientId = req.user._id;
    const files = await MediaAsset.find({ owner: clientId })
      .select('originalName url createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      files: files.map(f => ({
        id: f._id,
        name: f.originalName,
        url: f.url,
        uploaded_by: clientId,
        project_id: null,
        created_at: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('Client files error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/client/payments
// @desc    List invoices/payments (mapped from orders for now)
// @access  Private
router.get('/payments', async (req, res) => {
  try {
    const clientId = req.user._id;
    const orders = await Order.find({ userId: clientId })
      .select('price status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const invoices = orders.map(o => ({
      id: o._id,
      client_id: clientId,
      amount: o.price,
      status: o.status === 'completed' ? 'paid' : 'pending',
      due_date: o.createdAt,
      invoice_pdf_url: null,
    }));

    res.json({ invoices });
  } catch (error) {
    console.error('Client payments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/client/reports
// @desc    List reports accessible to this client
// @access  Private
router.get('/reports', async (req, res) => {
  try {
    const clientId = req.user._id;
    const { projectId } = req.query;

    const query = { clientId };
    if (projectId) {
      query.projectId = projectId;
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      reports: reports.map((r) => ({
        id: r._id,
        project_id: r.projectId || null,
        title: r.title,
        file_url: r.fileUrl,
        created_at: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Client reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/client/service-request
// @desc    Create a new service request
// @access  Private
router.post('/service-request', async (req, res) => {
  try {
    const clientId = req.user._id;
    const { serviceType, projectDescription, budget, deadline, attachments } = req.body;

    if (!serviceType || !projectDescription) {
      return res.status(400).json({ message: 'Service Type and Project Description are required' });
    }

    const request = new ServiceRequest({
      clientId,
      serviceType,
      projectDescription,
      budget,
      deadline,
      attachments,
    });

    await request.save();

    res.status(201).json({
      message: 'Service request submitted successfully',
      request,
    });
  } catch (error) {
    console.error('Service request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/client/profile
// @desc    Update client profile fields
// @access  Private
router.patch('/profile', async (req, res) => {
  try {
    const clientId = req.user._id;
    const { name, email, phone, company, password, photoURL } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (company !== undefined) update.company = company;
    if (password !== undefined) update.password = password;
    if (photoURL !== undefined) update.photoURL = photoURL;

    const user = await User.findById(clientId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    Object.assign(user, update);
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ message: 'Profile updated', user: safeUser });
  } catch (error) {
    console.error('Client profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

