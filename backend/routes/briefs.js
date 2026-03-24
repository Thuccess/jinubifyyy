import express from 'express';
import { body, validationResult } from 'express-validator';
import Brief from '../models/Brief.js';
import { authenticate, verifyApproved } from '../middleware/auth.js';

const router = express.Router();

// All brief routes require authentication
router.use(authenticate, verifyApproved);

// @route   GET /api/briefs
// @desc    List briefs for the current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { serviceSlug } = req.query;
    const query = { userId: req.user._id };
    if (serviceSlug) {
      query.serviceSlug = String(serviceSlug).trim();
    }
    const briefs = await Brief.find(query).sort({ updatedAt: -1 }).lean();
    res.json({ briefs });
  } catch (error) {
    console.error('List briefs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/briefs
// @desc    Create a new brief
// @access  Private
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('serviceSlug').optional().trim(),
    body('notes').optional().trim(),
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

      const { title, serviceSlug = '', notes = '', questionsAndAnswers = {}, isDefault = false } =
        req.body;

      const brief = new Brief({
        userId: req.user._id,
        title,
        serviceSlug,
        notes,
        questionsAndAnswers,
        isDefault: !!isDefault,
      });

      await brief.save();

      res.status(201).json({ message: 'Brief created', brief });
    } catch (error) {
      console.error('Create brief error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   PUT /api/briefs/:id
// @desc    Update a brief
// @access  Private
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('serviceSlug').optional().trim(),
    body('notes').optional().trim(),
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

      const { title, serviceSlug, notes, questionsAndAnswers, isDefault } = req.body;
      const update = {};
      if (title !== undefined) update.title = title;
      if (serviceSlug !== undefined) update.serviceSlug = serviceSlug;
      if (notes !== undefined) update.notes = notes;
      if (questionsAndAnswers !== undefined) update.questionsAndAnswers = questionsAndAnswers;
      if (isDefault !== undefined) update.isDefault = !!isDefault;
      update.updatedAt = new Date();

      const brief = await Brief.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: update },
        { new: true }
      ).lean();

      if (!brief) {
        return res.status(404).json({ message: 'Brief not found' });
      }

      res.json({ message: 'Brief updated', brief });
    } catch (error) {
      console.error('Update brief error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   DELETE /api/briefs/:id
// @desc    Delete a brief
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Brief.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Brief not found' });
    }
    res.json({ message: 'Brief deleted' });
  } catch (error) {
    console.error('Delete brief error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

