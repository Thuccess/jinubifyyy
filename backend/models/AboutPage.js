import mongoose from 'mongoose';

const statSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true, trim: true },
}, { _id: false });

const valueItemSchema = new mongoose.Schema({
  iconKey: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
}, { _id: false });

const aboutPageSchema = new mongoose.Schema(
  {
    slug: { type: String, default: 'about', unique: true },
    hero: {
      eyebrow: { type: String, trim: true, default: 'About' },
      heading: { type: String, trim: true, default: 'Pioneering Digital Excellence' },
      subtitle: { type: String, trim: true, default: '' },
      primaryCtaText: { type: String, trim: true, default: 'Our Services' },
      primaryCtaLink: { type: String, trim: true, default: '/services' },
      secondaryCtaText: { type: String, trim: true, default: 'Contact Us' },
      secondaryCtaLink: { type: String, trim: true, default: '/contact' },
    },
    ourStory: {
      heading: { type: String, trim: true, default: '' },
      imageUrl: { type: String, trim: true, default: '' },
      paragraph1: { type: String, trim: true, default: '' },
      paragraph2: { type: String, trim: true, default: '' },
    },
    stats: {
      heading: { type: String, trim: true, default: 'By The Numbers' },
      subtext: { type: String, trim: true, default: 'Our track record speaks for itself.' },
      items: [statSchema],
    },
    whyJinubify: {
      heading: { type: String, trim: true, default: 'Why Jinubify' },
      intro: { type: String, trim: true, default: '' },
      tagline: { type: String, trim: true, default: '' },
      differentiators: [valueItemSchema],
      coreValues: [valueItemSchema],
    },
  },
  { timestamps: true }
);

const AboutPage = mongoose.model('AboutPage', aboutPageSchema);
export default AboutPage;
