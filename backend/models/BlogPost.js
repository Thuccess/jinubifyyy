import mongoose from 'mongoose';

const STATUSES = ['draft', 'review', 'published', 'archived'];

const blogPostSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
    default: undefined,
  }],
  author: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: 'Jinubify',
    validate: {
      validator(v) {
        return typeof v === 'string' || (v && typeof v === 'object' && (v.name != null));
      },
      message: 'Author must be a string or { id, name }',
    },
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    default: undefined,
  }],
  date: {
    type: Date,
    default: Date.now,
  },
  published: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: STATUSES,
    default: 'published',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String, trim: true, default: undefined }],
  },
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  versioning: {
    version: { type: Number, default: 1 },
    history: [{
      version: Number,
      content: String,
      updatedAt: Date,
      updatedBy: mongoose.Schema.Types.ObjectId,
    }],
  },
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    publishedAt: { type: Date, default: null },
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: false });

blogPostSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.coverImage === '' && this.imageUrl) this.coverImage = this.imageUrl;
  if (this.status === 'published') this.published = true;
  else if (this.status === 'draft' || this.status === 'review' || this.status === 'archived') this.published = false;
  if (this.metrics && this.metrics.views === undefined) this.metrics.views = this.views ?? 0;
  next();
});

blogPostSchema.index({ published: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ date: -1 });
blogPostSchema.index({ featured: 1, date: -1 });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
export { STATUSES };
