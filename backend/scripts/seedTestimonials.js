/**
 * Seed testimonials with default data (from the original Testimonials component).
 * Run: node backend/scripts/seedTestimonials.js
 * Requires MONGODB_URI (or default local MongoDB).
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Testimonial from '../models/Testimonial.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const defaults = [
  {
    name: 'Sanblu Ajiech',
    title: 'Director, Luxorld (Kampala)',
    avatar: 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?q=80&w=400&auto=format&fit=crop',
    text: "Their commitment to quality and proactive communication made them a standout partner. Jinubify didn't just deliver a product; they delivered a solution that exceeded our expectations and drove real business results.",
    stars: 5,
    order: 0,
  },
  {
    name: 'Sarah Williams',
    title: 'Marketing Director, Creative Minds',
    avatar: 'https://picsum.photos/seed/testimonial2/100/100',
    text: 'Working with the Jinubify team has been a game-changer. Their strategic counseling and expertise in digital marketing led to a 200% increase in our online engagement. Highly recommended!',
    stars: 5,
    order: 1,
  },
  {
    name: 'James Rodriguez',
    title: 'CEO, Tech Innovators',
    avatar: 'https://picsum.photos/seed/testimonial3/100/100',
    text: "The mobile app they developed for us is flawless. It's intuitive, fast, and has received overwhelmingly positive feedback from our users. Their development process was transparent and efficient from start to finish.",
    stars: 5,
    order: 2,
  },
  {
    name: 'Emily Chen',
    title: 'Founder, The Style Hub',
    avatar: 'https://picsum.photos/seed/testimonial4/100/100',
    text: "Jinubify's branding and design work gave our startup the professional and compelling identity we needed to stand out. Their creative vision and attention to detail were exceptional.",
    stars: 5,
    order: 3,
  },
  {
    name: 'Michael Thompson',
    title: 'Operations Manager, Global Logistics',
    avatar: 'https://picsum.photos/seed/testimonial5/100/100',
    text: 'The cloud migration project they handled for us was executed with precision and professionalism. We experienced zero downtime, and our systems are now more scalable and secure than ever before.',
    stars: 5,
    order: 4,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jinubify';
  try {
    await mongoose.connect(uri);
    const existing = await Testimonial.countDocuments();
    if (existing > 0) {
      console.log(`Testimonials already exist (${existing}). Skipping seed.`);
      process.exit(0);
      return;
    }
    await Testimonial.insertMany(defaults);
    console.log(`Seeded ${defaults.length} testimonials.`);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
