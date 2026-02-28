/**
 * Promote an existing user to admin by calling the backend API.
 * The backend must be running (e.g. npm run dev). Only works when NODE_ENV !== 'production'.
 *
 * Usage: node scripts/promoteAdmin.js <email>
 * Example: node scripts/promoteAdmin.js admin@jinubify.com
 */
const email = process.argv[2];
const baseUrl = process.env.API_URL || 'http://localhost:5000';

if (!email) {
  console.error('Usage: node scripts/promoteAdmin.js <email>');
  process.exit(1);
}

async function promote() {
  try {
    const res = await fetch(`${baseUrl}/api/auth/promote-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Error:', data.message || res.statusText);
      process.exit(1);
    }
    console.log('Success:', data.message);
    console.log('User:', data.user?.email, 'role:', data.user?.role);
  } catch (err) {
    console.error('Request failed. Is the backend running?', err.message);
    process.exit(1);
  }
}

promote();
