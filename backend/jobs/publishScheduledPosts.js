import cron from 'node-cron';
import BlogPost from '../models/BlogPost.js';

/**
 * Publishes blog posts that are scheduled and whose scheduledAt time has passed.
 * Runs every 5 minutes.
 */
async function publishScheduledPosts() {
  try {
    const now = new Date();
    const result = await BlogPost.updateMany(
      { status: 'scheduled', scheduledAt: { $lte: now } },
      { $set: { status: 'published', published: true, updatedAt: now } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[publishScheduledPosts] Published ${result.modifiedCount} scheduled post(s).`);
    }
  } catch (err) {
    console.error('[publishScheduledPosts] Error:', err);
  }
}

let scheduledTask = null;

/**
 * Start the cron job (every 5 minutes). Call after DB is connected.
 */
export function startPublishScheduledPostsJob() {
  if (scheduledTask) return;
  scheduledTask = cron.schedule('*/5 * * * *', publishScheduledPosts, { scheduled: true });
  console.log('[jobs] publishScheduledPosts cron registered (every 5 minutes).');
}

/**
 * Stop the cron job (e.g. for tests).
 */
export function stopPublishScheduledPostsJob() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }
}

export default publishScheduledPosts;
