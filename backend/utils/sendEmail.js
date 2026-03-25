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

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Verify your email',
      html: `
        <h2>Verify your email</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>Click below to verify:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
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

