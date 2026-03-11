import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { requireAdmin } from '../middleware/admin.js';
import MediaAsset from '../models/MediaAsset.js';
import { getMediaUrlForFilename, getRelativeMediaPath } from '../config/media.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use the same uploads directory as the static /uploads middleware in server.js.
// In production on Render this should point to a persistent disk via UPLOADS_DIR.
const UPLOAD_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
    cb(null, name);
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

    const filename = req.file.filename;
    const url = getMediaUrlForFilename(req, filename);
    const relativePath = getRelativeMediaPath(filename);

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
    // - image: relative path suitable for storing in MongoDB
    res.status(201).json({ url, filename, image: relativePath });
  } catch (err) {
    logger.error('Upload error', { error: err.message, userId: req.user?._id });
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

export default router;
