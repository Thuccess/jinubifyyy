import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      trim: true,
      default: 'landing',
      index: true,
    },
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        default: '',
      },
      metaDescription: {
        type: String,
        trim: true,
        default: '',
      },
      keywords: {
        type: [String],
        default: [],
      },
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
      enum: ['draft', 'review', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    lastPublishedAt: {
      type: Date,
    },
    lastPublishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

pageSchema.index({ isDeleted: 1, status: 1, isVisible: 1, order: 1 });
pageSchema.index({ slug: 1, status: 1, isDeleted: 1 });

const Page = mongoose.model('Page', pageSchema);
export default Page;
