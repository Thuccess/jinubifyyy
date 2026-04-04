/**
 * Seed Team page content. Run: node backend/scripts/seedTeamPage.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import TeamPage from '../models/TeamPage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const defaultContent = {
  slug: 'team',
  hero: {
    eyebrow: 'Our Team',
    heading: 'Meet the People Behind Jinubify',
    subtitle: 'We are a passionate team of innovators, creators, and problem-solvers dedicated to building innovative tech and creative solutions that drive success.',
  },
  ceoFounder: {
    enabled: true,
    eyebrow: 'Leadership',
    sectionTitle: 'CEO & Founder',
    name: 'Ruot Maliah',
    title: 'Founder & Chief Executive Officer',
    imageUrl: 'https://picsum.photos/seed/ruot-ceo/600/700',
    bio: 'Driving vision, product strategy, and long-term growth for Jinubify and our clients.',
    detailedBio:
      'Ruot Maliah founded Jinubify to help businesses across East Africa ship modern digital products with clarity and speed. He brings together engineering, marketing, and systems thinking to align technology with revenue and impact.',
    quote: 'We build technology that helps businesses grow with clarity and confidence.',
    social: { linkedin: '#', twitter: '#', website: '#' },
  },
  stripHeading: 'Browse team',
  members: [
    { name: 'Ruot Maliah', role: 'Chief Strategy & Technology Lead', department: 'Strategy & Vision', imageUrl: 'https://picsum.photos/seed/ruot/400/400', bio: 'Company vision, product direction, tech architecture, innovation, and growth strategy.', detailedBio: 'Ruot Maliah leads strategy and technology at Jinubify, shaping company vision, product direction, and technical architecture. With a blend of software engineering, digital marketing, and systems thinking, Ruot drives innovation, growth strategy, and partnerships while building scalable systems that deliver exceptional results for clients worldwide.', social: { linkedin: '#', twitter: '#', website: '#' }, order: 0 },
    { name: 'Marcus Johnson', role: 'Growth, Marketing & Sales Lead', department: 'Growth & Revenue', imageUrl: 'https://picsum.photos/seed/marcus/400/400', bio: 'Client acquisition, campaigns, funnels, sales, and revenue pipelines.', detailedBio: 'Marcus Johnson leads growth, marketing, and sales at Jinubify. He focuses on client acquisition, data-driven campaigns, funnels, and brand growth. Marcus drives revenue pipelines and strategic partnerships, helping the company scale visibility and deliver measurable results for clients.', social: { linkedin: '#', twitter: '#', website: '#' }, order: 1 },
    { name: 'Elena Rodriguez', role: 'Creative & Brand Lead', department: 'Creative & Brand', imageUrl: 'https://picsum.photos/seed/elena/400/400', bio: 'Brand consistency, visual quality, design systems, and creative direction.', detailedBio: 'Elena Rodriguez leads creative and brand at Jinubify. She ensures brand consistency, visual quality, and design systems across all client work. Elena drives creative direction, content quality, and marketing materials that strengthen brand identity and resonate with audiences.', social: { linkedin: '#', twitter: '#', website: '#' }, order: 2 },
    { name: 'Sarah Chen', role: 'Engineering, Systems & IT Lead', department: 'Engineering & Systems', imageUrl: 'https://picsum.photos/seed/sarah/400/400', bio: 'System stability, development delivery, performance, security, and scalability.', detailedBio: 'Sarah Chen leads engineering, systems, and IT at Jinubify. She oversees development delivery, infrastructure, and system stability. Sarah focuses on performance, security, and scalability, ensuring robust and maintainable solutions from backend and frontend through cloud and API systems.', social: { linkedin: '#', twitter: '#', website: '#' }, order: 3 },
    { name: 'Jordan Taylor', role: 'Operations, Production & Logistics Lead', department: 'Operations & Delivery', imageUrl: 'https://picsum.photos/seed/jordan/400/400', bio: 'Execution, timelines, delivery, quality, and process efficiency.', detailedBio: 'Jordan Taylor leads operations, production, and logistics at Jinubify. Jordan ensures execution excellence, timelines, and client delivery through project management, vendor coordination, and workflow systems. Focused on quality control, support operations, and process efficiency, Jordan drives client satisfaction and service delivery.', social: { linkedin: '#', twitter: '#', website: '#' }, order: 4 },
  ],
};

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jinubify';
  try {
    await mongoose.connect(uri);
    const existing = await TeamPage.findOne();
    if (existing) {
      console.log('Team page content already exists. Skipping seed.');
      process.exit(0);
      return;
    }
    await TeamPage.create(defaultContent);
    console.log('Seeded Team page content.');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
