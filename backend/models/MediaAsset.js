import mongoose from 'mongoose';

const usedBySchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const mediaAssetSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    usedBy: [usedBySchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

mediaAssetSchema.index({ createdAt: -1 });
mediaAssetSchema.index({ tags: 1, createdAt: -1 });

const MediaAsset = mongoose.model('MediaAsset', mediaAssetSchema);

export default MediaAsset;

