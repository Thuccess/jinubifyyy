/**
 * Seed script: all Jinubify services and sub-services (demos) per master prompt.
 * Run: node scripts/seedDemos.js (with MONGODB_URI or MONGO_URI in .env)
 * Idempotent: uses slug to skip existing services/demos.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';
import Demo from '../models/Demo.js';

dotenv.config();

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// License-friendly placeholder images (deterministic per sub-service)
function placeholderImage(serviceSlug, demoSlug, index = 0) {
  const seed = `${serviceSlug}-${demoSlug}-${index}`.replace(/[^a-z0-9-]/g, '');
  return `https://picsum.photos/seed/${seed}/800/600`;
}

const SERVICES_AND_SUBS = [
  {
    title: 'Social Media Management',
    slug: 'social-media-management',
    description: 'We manage your social media so you can focus on running your business. Professional presence on the platforms your customers use every day.',
    subServices: [
      'Facebook page management',
      'Instagram page management',
      'WhatsApp Business setup',
      'Content planning & scheduling',
      'Post design & captions',
      'Social media posters & flyers',
      'Audience engagement',
      'Page optimization',
      'Performance analytics',
      'Social media captions & copywriting',
    ],
  },
  {
    title: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Turn online attention into real customers. Data-driven strategies to increase visibility, drive traffic, and generate leads.',
    subServices: [
      'Facebook Ads',
      'Google Ads',
      'Lead generation campaigns',
      'Marketing strategy planning',
      'Conversion optimization',
      'Analytics & reporting',
      'Search Engine Optimization (SEO)',
      'Local SEO',
      'Google Business Profile setup',
    ],
  },
  {
    title: 'Graphic Design & Branding',
    slug: 'graphic-design-branding',
    description: 'Make a powerful first impression. Visuals that communicate trust, professionalism, and brand identity.',
    subServices: [
      'Logo design',
      'Brand identity design (colors, fonts & guidelines)',
      'Brand guidelines',
      'Brand messaging support',
      'Social media graphics',
      'Flyers & posters',
      'Banners & signage',
      'Business cards',
      'Brochures & company profiles',
      'Company profiles & presentations',
      'Image editing & design',
      'Branded merchandise design',
    ],
  },
  {
    title: 'Website Design & Development',
    slug: 'website-design-development',
    description: 'Websites that work for your business. Fast, mobile-friendly, and secure sites that showcase your brand and convert visitors.',
    subServices: [
      'Business websites',
      'Corporate websites',
      'NGO & organization websites',
      'Landing pages for promotions',
      'Simple e-commerce websites',
      'Mobile-friendly / responsive design',
      'Website maintenance & updates',
      'Website optimization (performance & SEO)',
      'Contact forms & integrations (WhatsApp, email)',
    ],
  },
  {
    title: 'Software Development',
    slug: 'software-development',
    description: 'Custom software built around your business needs. Tailored solutions to automate processes, manage data, and work more efficiently.',
    subServices: [
      'Custom web applications',
      'Business management systems',
      'Inventory & POS systems',
      'School management systems',
      'NGO management & reporting systems',
      'Booking & service management systems',
      'System integrations & admin panels',
      'Custom admin dashboards & reporting tools',
    ],
  },
  {
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    description: 'Bring your ideas to your customers\' pockets. Practical, user-friendly mobile applications for better service delivery and engagement.',
    subServices: [
      'Android app development',
      'iOS app development',
      'Cross-platform apps',
      'App UI/UX design',
      'App updates & maintenance',
      'App performance optimization',
    ],
  },
  {
    title: 'Printing Services',
    slug: 'printing-services',
    description: 'Professional printing that supports your brand offline. High-quality printing for business, events, and campaigns.',
    subServices: [
      'Business cards',
      'Flyers',
      'Posters',
      'Banners (indoor & outdoor)',
      'Brochures',
      'Stickers & labels',
      'Branded merchandise (T-shirts, mugs, caps)',
      'Event & promotional materials',
    ],
  },
  {
    title: 'Cloud & Hosting Services',
    slug: 'cloud-hosting',
    description: 'Reliable technology that keeps your business online. Secure, scalable cloud and hosting solutions.',
    subServices: [
      'Website hosting setup',
      'Domain registration support',
      'Cloud storage setup',
      'Email hosting & workspace setup (Google Workspace)',
      'Server configuration',
      'Data backup solutions',
      'Basic security setup (HTTPS, backups, hardening)',
    ],
  },
];

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI (or MONGO_URI) in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let servicesCreated = 0;
  let demosCreated = 0;

  for (const svc of SERVICES_AND_SUBS) {
    let service = await Service.findOne({ slug: svc.slug });
    if (!service) {
      service = await Service.create({
        title: svc.title,
        slug: svc.slug,
        description: svc.description,
        isActive: true,
        order: servicesCreated,
      });
      servicesCreated++;
      console.log('Created service:', svc.title);
    }

    for (let i = 0; i < svc.subServices.length; i++) {
      const title = svc.subServices[i];
      const demoSlug = slugify(title);
      const existing = await Demo.findOne({ service: service._id, slug: demoSlug });
      if (existing) continue;

      const imageCount = 3;
      const images = Array.from({ length: imageCount }, (_, idx) => ({
        url: placeholderImage(svc.slug, demoSlug, idx),
        order: idx,
      }));
      const coverImageUrl = images[0].url;

      await Demo.create({
        service: service._id,
        title,
        slug: demoSlug,
        description: `Demos and samples for ${title}.`,
        isActive: true,
        order: i,
        images,
        coverImageUrl,
      });
      demosCreated++;
    }
  }

  console.log('Done. Services created:', servicesCreated, '| Demos created:', demosCreated);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
