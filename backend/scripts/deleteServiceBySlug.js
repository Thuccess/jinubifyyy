// Soft-delete a service by slug, deactivate its demos, and remove pricing packages for that service.
// Usage: node scripts/deleteServiceBySlug.js <slug>
// Example: node scripts/deleteServiceBySlug.js website-design-development
//
// Uses SEED_MONGO_URI or MONGODB_URI (same as other seed scripts).

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';
import Demo from '../models/Demo.js';
import PricingPackage from '../models/PricingPackage.js';

dotenv.config();

const MONGO_URI =
  process.env.SEED_MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/jinubify';

const slug = process.argv[2];

async function main() {
  if (!slug) {
    console.error('Usage: node scripts/deleteServiceBySlug.js <slug>');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const service = await Service.findOne({ slug, isDeleted: { $ne: true } });
  if (!service) {
    const any = await Service.findOne({ slug }).lean();
    if (any) {
      console.log(`Service "${slug}" is already soft-deleted.`);
    } else {
      console.log(`No service found with slug "${slug}".`);
    }
    await mongoose.disconnect();
    process.exit(0);
  }

  const sid = service._id;
  const now = new Date();

  const demoRes = await Demo.updateMany(
    { service: sid, isDeleted: { $ne: true } },
    { $set: { isDeleted: true, deletedAt: now, isActive: false } }
  );
  const pkgRes = await PricingPackage.deleteMany({ service: sid });

  await Service.findByIdAndUpdate(sid, {
    $set: { isDeleted: true, deletedAt: now, isActive: false },
  });

  console.log(
    `Soft-deleted service "${slug}". Demos updated: ${demoRes.modifiedCount}. Pricing packages removed: ${pkgRes.deletedCount}.`
  );

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
