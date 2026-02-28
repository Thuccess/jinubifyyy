import mongoose from 'mongoose';

const pricingPackageSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    price: {
      type: String,
      required: [true, 'Price is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ctaText: {
      type: String,
      trim: true,
    },
    billingPeriod: {
      type: String,
      enum: ['monthly', 'one-time', 'custom'],
      default: 'custom',
    },
    features: {
      type: [String],
      default: [],
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
  },
  {
    timestamps: true,
  }
);

pricingPackageSchema.index({ service: 1, isActive: 1, order: 1, createdAt: -1 });

const PricingPackage = mongoose.model('PricingPackage', pricingPackageSchema);

export default PricingPackage;

