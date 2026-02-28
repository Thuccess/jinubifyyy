// Script to create an admin user or promote existing user to admin
// Usage: node scripts/createAdmin.js <email> <password> [name]
// If MONGODB_URI (e.g. Atlas) fails (e.g. IP not whitelisted), tries local MongoDB.

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const LOCAL_MONGO_URI = 'mongodb://localhost:27017/jinubify';
const CONNECT_TIMEOUT_MS = 8000;

async function connectWithFallback() {
  const atlasUri = process.env.MONGODB_URI;
  if (atlasUri) {
    try {
      await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS });
      console.log('✅ Connected to MongoDB');
      return;
    } catch (err) {
      console.warn('⚠️  Could not connect to MONGODB_URI (e.g. Atlas). If using Atlas, add your IP to Network Access.');
      console.warn('   Trying local MongoDB...');
      await mongoose.disconnect().catch(() => {});
    }
  }
  await mongoose.connect(LOCAL_MONGO_URI, { serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS });
  console.log('✅ Connected to MongoDB (local).');
  console.log('   To use this admin, run the backend with the same DB (e.g. local) or whitelist your IP in Atlas and run this script again.');
}

const createAdmin = async () => {
  try {
    await connectWithFallback();

    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || 'Admin User';

    if (!email || !password) {
      console.error('❌ Usage: node scripts/createAdmin.js <email> <password> [name]');
      console.error('   Example: node scripts/createAdmin.js admin@example.com MySecurePass123! Admin');
      process.exit(1);
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      if (password) {
        user.password = await bcrypt.hash(password, 12);
      }
      await user.save();
      console.log(`✅ User ${email} has been promoted to admin`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 12);
      user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
      });
      await user.save();
      console.log(`✅ Admin user created: ${email}`);
    }

    console.log(`\n📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`\n✅ You can now log in at: http://localhost:3000`);
    console.log(`   Then navigate to: http://localhost:3000/admin`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
