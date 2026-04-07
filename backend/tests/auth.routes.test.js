import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const usersByEmail = new Map();

const sendVerificationEmailMock = vi.fn(async () => {});

class MockUser {
  constructor(data) {
    this._id = data._id || `user_${Math.random().toString(16).slice(2, 10)}`;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.photoURL = data.photoURL || '';
    this.phone = data.phone || '';
    this.company = data.company || '';
    this.website = data.website || '';
    this.status = data.status || 'pending';
    this.isEmailVerified = Boolean(data.isEmailVerified);
    this.emailVerificationToken = data.emailVerificationToken || null;
    this.emailVerificationExpires = data.emailVerificationExpires || null;
    this.role = data.role || 'user';
    this.balance = data.balance || 0;
    this.accountType = data.accountType;
    this.rejectionReason = data.rejectionReason || '';
    this.profileSlug = data.profileSlug ?? null;
    this.qrCodeUrl = data.qrCodeUrl || '';
    this.socialLinks = data.socialLinks || [];
  }

  async save() {
    usersByEmail.set(this.email, this);
    return this;
  }

  async comparePassword(candidate) {
    return candidate === this.password;
  }

  static findOne(query) {
    const resolver = () => {
      if (query?.email) return usersByEmail.get(query.email) || null;
      if (query?.emailVerificationToken) {
        const now = new Date();
        for (const user of usersByEmail.values()) {
          if (
            user.emailVerificationToken === query.emailVerificationToken &&
            user.emailVerificationExpires &&
            user.emailVerificationExpires > (query.emailVerificationExpires?.$gt || now)
          ) {
            return user;
          }
        }
      }
      return null;
    };

    const queryResult = {
      select: async () => resolver(),
      then: (resolve) => Promise.resolve(resolve(resolver())),
      catch: () => queryResult,
    };
    return queryResult;
  }
}

vi.mock('../models/User.js', () => ({
  default: MockUser,
}));

vi.mock('../models/Activity.js', () => ({
  default: { create: vi.fn(async () => {}) },
}));

vi.mock('../middleware/rateLimiter.js', () => ({
  authLimiter: (req, res, next) => next(),
}));

vi.mock('express-rate-limit', () => ({
  default: () => (req, res, next) => next(),
}));

vi.mock('../middleware/auth.js', () => ({
  authenticate: (req, res, next) => {
    const state = req.headers['x-auth-user'];
    if (!state) return res.status(401).json({ message: 'Access denied. No token provided.' });
    const baseUser = {
      _id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com',
      photoURL: '',
      balance: 0,
      role: 'user',
      isEmailVerified: true,
      status: 'approved',
    };
    if (state === 'pending') baseUser.status = 'pending';
    if (state === 'rejected') {
      baseUser.status = 'rejected';
      baseUser.rejectionReason = 'Not a fit';
    }
    if (state === 'unverified') baseUser.isEmailVerified = false;
    req.user = baseUser;
    return next();
  },
  verifyApproved: (req, res, next) => {
    if (!req.user?.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before accessing this resource' });
    }
    if (req.user?.status === 'pending') {
      return res.status(403).json({ message: 'Your account is under review' });
    }
    if (req.user?.status === 'rejected') {
      return res.status(403).json({
        message: 'Your application was not approved',
        rejectionReason: req.user?.rejectionReason || undefined,
      });
    }
    if (req.user?.status !== 'approved') {
      return res.status(403).json({ message: 'Your account is under review' });
    }
    return next();
  },
}));

vi.mock('../utils/logger.js', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('../utils/sendEmail.js', () => ({
  sendVerificationEmail: sendVerificationEmailMock,
}));

let app;

beforeEach(async () => {
  usersByEmail.clear();
  sendVerificationEmailMock.mockClear();
  process.env.JWT_SECRET = 'test-secret';
  const { default: authRoutes } = await import('../routes/auth.js');
  app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
});

describe('auth routes regression', () => {
  it('accepts minimal register payload and sends verification', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Passw0rd!',
      company: 'Acme',
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Check your email to verify your account');
    expect(sendVerificationEmailMock).toHaveBeenCalledTimes(1);
    const created = usersByEmail.get('jane@example.com');
    expect(created).toBeTruthy();
    expect(created.isEmailVerified).toBe(false);
    expect(created.status).toBe('pending');
  });

  it('blocks login before verification, then allows after verify for approved signup users', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Approved User',
      email: 'approved@example.com',
      password: 'Passw0rd!',
      company: 'Acme',
    });
    expect(registerRes.status).toBe(201);

    const verificationToken = sendVerificationEmailMock.mock.calls.at(-1)?.[1];
    expect(verificationToken).toBeTruthy();
    const verifyRes = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: verificationToken });
    expect(verifyRes.status).toBe(200);

    // Still pending approval by default after /register.
    const preApproveLogin = await request(app).post('/api/auth/login').send({
      email: 'approved@example.com',
      password: 'Passw0rd!',
    });
    expect(preApproveLogin.status).toBe(403);
    expect(preApproveLogin.body.message).toBe('Your account is under review');

    // Simulate admin approval (admin route is tested separately).
    const created = usersByEmail.get('approved@example.com');
    created.status = 'approved';

    const postVerifyLogin = await request(app).post('/api/auth/login').send({
      email: 'approved@example.com',
      password: 'Passw0rd!',
    });
    expect(postVerifyLogin.status).toBe(200);
    expect(typeof postVerifyLogin.body.token).toBe('string');
  });

  it('enforces pending approval after email verification on register flow', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Pending User',
      email: 'pending@example.com',
      password: 'Passw0rd!',
      company: 'Acme',
    });
    const token = sendVerificationEmailMock.mock.calls.at(-1)?.[1];
    await request(app).get('/api/auth/verify-email').query({ token });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'pending@example.com',
      password: 'Passw0rd!',
    });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.message).toBe('Your account is under review');
  });

  it('accepts personal registration without company', async () => {
    const res = await request(app).post('/api/auth/register').send({
      accountType: 'personal',
      name: 'Pat Lee',
      email: 'pat@example.com',
      password: 'Passw0rd!',
    });
    expect(res.status).toBe(201);
    const created = usersByEmail.get('pat@example.com');
    expect(created.accountType).toBe('personal');
    expect(created.company).toBe('');
  });

  it('blocks login for rejected accounts with message and optional reason', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Rejected User',
      email: 'rejected@example.com',
      password: 'Passw0rd!',
      company: 'Acme',
    });
    const token = sendVerificationEmailMock.mock.calls.at(-1)?.[1];
    await request(app).get('/api/auth/verify-email').query({ token });
    const u = usersByEmail.get('rejected@example.com');
    u.status = 'rejected';
    u.rejectionReason = 'Incomplete information';

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'rejected@example.com',
      password: 'Passw0rd!',
    });
    expect(loginRes.status).toBe(403);
    expect(loginRes.body.message).toBe('Your application was not approved');
    expect(loginRes.body.rejectionReason).toBe('Incomplete information');
  });

  it('keeps resend verification message anti-enumeration safe', async () => {
    const unknownRes = await request(app).post('/api/auth/resend-verification').send({
      email: 'unknown@example.com',
    });
    expect(unknownRes.status).toBe(200);
    expect(unknownRes.body.message).toBe('If an account exists, a verification email has been sent.');

    await request(app).post('/api/auth/register').send({
      name: 'Known User',
      email: 'known@example.com',
      password: 'Passw0rd!',
      company: 'Acme',
    });
    sendVerificationEmailMock.mockClear();

    const knownRes = await request(app).post('/api/auth/resend-verification').send({
      email: 'known@example.com',
    });
    expect(knownRes.status).toBe(200);
    expect(knownRes.body.message).toBe('If an account exists, a verification email has been sent.');
    expect(sendVerificationEmailMock).toHaveBeenCalledTimes(1);
  });

  it('rejects expired verification tokens', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Expired User',
      email: 'expired@example.com',
      password: 'Passw0rd!',
      company: 'Acme',
    });

    const token = sendVerificationEmailMock.mock.calls.at(-1)?.[1];
    expect(token).toBeTruthy();

    const created = usersByEmail.get('expired@example.com');
    created.emailVerificationExpires = new Date(Date.now() - 60 * 1000);

    const verifyRes = await request(app)
      .get('/api/auth/verify-email')
      .query({ token });
    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.message).toBe('Invalid or expired verification token');
  });

  it('returns /auth/me data for verified and approved users only', async () => {
    const okRes = await request(app).get('/api/auth/me').set('x-auth-user', 'approved');
    expect(okRes.status).toBe(200);
    expect(okRes.body.user.email).toBe('mock@example.com');

    const blockedRes = await request(app).get('/api/auth/me').set('x-auth-user', 'pending');
    expect(blockedRes.status).toBe(403);
    expect(blockedRes.body.message).toBe('Your account is under review');

    const rejectedRes = await request(app).get('/api/auth/me').set('x-auth-user', 'rejected');
    expect(rejectedRes.status).toBe(403);
    expect(rejectedRes.body.message).toBe('Your application was not approved');
    expect(rejectedRes.body.rejectionReason).toBe('Not a fit');
  });
});
