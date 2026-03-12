import mongoose from 'mongoose';

export const createCollectionItemSchema = () =>
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
      },
      slug: {
        type: String,
        required: [true, 'Slug is required'],
        trim: true,
        lowercase: true,
        index: true,
      },
      description: {
        type: String,
        trim: true,
        default: '',
      },
      imageUrl: {
        type: String,
        trim: true,
        default: '',
      },
      content: {
        type: String,
        trim: true,
        default: '',
      },
      date: {
        type: Date,
        default: null,
        index: true,
      },
      tags: {
        type: [String],
        default: [],
      },
      status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
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
      isDeleted: {
        type: Boolean,
        default: false,
        index: true,
      },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
      timestamps: true,
    }
  );

