import User from '../models/User.js';
import {
  DEV_ADMIN_DEFAULT_EMAIL,
  DEV_ADMIN_DEFAULT_PASSWORD,
} from '../config/devAdminDefaults.js';

/**
 * In development, if there is no admin/super_admin yet, create a default admin
 * so local sign-in works without running createAdmin.js first.
 * Opt out: SKIP_DEV_ADMIN_BOOTSTRAP=1
 * Override: DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD (min 8 chars in schema)
 */
export async function ensureDevAdminIfMissing() {
  if (process.env.NODE_ENV !== 'development') return; // not in test/staging/production
  if (process.env.SKIP_DEV_ADMIN_BOOTSTRAP === '1') return;

  const adminExists = await User.exists({
    role: { $in: ['admin', 'super_admin'] },
  });
  if (adminExists) return;

  const email = (process.env.DEV_ADMIN_EMAIL || DEV_ADMIN_DEFAULT_EMAIL).toLowerCase().trim();
  const password = process.env.DEV_ADMIN_PASSWORD || DEV_ADMIN_DEFAULT_PASSWORD;

  let user = await User.findOne({ email });
  if (user) {
    user.role = 'admin';
    user.status = 'approved';
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.password = password;
    await user.save();
    console.log(`🔧 Development: promoted existing ${email} to admin (password reset to configured dev default).`);
    return;
  }

  await User.create({
    name: process.env.DEV_ADMIN_NAME || 'Admin',
    email,
    password,
    role: 'admin',
    status: 'approved',
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null,
  });
  console.log(
    `\n🔧 Development: no admin user found — created ${email}`,
    `\n   Use the dev admin password from config/devAdminDefaults.js (or DEV_ADMIN_PASSWORD).`,
    `\n   Opt out: SKIP_DEV_ADMIN_BOOTSTRAP=1\n`,
  );
}
