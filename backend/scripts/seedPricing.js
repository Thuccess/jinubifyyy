// Seed pricing packages with the original hardcoded /pricing content.
// Usage: npm run seed-pricing
//
// This script:
// - Looks up services by slug (created by seedServices / services CMS)
// - Creates or updates PricingPackage docs for each package listed below
//
// After running:
// - Admin can edit them in /admin/pricing
// - Public /pricing (now API-driven) will render them from MongoDB

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';
import PricingPackage from '../models/PricingPackage.js';
import { DEFAULT_PRICING_PACKAGES } from '../data/defaultPricing.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/jinubify';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    let created = 0;
    let updated = 0;

    for (const group of DEFAULT_PRICING_PACKAGES) {
      const service = await Service.findOne({ slug: group.serviceSlug, isActive: true, isDeleted: { $ne: true } }).lean();
      if (!service) {
        console.warn(`⚠️  Skipping pricing group for slug "${group.serviceSlug}" because service not found or inactive.`);
        continue;
      }

      for (const pkg of group.packages) {
        const existing = await PricingPackage.findOne({ service: service._id, name: pkg.name });
        const payload = {
          service: service._id,
          name: pkg.name,
          price: pkg.price,
          description: pkg.description,
          ctaText: pkg.ctaText,
          billingPeriod: 'custom',
          features: pkg.features,
          isFeatured: pkg.isFeatured,
          isActive: true,
          order: pkg.order,
        };

        if (existing) {
          await PricingPackage.findByIdAndUpdate(existing._id, payload, { runValidators: true });
          updated++;
        } else {
          await PricingPackage.create(payload);
          created++;
        }
      }
    }

    console.log(`Pricing seed done. Created: ${created}, Updated: ${updated}.`);
  } catch (err) {
    console.error('Seed pricing error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();

