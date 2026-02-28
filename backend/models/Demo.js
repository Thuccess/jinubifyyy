import mongoose from 'mongoose';

const demoSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Demo title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Demo slug is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Demo description is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    demoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    repoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    techStack: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    embeddedConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    images: {
      type: [
        {
          url: { type: String, required: true, trim: true },
          order: { type: Number, required: true, default: 0 },
        },
      ],
      default: [],
    },
    coverImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    seoTitle: {
      type: String,
      trim: true,
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
  }
);

demoSchema.index({ service: 1, slug: 1 }, { unique: true });
demoSchema.index({ isActive: 1, isDeleted: 1, order: 1, createdAt: -1 });

const Demo = mongoose.model('Demo', demoSchema);

export default Demo;

