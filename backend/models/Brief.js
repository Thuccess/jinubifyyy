import mongoose from 'mongoose';

const briefSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceSlug: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    questionsAndAnswers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
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

briefSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

briefSchema.index({ userId: 1, serviceSlug: 1, isDefault: 1 });

const Brief = mongoose.model('Brief', briefSchema);

export default Brief;

