import mongoose from 'mongoose';

const socialSchema = new mongoose.Schema({
  linkedin: { type: String, trim: true, default: '' },
  twitter: { type: String, trim: true, default: '' },
  website: { type: String, trim: true, default: '' },
}, { _id: false });

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true, default: '' },
  bio: { type: String, trim: true, default: '' },
  detailedBio: { type: String, trim: true, default: '' },
  department: { type: String, trim: true, default: '' },
  social: { type: socialSchema, default: () => ({}) },
  order: { type: Number, default: 0 },
}, { _id: true });

const ceoFounderSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    eyebrow: { type: String, trim: true, default: 'Leadership' },
    sectionTitle: { type: String, trim: true, default: 'CEO & Founder' },
    name: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: 'Chief Executive Officer' },
    imageUrl: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    detailedBio: { type: String, trim: true, default: '' },
    quote: { type: String, trim: true, default: '' },
    social: { type: socialSchema, default: () => ({}) },
  },
  { _id: false },
);

const teamPageSchema = new mongoose.Schema(
  {
    slug: { type: String, default: 'team', unique: true },
    hero: {
      eyebrow: { type: String, trim: true, default: 'Our Team' },
      heading: { type: String, trim: true, default: 'Meet the People Behind Jinubify' },
      subtitle: { type: String, trim: true, default: '' },
    },
    ceoFounder: { type: ceoFounderSchema, default: () => ({}) },
    stripHeading: { type: String, trim: true, default: 'Browse team' },
    /** When false, the rotating spotlight + thumbnail strip are hidden on /team (members still stored for admin). */
    showMembersSection: { type: Boolean, default: true },
    members: [teamMemberSchema],
  },
  { timestamps: true }
);

const TeamPage = mongoose.model('TeamPage', teamPageSchema);
export default TeamPage;
