import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // Optional authenticated user (dashboard orders); public pricing orders may not have a user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    // Legacy simple fields (kept for backwards compatibility and quick admin summary)
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },

    status: {
      type: String,
      enum: ['pending', 'processing', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
    },

    // Public order metadata
    customer: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      country: { type: String, trim: true },
      city: { type: String, trim: true },
      company: { type: String, trim: true },
      industry: { type: String, trim: true },
      notes: { type: String, trim: true },
    },
    order: {
      service: { type: String, trim: true },
      serviceSlug: { type: String, trim: true },
      packageName: { type: String, trim: true },
      price: { type: Number, min: 0 },
      currency: { type: String, trim: true, default: 'USD' },
      pricingCategory: { type: String, trim: true },
      sourcePage: { type: String, trim: true },
      status: {
        type: String,
        enum: ['pending', 'processing', 'confirmed', 'completed', 'cancelled'],
      },
    briefId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brief' },
    assetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
      orderTimestamp: { type: Date },
    },

    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Keep updatedAt current
orderSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  // Ensure top-level status mirrors nested order.status when present
  if (this.order && this.order.status && this.status !== this.order.status) {
    this.status = this.order.status;
  } else if (this.order && !this.order.status) {
    this.order.status = this.status;
  }
  // Ensure legacy fields are populated from nested order for public pricing orders
  if (!this.serviceName && this.order && this.order.service) {
    this.serviceName = this.order.service;
  }
  if ((this.price == null || Number.isNaN(this.price)) && this.order && this.order.price != null) {
    this.price = this.order.price;
  }
  if (!this.quantity) {
    this.quantity = 1;
  }
  next();
});

// Indexes for performance
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'order.serviceSlug': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

