import express from 'express';
import multer from 'multer';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { requireAdmin } from '../middleware/admin.js';
import MediaAsset from '../models/MediaAsset.js';
import cloudinary from '../config/cloudinary.js';
import logger from '../utils/logger.js';

const extractFilename = (input) => {
  if (!input) return '';
  const str = String(input);
  try {
    const url = new URL(str);
    const parts = url.pathname.split('/');
    return parts[parts.length - 1] || '';
  } catch {
    return str.split('/').pop() || '';
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'jinubify',
    resource_type: 'image',
    // Cloudinary requires `public_id` to be computed per-upload.
    public_id: (_req, file) => {
      const parsed = path.parse(file.originalname || '');
      const base = (parsed.name || 'upload').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'upload';
      const timestamp = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      return `${base}-${timestamp}-${rand}`;
    },
    // Keep output format close to the original extension where possible.
    format: (_req, file) => {
      const parsed = path.parse(file.originalname || '');
      const ext = (parsed.ext || '').replace('.', '').toLowerCase();
      const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const safe = allowed.includes(ext) ? ext : 'jpg';
      return safe === 'jpeg' ? 'jpg' : safe;
    },
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    // Allow any image/* MIME type; reject non-images.
    if (/^image\//i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = express.Router();
router.use(requireAdmin);

router.post('/', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large. Max 5MB.' });
      return res.status(400).json({ message: err.message || 'Invalid file' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided. Use field name \"image\".' });
    }

    // With `multer-storage-cloudinary`, `req.file.path` is the Cloudinary secure URL.
    const url = req.file.path;
    const filename = extractFilename(url);

    // Persist in MediaAsset collection for centralized tracking.
    try {
      await MediaAsset.create({
        filename,
        url,
        tags: [],
        usedBy: [],
      });
    } catch (e) {
      // Do not fail the upload if metadata persistence fails.
      console.error('MediaAsset create error:', e);
    }

    // Backwards-compatible response:
    // - url: absolute URL for immediate previews
    // - image: keep compatibility with existing frontend code by returning the same absolute URL
    res.status(201).json({ url, filename, image: url });
  } catch (err) {
    logger.error('Upload error', { error: err.message, userId: req.user?._id });
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

export default router;
