import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import MediaAsset from '../models/MediaAsset.js';
import { getUploadsDir } from '../config/uploadsPath.js';

const UPLOAD_DIR = getUploadsDir();

/**
 * Remove files in uploads folder that do not exist in MediaAsset collection.
 * Run weekly to clean orphans (e.g. failed uploads, manual deletes from disk).
 */
async function cleanupUnusedMedia() {
  try {
    // When using Cloudinary, images are not stored on the local filesystem.
    // Running local cleanup would delete unrelated files (or do nothing useful).
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      return;
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      return;
    }
    const filesOnDisk = fs.readdirSync(UPLOAD_DIR).filter((f) => {
      const p = path.join(UPLOAD_DIR, f);
      return fs.statSync(p).isFile();
    });
    const registered = await MediaAsset.distinct('filename');
    const set = new Set(registered);
    const orphans = filesOnDisk.filter((f) => !set.has(f));
    let removed = 0;
    for (const filename of orphans) {
      const filePath = path.join(UPLOAD_DIR, filename);
      try {
        fs.unlinkSync(filePath);
        removed++;
        if (process.env.NODE_ENV !== 'test') {
          console.log('[cleanupUnusedMedia] Removed orphan file:', filename);
        }
      } catch (e) {
        console.error('[cleanupUnusedMedia] Failed to remove:', filename, e.message);
      }
    }
    if (removed > 0 && process.env.NODE_ENV !== 'test') {
      console.log(`[cleanupUnusedMedia] Removed ${removed} orphan file(s).`);
    }
  } catch (err) {
    console.error('[cleanupUnusedMedia] Error:', err);
  }
}

let scheduledTask = null;

/**
 * Start the cron job (weekly, Sunday 03:00). Call after DB is connected.
 */
export function startCleanupUnusedMediaJob() {
  if (scheduledTask) return;
  scheduledTask = cron.schedule('0 3 * * 0', cleanupUnusedMedia, { scheduled: true });
  if (process.env.NODE_ENV !== 'test') {
    console.log('[jobs] cleanupUnusedMedia cron registered (weekly, Sunday 03:00).');
  }
}

/**
 * Stop the cron job (e.g. for tests).
 */
export function stopCleanupUnusedMediaJob() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }
}

export default cleanupUnusedMedia;
