import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
    },
    type: {
      type: String,
      trim: true,
      default: 'url',
    },
    url: {
      type: String,
      trim: true,
      required: [true, 'URL is required'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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

assetSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

assetSchema.index({ userId: 1, createdAt: -1 });

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;

