import nodemailer from 'nodemailer';
import logger from './logger.js';

// NOTE:
// Do NOT create the transporter at module load time.
// server.js imports routes/utilities before calling `dotenv.config()`,
// so env vars can be undefined when this module is first evaluated.
// Creating the transporter lazily ensures SMTP_* values are present.
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const sendVerificationEmail = async (user, token) => {
  const baseUrl = (process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">Verify your email</h2>
      <p style="margin: 0 0 16px;">Hi ${user?.name || 'there'}, please verify your email to activate your account.</p>
      <p style="margin: 0 0 20px;">
        <a href="${verifyUrl}" style="display: inline-block; padding: 10px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Verify Email
        </a>
      </p>
      <p style="margin: 0 0 8px; color: #4b5563;">This verification link expires in 1 hour.</p>
      <p style="margin: 0; color: #4b5563;">If you did not create this account, you can ignore this email.</p>
    </div>
  `;

  try {
    const transporter = createTransporter();

    // Temporary debug (safe): shows whether creds exist and verifies SMTP connectivity.
    // Guarded so it won't spam production logs.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[smtp debug] SMTP HOST:', process.env.SMTP_HOST || '(default)');
      // eslint-disable-next-line no-console
      console.log('[smtp debug] SMTP PORT:', process.env.SMTP_PORT || 587);
      // eslint-disable-next-line no-console
      console.log('[smtp debug] SMTP USER:', process.env.SMTP_USER || '(undefined)');
      // eslint-disable-next-line no-console
      console.log('[smtp debug] SMTP PASS EXISTS:', !!process.env.SMTP_PASS, 'len:', process.env.SMTP_PASS ? String(process.env.SMTP_PASS).length : 0);

      await transporter.verify();
      // eslint-disable-next-line no-console
      console.log('[smtp debug] transporter.verify(): OK');
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.CONTACT_EMAIL || 'no-reply@jinubify.com',
      to: user.email,
      subject: 'Verify your email',
      html,
    });
  } catch (error) {
    logger.error('Verification email send failed', {
      error: error?.message || String(error),
      stack: error?.stack,
      email: user?.email,
    });
    throw error;
  }
};

export default {
  sendVerificationEmail,
};

