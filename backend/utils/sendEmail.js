import nodemailer from 'nodemailer';
import logger from './logger.js';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendVerificationEmail(user, token) {
  try {
    // Safe SMTP logging: never print the full SMTP password, only its length.
    console.log('[smtp debug] HOST:', process.env.SMTP_HOST);
    console.log('[smtp debug] PORT:', process.env.SMTP_PORT);
    console.log('[smtp debug] USER:', process.env.SMTP_USER);
    console.log('[smtp debug] PASS LENGTH:', process.env.SMTP_PASS?.length);

    const transporter = createTransporter();

    await transporter.verify();
    console.log('[smtp debug] transporter.verify(): OK');

    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const name = user.name || 'there';

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.5; color: #111;">
  <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 22px; margin: 0 0 12px;">🚀 Activate your Jinubify profile</h1>
    <p style="margin: 0 0 16px;">Hi ${name},</p>
    <p style="margin: 0 0 16px;">
      One quick step to activate your profile—you’ll unlock your public identity card, QR code for easy sharing, and networking tools as soon as our team completes review.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${verifyUrl}" style="display: inline-block; padding: 12px 22px; background: #111; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600;">
        Activate My Profile
      </a>
    </p>
    <p style="margin: 0 0 8px; font-size: 13px; color: #555;">
      This link expires in <strong>one hour</strong> for your security. If you didn’t request this, you can ignore this email.
    </p>
    <p style="margin: 0; font-size: 12px; color: #888; word-break: break-all;">
      Or copy this URL into your browser:<br><a href="${verifyUrl}">${verifyUrl}</a>
    </p>
  </div>
</body>
</html>
`.trim();

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: '🚀 Activate your Jinubify profile',
      html,
    });

    console.log('[smtp success] response:', info.response);
  } catch (error) {
    console.error('[smtp ERROR FULL]:', error);
    logger.error('Verification email send failed', {
      error: error?.message || String(error),
      stack: error?.stack,
      email: user?.email,
    });
    throw error;
  }
}

export default {
  sendVerificationEmail,
};
