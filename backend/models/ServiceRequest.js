import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      required: true,
      trim: true,
    },
    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
    },
    deadline: {
      type: Date,
    },
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['new', 'in_review', 'approved', 'rejected', 'converted'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ clientId: 1, createdAt: -1 });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

export default ServiceRequest;

