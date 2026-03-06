import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  type: {
    type: String,
    enum: ['order', 'payment', 'profile_update', 'service_activation', 'admin_action'],
    required: [true, 'Activity type is required'],
  },
  /** Human-readable action for admin log (e.g. "Created post", "Updated order") */
  action: {
    type: String,
    trim: true,
  },
  /** Entity type for filtering (e.g. "blog", "order", "user", "service") */
  entityType: {
    type: String,
    trim: true,
  },
  /** Related entity ID */
  entityId: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
activitySchema.index({ userId: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ entityType: 1 });
activitySchema.index({ createdAt: -1, entityType: 1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;

