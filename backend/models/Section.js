import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      required: true,
      index: true,
    },
    sectionKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      trim: true,
      index: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'review', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ page: 1, isDeleted: 1, status: 1, order: 1 });

const Section = mongoose.model('Section', sectionSchema);
export default Section;
