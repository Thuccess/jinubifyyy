import express from 'express';
import BlogPost from '../models/BlogPost.js';

const router = express.Router();

const PUBLISHED = { $in: [true, 'true'] };
const publishedQuery = () => ({ $or: [{ published: true }, { status: 'published' }] });

const selectList = '-content -versioning -audit';

// GET /api/blogs — list published posts (pagination, search, category, tag, featured, sort)
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const {
      page = 1,
      limit = 12,
      category,
      tag,
      featured,
      search,
      sort = 'date',
      order = 'desc',
    } = req.query;

    const query = publishedQuery();
    if (category) query.category = new RegExp(`^${String(category).trim()}$`, 'i');
    if (tag) query.tags = { $in: [new RegExp(`^${String(tag).trim()}$`, 'i')] };
    if (featured === 'true' || featured === true) query.featured = true;
    // Do not scan `content` (large HTML); list endpoint excludes it anyway. Full-text search can use a text index later.
    if (search && String(search).trim()) {
      const s = String(search).trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { excerpt: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
        { tags: { $regex: s, $options: 'i' } },
      ];
    }

    const sortField = sort === 'views' ? 'metrics.views' : (sort === 'title' ? 'title' : 'date');
    const sortOpt = { [sortField]: order === 'asc' ? 1 : -1 };

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [posts, total] = await Promise.all([
      BlogPost.find(query).select(selectList).sort(sortOpt).skip(skip).limit(limitNum).lean(),
      BlogPost.countDocuments(query),
    ]);

    const normalized = posts.map((p) => ({
      ...p,
      imageUrl: p.coverImage || p.imageUrl,
      author: typeof p.author === 'object' && p.author?.name != null ? p.author.name : p.author,
      views: p.metrics?.views ?? p.views ?? 0,
    }));

    res.json({
      posts: normalized,
      pagination: {
        page: Math.max(1, parseInt(page, 10)),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get public blogs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/blogs/featured — featured published posts
router.get('/featured', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const query = { ...publishedQuery(), featured: true };
    const posts = await BlogPost.find(query)
      .select(selectList)
      .sort({ date: -1 })
      .limit(5)
      .lean();
    const normalized = posts.map((p) => ({
      ...p,
      imageUrl: p.coverImage || p.imageUrl,
      author: typeof p.author === 'object' && p.author?.name != null ? p.author.name : p.author,
      views: p.metrics?.views ?? p.views ?? 0,
    }));
    res.json({ posts: normalized });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/blogs/category/:category
router.get('/category/:category', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const category = decodeURIComponent(req.params.category).trim();
    const { page = 1, limit = 12 } = req.query;
    const query = { ...publishedQuery(), category: new RegExp(`^${category}$`, 'i') };
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [posts, total] = await Promise.all([
      BlogPost.find(query).select(selectList).sort({ date: -1 }).skip(skip).limit(limitNum).lean(),
      BlogPost.countDocuments(query),
    ]);

    const normalized = posts.map((p) => ({
      ...p,
      imageUrl: p.coverImage || p.imageUrl,
      author: typeof p.author === 'object' && p.author?.name != null ? p.author.name : p.author,
      views: p.metrics?.views ?? p.views ?? 0,
    }));

    res.json({
      posts: normalized,
      category,
      pagination: {
        page: Math.max(1, parseInt(page, 10)),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get blogs by category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/blogs/tag/:tag
router.get('/tag/:tag', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const tag = decodeURIComponent(req.params.tag).trim();
    const { page = 1, limit = 12 } = req.query;
    const query = { ...publishedQuery(), tags: { $in: [new RegExp(`^${tag}$`, 'i')] } };
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [posts, total] = await Promise.all([
      BlogPost.find(query).select(selectList).sort({ date: -1 }).skip(skip).limit(limitNum).lean(),
      BlogPost.countDocuments(query),
    ]);

    const normalized = posts.map((p) => ({
      ...p,
      imageUrl: p.coverImage || p.imageUrl,
      author: typeof p.author === 'object' && p.author?.name != null ? p.author.name : p.author,
      views: p.metrics?.views ?? p.views ?? 0,
    }));

    res.json({
      posts: normalized,
      tag,
      pagination: {
        page: Math.max(1, parseInt(page, 10)),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get blogs by tag error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/blogs/:slug — single post (published only), increment views
router.get('/:slug', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  try {
    const slug = req.params.slug.trim();
    const query = { slug, ...publishedQuery() };
    const post = await BlogPost.findOne(query);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const views = (post.metrics && post.metrics.views != null) ? post.metrics.views + 1 : (post.views || 0) + 1;
    await BlogPost.updateOne(
      { _id: post._id },
      { $set: { 'metrics.views': views, views } }
    );

    const doc = post.toObject ? post.toObject() : post;
    const normalized = {
      ...doc,
      imageUrl: doc.coverImage || doc.imageUrl,
      author: typeof doc.author === 'object' && doc.author?.name != null ? doc.author.name : doc.author,
      views,
    };

    res.json({ post: normalized });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
