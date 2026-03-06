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

const teamPageSchema = new mongoose.Schema(
  {
    slug: { type: String, default: 'team', unique: true },
    hero: {
      eyebrow: { type: String, trim: true, default: 'Our Team' },
      heading: { type: String, trim: true, default: 'Meet the People Behind Jinubify' },
      subtitle: { type: String, trim: true, default: '' },
    },
    stripHeading: { type: String, trim: true, default: 'Browse team' },
    members: [teamMemberSchema],
  },
  { timestamps: true }
);

const TeamPage = mongoose.model('TeamPage', teamPageSchema);
export default TeamPage;
