import mongoose from 'mongoose';

/** URL-safe slug from title */
export function slugifyTitle(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const demoSchema = new mongoose.Schema(
  {
    /** When true, this is a global website showcase demo (optional service). */
    websiteDemo: {
      type: Boolean,
      default: false,
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
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
      trim: true,
      default: '',
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
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
    previewMode: {
      type: String,
      enum: ['iframe', 'new_tab'],
      default: 'new_tab',
    },
    /** Primary card image (website demos); legacy uses coverImageUrl. */
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    gallery: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
      trim: true,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    ctaPrimary: {
      type: String,
      trim: true,
      default: 'View Demo',
    },
    ctaSecondary: {
      type: String,
      trim: true,
      default: 'Get This Website',
    },
    price: {
      type: Number,
      default: null,
      min: 0,
    },
    /** Public listing: active = visible, hidden = not listed */
    visibility: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
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

demoSchema.index(
  { service: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      websiteDemo: { $ne: true },
      service: { $type: 'objectId' },
    },
  }
);

demoSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { websiteDemo: true },
  }
);

demoSchema.index({ isActive: 1, isDeleted: 1, order: 1, createdAt: -1 });
demoSchema.index({ websiteDemo: 1, visibility: 1, isFeatured: 1, createdAt: -1 });

demoSchema.pre('validate', function preValidate(next) {
  if (this.websiteDemo) {
    if (this.service == null) {
      /* ok */
    }
  } else if (!this.service) {
    this.invalidate('service', 'Service is required for service-linked demos');
  }
  next();
});

const Demo = mongoose.model('Demo', demoSchema);

export default Demo;
