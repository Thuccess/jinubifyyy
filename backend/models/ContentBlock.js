import mongoose from 'mongoose';

const contentBlockSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    blockType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

contentBlockSchema.index({ isDeleted: 1, status: 1, isVisible: 1, order: 1 });

const ContentBlock = mongoose.model('ContentBlock', contentBlockSchema);
export default ContentBlock;
