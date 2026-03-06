import MediaAsset from '../models/MediaAsset.js';

const extractFilename = (input) => {
  if (!input) return '';
  const str = String(input);
  try {
    if (/^https?:\/\//i.test(str)) {
      const url = new URL(str);
      const parts = url.pathname.split('/');
      return parts[parts.length - 1] || '';
    }
  } catch {
    // fall back to path-based extraction below
  }
  const parts = str.split('/');
  return parts[parts.length - 1] || '';
};

export const addMediaUsage = async (imageRef, entityType, entityId) => {
  const filename = extractFilename(imageRef);
  if (!filename || !entityType || !entityId) return;

  try {
    await MediaAsset.findOneAndUpdate(
      { filename },
      {
        $addToSet: {
          usedBy: { entityType, entityId: String(entityId) },
        },
      },
      { new: true }
    ).lean();
  } catch (error) {
    console.error('addMediaUsage error:', error);
  }
};

export const removeMediaUsage = async (imageRef, entityType, entityId) => {
  const filename = extractFilename(imageRef);
  if (!filename || !entityType || !entityId) return;

  try {
    await MediaAsset.updateMany(
      { filename },
      {
        $pull: {
          usedBy: { entityType, entityId: String(entityId) },
        },
      }
    );
  } catch (error) {
    console.error('removeMediaUsage error:', error);
  }
};

export default {
  addMediaUsage,
  removeMediaUsage,
};

