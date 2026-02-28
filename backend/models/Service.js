import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Service slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    intro: {
      type: String,
      trim: true,
      default: '',
    },
    bulletsLabel: {
      type: String,
      trim: true,
      default: '',
    },
    bullets: {
      type: [String],
      default: [],
    },
    hasDemo: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    icon: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    startingPrice: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
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

serviceSchema.index({ isActive: 1, order: 1, createdAt: -1 });
serviceSchema.index({ isDeleted: 1, isActive: 1, order: 1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;

