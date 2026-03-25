import express from 'express';
import { body, validationResult } from 'express-validator';
import BlogPost from '../models/BlogPost.js';
import { authenticate, optionalAuth, verifyApproved } from '../middleware/auth.js';
import { blogWriteLimiter } from '../middleware/rateLimiter.js';
import { requireAdmin, requireCmsEditor } from '../middleware/admin.js';
import { addMediaUsage, removeMediaUsage } from '../utils/mediaUsage.js';

const router = express.Router();

// @route   GET /api/blog
// @desc    Get all blog posts (admin: filter by status/published; public: published only)
// @access  Public (admins can see unpublished)
router.get('/', optionalAuth, async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const { search, category, tag, page = 1, limit = 10, published, status } = req.query;
    const query = {};

    const isCmsEditor = req.user && ['editor', 'admin', 'super_admin'].includes(req.user.role);
    if (isCmsEditor) {
      if (status && ['draft', 'review', 'scheduled', 'published', 'archived'].includes(status)) {
        if (status === 'published') {
          query.$or = [{ status: 'published' }, { status: { $exists: false }, published: true }];
        } else {
          query.status = status;
        }
      } else if (published !== undefined) {
        query.published = published === 'true';
      }
    } else {
      query.$or = [{ published: true }, { status: 'published' }];
    }

    if (search && String(search).trim()) {
      const searchOr = [
        { title: { $regex: String(search).trim(), $options: 'i' } },
        { excerpt: { $regex: String(search).trim(), $options: 'i' } },
        { content: { $regex: String(search).trim(), $options: 'i' } },
        { category: { $regex: String(search).trim(), $options: 'i' } },
        { author: { $regex: String(search).trim(), $options: 'i' } },
        { tags: { $regex: String(search).trim(), $options: 'i' } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    if (category) query.category = new RegExp(`^${String(category).trim()}$`, 'i');
    if (tag) query.tags = { $in: [new RegExp(`^${String(tag).trim()}$`, 'i')] };

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const posts = await BlogPost.find(query)
      .select('-content')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page: Math.max(1, parseInt(page, 10)),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/blog/:slug
// @desc    Get single blog post by slug (admins can see any status)
// @access  Public (admins can see unpublished)
router.get('/:slug', optionalAuth, async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const slug = req.params.slug.trim();
    const baseQuery = { slug };
    const isCmsEditor = req.user && ['editor', 'admin', 'super_admin'].includes(req.user.role);
    const visibility = !isCmsEditor
      ? { $or: [{ published: true }, { status: 'published' }] }
      : {};
    const query = Object.keys(visibility).length ? { $and: [baseQuery, visibility] } : baseQuery;

    const post = await BlogPost.findOne(query);
    if (!post) return res.status(404).json({ message: 'Blog post not found' });

    const views = (post.metrics && post.metrics.views != null) ? post.metrics.views + 1 : (post.views || 0) + 1;
    await BlogPost.updateOne(
      { _id: post._id },
      { $set: { 'metrics.views': views, views } }
    );

    const doc = post.toObject ? post.toObject() : post;
    res.json({ post: { ...doc, views } });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/blog
// @desc    Create a new blog post
// @access  Private (Admin)
router.post(
  '/',
  blogWriteLimiter,
  authenticate,
  verifyApproved,
  requireCmsEditor,
  [
    body('slug').trim().notEmpty().withMessage('Slug is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
    body('content').notEmpty().withMessage('Content is required'),
    // Allow either absolute or relative image paths; just require a non-empty string
    body('imageUrl').trim().notEmpty().withMessage('Image URL is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
          })),
        });
      }

      const postData = { ...req.body };
      const existingPost = await BlogPost.findOne({ slug: postData.slug });
      if (existingPost) {
        return res.status(400).json({ message: 'Blog post with this slug already exists' });
      }

      if (!postData.status) postData.status = postData.published ? 'published' : 'draft';
      if (postData.audit === undefined) postData.audit = {};
      postData.audit.createdBy = req.user.id;
      if (postData.status === 'published') {
        postData.audit.publishedBy = req.user.id;
        postData.audit.publishedAt = new Date();
      }

      const post = new BlogPost(postData);
      await post.save();

      // Track media usage for the primary image, if present.
      if (post.imageUrl) {
        await addMediaUsage(post.imageUrl, 'BlogPost', String(post._id));
      }

      res.status(201).json({
        message: 'Blog post created successfully',
        post,
      });
    } catch (error) {
      console.error('Create blog post error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   PUT /api/blog/:slug
// @desc    Update a blog post (supports status, featured, seo, tags, coverImage, etc.)
// @access  Private (Admin)
router.put('/:slug', blogWriteLimiter, authenticate, verifyApproved, requireCmsEditor, async (req, res) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };
    if (update.audit === undefined) update.audit = {};
    update.audit.updatedBy = req.user.id;
    if (update.status === 'published') {
      update.audit.publishedBy = req.user.id;
      update.audit.publishedAt = new Date();
      update.published = true;
    } else if (['draft', 'review', 'archived'].includes(update.status)) {
      update.published = false;
    }

    const existing = await BlogPost.findOne({ slug: req.params.slug.trim() }).lean();

    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug.trim() },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!post) return res.status(404).json({ message: 'Blog post not found' });

    // Update media usage if the image has changed.
    if (update.imageUrl && existing && existing.imageUrl !== update.imageUrl) {
      await removeMediaUsage(existing.imageUrl, 'BlogPost', String(post._id));
      await addMediaUsage(update.imageUrl, 'BlogPost', String(post._id));
    }

    res.json({ message: 'Blog post updated successfully', post });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/blog/:slug/status
// @desc    Update only status (draft | review | published | archived)
// @access  Private (Admin)
router.patch('/:slug/status', blogWriteLimiter, authenticate, verifyApproved, requireCmsEditor, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;
    if (!status || !['draft', 'review', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const update = { status, updatedAt: new Date() };
    update.published = status === 'published';
    update['audit.updatedBy'] = req.user.id;
    if (status === 'published') {
      update['audit.publishedBy'] = req.user.id;
      update['audit.publishedAt'] = new Date();
    }

    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug.trim() },
      { $set: update },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: 'Blog post not found' });

    res.json({ message: 'Status updated', post });
  } catch (error) {
    console.error('Patch blog status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/blog/:slug
// @desc    Delete a blog post
// @access  Private (Admin)
router.delete('/:slug', authenticate, verifyApproved, requireCmsEditor, async (req, res) => {
  try {
    const post = await BlogPost.findOneAndDelete({ slug: req.params.slug });

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

