import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

reportSchema.index({ clientId: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;

