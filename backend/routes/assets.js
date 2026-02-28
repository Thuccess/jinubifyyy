import express from 'express';
import { body, validationResult } from 'express-validator';
import Asset from '../models/Asset.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All asset routes require authentication
router.use(authenticate);

// @route   GET /api/assets
// @desc    List assets for the current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ assets });
  } catch (error) {
    console.error('List assets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assets
// @desc    Create a new asset (URL-based for now)
// @access  Private
router.post(
  '/',
  [
    body('label').trim().notEmpty().withMessage('Label is required'),
    body('url').trim().isURL().withMessage('Valid URL is required'),
    body('type').optional().trim(),
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

      const { label, url, type = 'url', tags = [] } = req.body;

      const asset = new Asset({
        userId: req.user._id,
        label,
        url,
        type,
        tags,
      });

      await asset.save();

      res.status(201).json({ message: 'Asset created', asset });
    } catch (error) {
      console.error('Create asset error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   DELETE /api/assets/:id
// @desc    Delete an asset
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Asset.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

