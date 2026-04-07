import mongoose from 'mongoose';

const publicProfileEventSchema = new mongoose.Schema({
  profileSlug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  kind: {
    type: String,
    enum: ['view', 'click'],
    required: true,
    index: true,
  },
  /** For clicks: whatsapp | website | vcf | social | mail */
  target: {
    type: String,
    trim: true,
    default: '',
    maxlength: 64,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

publicProfileEventSchema.index({ profileSlug: 1, createdAt: -1 });

const PublicProfileEvent = mongoose.model('PublicProfileEvent', publicProfileEventSchema);

export default PublicProfileEvent;
