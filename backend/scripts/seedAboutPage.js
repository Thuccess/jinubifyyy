/**
 * Seed About page content with defaults. Run: node backend/scripts/seedAboutPage.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AboutPage from '../models/AboutPage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const defaultContent = {
  slug: 'about',
  hero: {
    eyebrow: 'About',
    heading: 'Pioneering Digital Excellence',
    subtitle: 'We are a passionate team dedicated to building innovative solutions that empower businesses and individuals in an ever-evolving digital world.',
    primaryCtaText: 'Our Services',
    primaryCtaLink: '/services',
    secondaryCtaText: 'Contact Us',
    secondaryCtaLink: '/contact',
  },
  ourStory: {
    heading: 'Our Story: From a Simple Idea to a Digital Powerhouse',
    imageUrl: 'https://picsum.photos/seed/office/600/400',
    paragraph1: 'Founded in 2024, Jinubify was born from a desire to bridge the gap between technology and user experience. We believe that powerful tools should be accessible to everyone, and our mission is to create software that is not only functional but also a joy to use.',
    paragraph2: "Our team of developers, designers, and strategists works collaboratively to bring cutting-edge ideas to life, pushing the boundaries of what's possible in the digital landscape.",
  },
  stats: {
    heading: 'By The Numbers',
    subtext: 'Our track record speaks for itself.',
    items: [
      { value: 150, label: 'Projects Completed' },
      { value: 95, label: 'Happy Clients (%)' },
      { value: 10, label: 'Years of Experience' },
      { value: 8, label: 'Team Members' },
    ],
  },
  whyJinubify: {
    heading: 'Why Jinubify',
    intro: 'We blend expertise with a passion for innovation and the principles that guide our work.',
    tagline: 'Expertise, innovation, and accountability.',
    differentiators: [
      { iconKey: 'CogIcon', title: 'Proven Expertise', description: 'Our team brings years of industry experience, ensuring every project is guided by deep knowledge and strategic insight.' },
      { iconKey: 'LightBulbIcon', title: 'Technical Innovation', description: 'We are committed to leveraging cutting-edge technology and creative thinking to deliver innovative, future-proof solutions.' },
      { iconKey: 'HandshakeIcon', title: 'Client-Centric Focus', description: 'Your success is our ultimate metric. We build lasting partnerships focused on delivering measurable results and tangible value.' },
    ],
    coreValues: [
      { iconKey: 'SparklesIcon', title: 'Accountable to members', description: 'We take responsibility for our commitments and deliver on our promises to every team member and partner.' },
      { iconKey: 'HeartIcon', title: 'Customer-centricity', description: 'Our clients are our partners. We are deeply committed to understanding and achieving their goals.' },
      { iconKey: 'StarIcon', title: 'Empowering local SMEs', description: 'We help small and medium businesses grow with accessible tools and strategies that level the playing field.' },
    ],
  },
};

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jinubify';
  try {
    await mongoose.connect(uri);
    const existing = await AboutPage.findOne();
    if (existing) {
      console.log('About page content already exists. Skipping seed.');
      process.exit(0);
      return;
    }
    await AboutPage.create(defaultContent);
    console.log('Seeded About page content.');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
