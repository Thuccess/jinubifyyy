// Seed Services collection with the same content as the public /services page.
// Usage: node scripts/seedServices.js
// Run once to copy all static services into the database for admin editing.
//
// If you use MongoDB Atlas and get "IP not whitelisted":
//   1. In Atlas: Network Access → Add IP Address (or 0.0.0.0/0 for anywhere), then retry.
//   2. Or seed against local MongoDB: SEED_MONGO_URI=mongodb://localhost:27017/jinubify npm run seed-services

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';

dotenv.config();

// Prefer SEED_MONGO_URI so you can seed against local DB without changing MONGODB_URI
const MONGO_URI =
  process.env.SEED_MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/jinubify';

const STATIC_SERVICES = [
  {
    title: 'Social Media Management',
    slug: 'social-media-management',
    description: 'We manage your social media so you can focus on running your business.',
    intro: "We manage your social media so you can focus on running your business. Jinubify helps you build a strong, professional presence on platforms your customers use every day. We don't just post—we create content that attracts attention, builds trust, and drives engagement.",
    bulletsLabel: 'What you get:',
    bullets: [
      'Facebook & Instagram page management',
      'Content creation (posts, captions & visuals)',
      'Posting schedules & consistency',
      'Audience engagement & page optimization',
      'Performance tracking & insights',
    ],
    hasDemo: true,
    isActive: true,
    order: 0,
  },
  {
    title: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Turn online attention into real customers with data-driven strategies.',
    intro: 'Turn online attention into real customers. Our digital marketing services are designed to increase visibility, drive traffic, and generate leads. We use data-driven strategies tailored to your business goals and market.',
    bulletsLabel: 'Our solutions include:',
    bullets: [
      'Online advertising (Facebook & Google Ads)',
      'Search Engine Optimization (SEO)',
      'Marketing strategy & campaign planning',
      'Lead generation & conversion optimization',
      'Analytics & performance reporting',
    ],
    hasDemo: true,
    isActive: true,
    order: 1,
  },
  {
    title: 'Graphic Design & Branding',
    slug: 'graphic-design-branding',
    description: 'Make a powerful first impression with consistent brand identity.',
    intro: 'Make a powerful first impression. We design visuals that communicate trust, professionalism, and brand identity. From logos to marketing materials, we ensure your brand stands out and stays consistent everywhere.',
    bulletsLabel: 'Design services:',
    bullets: [
      'Logo design',
      'Brand identity (colors, fonts & guidelines)',
      'Flyers, posters & banners',
      'Social media graphics',
      'Company profiles & presentations',
    ],
    hasDemo: true,
    isActive: true,
    order: 2,
  },
  {
    title: 'Website Design & Development',
    slug: 'website-design-development',
    description: 'Websites that work for your business—fast, mobile-friendly, and secure.',
    intro: 'Websites that work for your business. We build fast, mobile-friendly, and secure websites that showcase your brand and help convert visitors into customers.',
    bulletsLabel: 'Website solutions:',
    bullets: [
      'Business & corporate websites',
      'NGO & organization websites',
      'Landing pages for promotions',
      'Simple e-commerce websites',
      'Website maintenance & updates',
    ],
    hasDemo: true,
    isActive: true,
    order: 3,
  },
  {
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    description: 'Bring your ideas to your customers\' pockets with practical mobile apps.',
    intro: "Bring your ideas to your customers' pockets. We develop practical, user-friendly mobile applications that help businesses improve service delivery and customer engagement.",
    bulletsLabel: 'Mobile app services:',
    bullets: [
      'Android app development',
      'Cross-platform mobile apps',
      'App updates & maintenance',
      'Scalable, future-ready solutions',
    ],
    hasDemo: true,
    isActive: true,
    order: 4,
  },
  {
    title: 'Software Development',
    slug: 'software-development',
    description: 'Custom software built around your business needs.',
    intro: 'Custom software built around your business needs. We create tailored software solutions that help you automate processes, manage data, and work more efficiently.',
    bulletsLabel: 'Custom solutions include:',
    bullets: [
      'Business management systems',
      'Inventory & POS systems',
      'School & NGO management systems',
      'Booking & service management systems',
      'Custom web applications',
    ],
    hasDemo: false,
    isActive: true,
    order: 5,
  },
  {
    title: 'Cloud & Hosting Services',
    slug: 'cloud-hosting',
    description: 'Reliable technology that keeps your business online.',
    intro: 'Reliable technology that keeps your business online. We help you set up and manage cloud and hosting solutions that are secure, scalable, and easy to maintain.',
    bulletsLabel: 'Cloud & IT services:',
    bullets: [
      'Website hosting setup',
      'Domain registration support',
      'Cloud storage solutions',
      'Email & workspace setup',
      'Basic security & backups',
    ],
    hasDemo: true,
    isActive: true,
    order: 6,
  },
  {
    title: 'Printing Services',
    slug: 'printing-services',
    description: 'Professional printing that supports your brand offline.',
    intro: 'Professional printing that supports your brand offline. We provide high-quality printing services to help you promote your business, events, and campaigns with confidence.',
    bulletsLabel: 'Printing solutions:',
    bullets: [
      'Business cards',
      'Flyers & posters',
      'Banners (indoor & outdoor)',
      'Brochures & company profiles',
      'Branded merchandise (T-shirts, caps, stickers)',
    ],
    hasDemo: false,
    isActive: true,
    order: 7,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let created = 0;
    let updated = 0;

    for (const item of STATIC_SERVICES) {
      const existing = await Service.findOne({ slug: item.slug });
      if (existing) {
        await Service.findByIdAndUpdate(existing._id, item, { runValidators: true });
        updated++;
      } else {
        await Service.create(item);
        created++;
      }
    }

    console.log(`Services seed done. Created: ${created}, Updated: ${updated}.`);
  } catch (err) {
    const isAtlasConnection =
      err.name === 'MongooseServerSelectionError' ||
      (err.cause && err.cause.type === 'ReplicaSetNoPrimary');
    if (isAtlasConnection) {
      console.error('\nCould not connect to MongoDB Atlas.');
      console.error('Common fix: add your current IP to the Atlas IP whitelist.');
      console.error('  → MongoDB Atlas → Project → Network Access → Add IP Address');
      console.error('  → Or allow 0.0.0.0/0 (anywhere) for development.\n');
      console.error('To seed using local MongoDB instead, run:');
      console.error('  SEED_MONGO_URI=mongodb://localhost:27017/jinubify npm run seed-services\n');
    }
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
