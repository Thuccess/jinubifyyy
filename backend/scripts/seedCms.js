// Seed CMS collections with default nav and site settings so the public site looks the same.
// Usage: node scripts/seedCms.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NavItem from '../models/NavItem.js';
import SiteSettings from '../models/SiteSettings.js';
import Page from '../models/Page.js';
import Section from '../models/Section.js';

dotenv.config();

const LOCAL_MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jinubify';

const DEFAULT_NAV = [
  { label: 'Home', href: '/', order: 0 },
  { label: 'About Us', href: '/about', order: 1 },
  { label: 'Services', href: '/services', order: 2 },
  { label: 'Pricing', href: '/pricing', order: 3 },
  { label: 'Demos', href: '/demos', order: 4 },
  { label: 'Blog', href: '/blog', order: 5 },
  { label: 'Team', href: '/team', order: 6 },
  { label: 'Contact Us', href: '/contact', order: 7 },
];

const DEFAULT_SITE_SETTINGS = [
  { key: 'siteName', value: 'Jinubify', order: 0 },
  { key: 'metaDescription', value: 'Professional digital marketing and design services.', order: 1 },
  { key: 'footerTagline', value: "Modern solutions for your business needs. Empowering brands to grow their social media presence with cutting-edge strategies and tools.", order: 2 },
  { key: 'footerCtaEyebrow', value: 'Start today', order: 3 },
  { key: 'footerCtaHeading', value: 'Ready to Amplify Your Presence?', order: 4 },
  { key: 'footerCtaBody', value: 'Join Jinubify today and start your journey towards unparalleled social media growth.', order: 5 },
  { key: 'footerCtaButtonText', value: 'Get Started Free', order: 6 },
];

const HOME_SECTIONS = [
  { sectionKey: 'hero', order: 0, content: { badge: 'Major Update!', badgeSub: 'Jinubify v1.0 is now online !', heading: "Unlock Explosive Growth with Authentic Social Engagement", subheading: "The ultimate toolkit for artists, influencers, and brands to build real communities and dominate social media.", ctaText: "Get Started for Free", ctaHref: "/contact", ratingText: "4.8 / 5", ratingSub: "Rating over 500 Reviews", bullets: ["Starting at Just $0.001/K", "Non-drop services", "Lifetime Refills", "24/7 Support"] } },
  { sectionKey: 'partners', order: 1, content: { eyebrow: "Trusted by the world's leading platforms", platformNames: ["YouTube", "Twitter", "Instagram", "TikTok", "Facebook"] } },
  { sectionKey: 'howItWorks', order: 2, content: { eyebrow: "How it works", title: "Launch Your Social Growth in 3 Steps", subtitle: "Go from zero to hero with our streamlined, powerful SMM platform.", steps: [{ title: "Signup for free!", description: "Get a 100% free account" }, { title: "Find Your Service", description: "Browse our extensive list" }, { title: "Select & Order!", description: "See results instantly" }] } },
  { sectionKey: 'services', order: 3, content: { title: "Everything You Need to Succeed", subtitle: "We've built our platform with a focus on quality, reliability, and unparalleled customer support.", items: [{ title: "High Quality Services", description: "We provide top-tier, non-drop services with lifetime refills to ensure your social proof is stable and long-lasting." }, { title: "24/7 Dedicated Support", description: "Our expert team is always available. With live chat and an integrated ticket system, we're here to help you succeed." }] } },
  { sectionKey: 'features', order: 4, content: { eyebrow: "Powerful Features", title: "Automate Your Success with AI-Powered Management", subtitle: "Our intelligent platform analyzes trends and optimizes your campaigns, so you can focus on creating, not managing.", ctaText: "Get Started", ctaHref: "/contact", items: [{ name: "AI-Powered Optimization", description: "Our intelligent algorithms analyze trends to automatically boost your campaigns for maximum impact." }, { name: "Real-time Analytics", description: "Track your growth with a comprehensive dashboard that provides actionable insights at a glance." }, { name: "Automated Management", description: "Set your campaigns and let our platform handle the day-to-day, saving you valuable time." }, { name: "Dedicated 24/7 Support", description: "Our expert team is always available to assist you, ensuring you're never left in the dark." }] } },
  { sectionKey: 'growth', order: 5, content: { badge: "Get Seen Globally", title: "Expand Your Reach Across the Globe 🌎", subtitle: "Whether you're targeting a local community or a global audience, our platform provides the traction you need to get noticed by the right people, anywhere in the world.", ctaText: "Explore Services", ctaHref: "/services" } },
  { sectionKey: 'testimonials', order: 6, content: {} },
  { sectionKey: 'faq', order: 7, content: {} },
];

async function seedNav() {
  const existing = await NavItem.countDocuments();
  if (existing > 0) {
    console.log('Nav items already exist, skipping nav seed.');
    return;
  }
  await NavItem.insertMany(
    DEFAULT_NAV.map((item) => ({
      ...item,
      isVisible: true,
      isDeleted: false,
      status: 'published',
    }))
  );
  console.log('Seeded', DEFAULT_NAV.length, 'nav items.');
}

async function seedSiteSettings() {
  for (const { key, value, order } of DEFAULT_SITE_SETTINGS) {
    await SiteSettings.findOneAndUpdate(
      { key },
      { $setOnInsert: { key, value, order, isVisible: true, isDeleted: false, status: 'published' } },
      { upsert: true }
    );
  }
  console.log('Seeded site settings:', DEFAULT_SITE_SETTINGS.map((s) => s.key).join(', '));
}

async function seedHomePage() {
  let page = await Page.findOne({ slug: 'home' });
  if (!page) {
    page = await Page.create({
      slug: 'home',
      title: 'Home',
      metaDescription: 'Jinubify - Unlock Explosive Growth with Authentic Social Engagement',
      content: {},
      isVisible: true,
      isDeleted: false,
      status: 'published',
      order: 0,
    });
    console.log('Created home page.');
  }
  for (const { sectionKey, order, content } of HOME_SECTIONS) {
    await Section.findOneAndUpdate(
      { page: page._id, sectionKey },
      { $set: { content, order, isVisible: true, isDeleted: false, status: 'published', updatedAt: new Date() } },
      { upsert: true, new: true }
    );
  }
  console.log('Seeded home page sections:', HOME_SECTIONS.length);
}

async function seed() {
  try {
    await mongoose.connect(LOCAL_MONGO_URI);
    console.log('Connected to MongoDB');
    await seedNav();
    await seedSiteSettings();
    await seedHomePage();
    console.log('CMS seed done.');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
