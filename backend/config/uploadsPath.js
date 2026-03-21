import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __configDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Absolute directory for uploaded files.
 * Must be identical for: express.static('/uploads'), multer, admin deletes, cleanup job.
 *
 * On Render with a persistent disk, set UPLOADS_DIR (e.g. /data/uploads) in the dashboard.
 */
export function getUploadsDir() {
  const fromEnv = (process.env.UPLOADS_DIR || '').trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  // backend/uploads (this file lives in backend/config/)
  return path.resolve(path.join(__configDir, '..', 'uploads'));
}

export function ensureUploadsDir() {
  const dir = getUploadsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
