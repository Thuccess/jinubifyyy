import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { mongoSanitizeMiddleware } from './middleware/sanitize.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLogger } from './middleware/logger.js';
import { validateEnv } from './config/env.js';
import { ensureUploadsDir } from './config/uploadsPath.js';
import { startPublishScheduledPostsJob } from './jobs/publishScheduledPosts.js';
import { startCleanupUnusedMediaJob } from './jobs/cleanupUnusedMedia.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swagger.js';

// Load environment variables first
dotenv.config();

// Validate environment variables
validateEnv();

// Load routes AFTER dotenv has populated process.env.
// This avoids any SMTP/JWT env-dependent initialization happening at import-time.
const [
  { default: authRoutes },
  { default: userRoutes },
  { default: blogRoutes },
  { default: blogsPublicRoutes },
  { default: contactRoutes },
  { default: dashboardRoutes },
  { default: adminRoutes },
  { default: clientRoutes },
  { default: serviceRoutes },
  { default: pricingRoutes },
  { default: orderRoutes },
  { default: demoRoutes },
  { default: testimonialRoutes },
  { default: aboutRoutes },
  { default: teamRoutes },
  { default: cmsRoutes },
  { default: adminCmsRoutes },
  { default: briefRoutes },
  { default: assetRoutes },
  { default: careerRoutes },
  { default: investmentRoutes },
  { default: pagesPublicRoutes },
  { default: uploadRoutes },
  { default: eventsRoutes },
  { default: portfolioRoutes },
  { default: siteSocialsRoutes },
  { default: publicProfileRoutes },
] = await Promise.all([
  import('./routes/auth.js'),
  import('./routes/users.js'),
  import('./routes/blog.js'),
  import('./routes/blogsPublic.js'),
  import('./routes/contact.js'),
  import('./routes/dashboard.js'),
  import('./routes/admin.js'),
  import('./routes/client.js'),
  import('./routes/services.js'),
  import('./routes/pricing.js'),
  import('./routes/orders.js'),
  import('./routes/demos.js'),
  import('./routes/testimonials.js'),
  import('./routes/about.js'),
  import('./routes/team.js'),
  import('./routes/cms.js'),
  import('./routes/adminCms.js'),
  import('./routes/briefs.js'),
  import('./routes/assets.js'),
  import('./routes/career.js'),
  import('./routes/investment.js'),
  import('./routes/pagesPublic.js'),
  import('./routes/upload.js'),
  import('./routes/events.js'),
  import('./routes/portfolio.js'),
  import('./routes/siteSocials.js'),
  import('./routes/publicProfile.js'),
]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

function resolveListenPort() {
  const raw = process.env.PORT;
  if (raw != null && String(raw).trim() !== '') {
    const n = parseInt(String(raw), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ PORT is missing or invalid. In production the host must set PORT (e.g. Render).');
    process.exit(1);
  }
  return 5000;
}

const PORT = resolveListenPort();

/**
 * Optional bind address. Unset = Node default (:: / dual-stack on modern Node), which works well on Render.
 * Set LISTEN_HOST=0.0.0.0 to force IPv4-only if your platform requires it.
 */
const LISTEN_HOST =
  process.env.LISTEN_HOST != null && String(process.env.LISTEN_HOST).trim() !== ''
    ? String(process.env.LISTEN_HOST).trim()
    : undefined;
let server;
let reconnectTimer = null;
let reconnectInFlight = false;
/** True only after `app.listen` — avoid process.exit during a stray post-start connect attempt. */
let httpServerListening = false;
/** URI that last worked — reconnect must not flip local↔Atlas without disconnect (Mongoose forbids). */
let mongoUriLastSucceeded = null;
/** Prevents reconnect running before initial connect finishes (would call cold connect with empty lastSucceeded). */
let mongoDisconnectHandlerAttached = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mongooseDisconnectSafe() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch {
    // ignore — clear stale client if any
  }
}

// Trust Render / reverse proxy (correct req.ip, req.protocol, rate limits)
app.set('trust proxy', 1);

// Serve uploads FIRST so GET /uploads/* never hits JSON 404 from API-style handlers.
// Path must match multer + admin media delete (see config/uploadsPath.js).
const uploadsDir = ensureUploadsDir();
if (process.env.NODE_ENV === 'production') {
  console.log('[uploads] Static files from:', uploadsDir);
} else {
  console.log('STATIC SERVING FROM:', uploadsDir, '| exists:', fs.existsSync(uploadsDir));
}

app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '30d',
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    },
  }),
);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["'self'", 'https:', 'http:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  // Allow resources (including /uploads images) to be embedded cross-origin
  // while still sending an explicit Cross-Origin-Resource-Policy header.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// HTTP compression (gzip)
app.use(
  compression({
    threshold: 1024,
    level: 6,
    memLevel: 8,
  }),
);

// CORS configuration
const allowedOrigins = (() => {
  const envList = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Prefer explicit FRONTEND_URL (set in Render Blueprint) instead of a stale hardcoded allowlist.
  const frontendUrl = (process.env.FRONTEND_URL || '').trim();

  // Safe defaults for your local dev + canonical domain.
  const defaults = ['http://localhost:3000', 'https://jinubify.com', 'https://www.jinubify.com'];

  const all = [...envList, ...(frontendUrl ? [frontendUrl] : []), ...defaults];
  return Array.from(new Set(all));
})();

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
};

app.use(cors(corsOptions));

// Request ID middleware (must be early in the chain)
app.use(requestIdMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB injection protection
app.use(mongoSanitizeMiddleware);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
  app.use(requestLogger);
}

// Health check at root for Render / load balancers
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Jinubify API',
    message: 'Backend is running',
  });
});

// General API rate limiting
app.use('/api', apiLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Jinubify API Documentation',
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/public', publicProfileRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/blogs', blogsPublicRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/demos', demoRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/admin/cms', adminCmsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/briefs', briefRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/pages', pagesPublicRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/site', siteSocialsRoutes);

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  };

  const statusCode = healthCheck.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// 404 handler
app.use(notFound);

// Error handler middleware (must be last)
app.use(errorHandler);

// MongoDB connection options that improve Atlas connectivity (TLS/IPv4)
const getMongoOptions = () => {
  const base = {
    maxPoolSize: Math.min(200, Math.max(10, parseInt(process.env.MONGO_MAX_POOL_SIZE || '50', 10) || 50)),
    minPoolSize: Math.min(20, Math.max(0, parseInt(process.env.MONGO_MIN_POOL_SIZE || '2', 10) || 2)),
    maxIdleTimeMS: parseInt(process.env.MONGO_MAX_IDLE_MS || '60000', 10) || 60_000,
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_MS || '15000', 10) || 15_000,
    connectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS || '15000', 10) || 15_000,
    retryWrites: true,
  };
  // Avoid TLS/SSL handshake errors with Atlas (Node 17+ may prefer IPv6; Atlas can reject)
  if (process.env.MONGODB_URI?.includes('mongodb.net')) {
    base.family = 4;
    base.autoSelectFamily = false;
  }
  return base;
};

const getLocalUri = () =>
  process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/jinubify';

const isAtlasUri = (uri) => uri && uri.includes('mongodb.net');

const connectDB = async (retries = 3, delay = 5000, { reconnect = false } = {}) => {
  const atlasUri = process.env.MONGODB_URI;
  const localUri = getLocalUri();
  const options = getMongoOptions();
  const useAtlas = atlasUri && isAtlasUri(atlasUri);

  if (mongoose.connection.readyState === 1) {
    return;
  }

  // After a disconnect, reuse only the last URI — dev "local first" would call connect(local) while
  // the driver may still hold Atlas, causing: "Can't call openUri() on an active connection with different connection strings".
  if (reconnect) {
    if (!mongoUriLastSucceeded) {
      return connectDB(retries, delay, { reconnect: false });
    }
    await mongooseDisconnectSafe();
    for (let i = 0; i < retries; i++) {
      try {
        const reconnectOpts = mongoUriLastSucceeded.includes('mongodb.net')
          ? options
          : { ...options, family: undefined, autoSelectFamily: undefined };
        await mongoose.connect(mongoUriLastSucceeded, reconnectOpts);
        console.log('✅ MongoDB reconnected');
        return;
      } catch (err) {
        console.error(`❌ MongoDB reconnect attempt ${i + 1}/${retries} failed:`, err.message);
        if (i < retries - 1) await sleep(delay);
      }
    }
    throw new Error('MongoDB reconnect exhausted retries');
  }

  await mongooseDisconnectSafe();

  // In development: try local MongoDB first so the app works without Atlas (e.g. IP not whitelisted)
  if (process.env.NODE_ENV !== 'production' && useAtlas) {
    try {
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000 });
      console.log('✅ Connected to MongoDB (local)');
      mongoUriLastSucceeded = localUri;
      return;
    } catch (_) {
      await mongooseDisconnectSafe();
    }
  }

  const mongoUri = atlasUri || localUri;
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(mongoUri, options);
      console.log('✅ Connected to MongoDB');
      mongoUriLastSucceeded = mongoUri;
      return;
    } catch (error) {
      const isTlsOrNetwork =
        error.name === 'MongooseServerSelectionError' ||
        error.message?.includes('SSL') ||
        error.message?.includes('TLS') ||
        error.cause?.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR';
      console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
      } else if (useAtlas) {
        console.warn('⚠️  Atlas unreachable. Trying local MongoDB...');
        await mongooseDisconnectSafe();
        try {
          await mongoose.connect(localUri, { ...options, family: undefined, autoSelectFamily: undefined });
          console.log('✅ Connected to MongoDB (local fallback)');
          mongoUriLastSucceeded = localUri;
          return;
        } catch (localErr) {
          console.error('❌ Local MongoDB also failed:', localErr.message);
          console.error('\n💡 To fix: (1) Add your IP in Atlas → Network Access, or (2) Start local MongoDB (e.g. brew services start mongodb-community) and restart.\n');
          process.exit(1);
        }
      } else {
        if (atlasUri && isTlsOrNetwork) {
          console.error('\n💡 Add your IP in Atlas → Network Access → Add IP Address.\n');
        }
        process.exit(1);
      }
    }
  }
};

const scheduleReconnect = () => {
  if (!mongoDisconnectHandlerAttached) return;
  if (reconnectInFlight || reconnectTimer) return;
  // Short delayed retry keeps reconnect non-blocking for request handling.
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (mongoose.connection.readyState === 1 || reconnectInFlight) return;
    reconnectInFlight = true;
    try {
      console.warn('🔄 MongoDB reconnect attempt starting...');
      await connectDB(2, 3000, { reconnect: true });
    } catch (error) {
      console.error('❌ MongoDB reconnect failed:', error.message || error);
      // Re-schedule instead of blocking or exiting.
      scheduleReconnect();
    } finally {
      reconnectInFlight = false;
    }
  }, 3000);
};

// Connection event handlers (log message only to avoid huge stack traces)
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message || err);
});

function attachMongoDisconnectHandler() {
  if (mongoDisconnectHandlerAttached) return;
  mongoDisconnectHandlerAttached = true;
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
    scheduleReconnect();
  });
}

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } catch (e) {
      console.error('MongoDB close error:', e.message || e);
    }
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    await connectDB();
    // Attach after first successful connect so early `disconnected` events do not schedule
    // a parallel cold `connectDB` while `mongoUriLastSucceeded` is still null (that could process.exit after listen).
    attachMongoDisconnectHandler();
    if (process.env.NODE_ENV === 'development') {
      const { ensureDevAdminIfMissing } = await import('./utils/ensureDevAdmin.js');
      await ensureDevAdminIfMissing();
    }
    // Keep cron workloads out of local dev/test to reduce event-loop pressure
    // and improve API responsiveness while iterating.
    if (process.env.NODE_ENV === 'production') {
      startPublishScheduledPostsJob();
      startCleanupUnusedMediaJob();
    }
    const onListening = () => {
      httpServerListening = true;
      const hostLabel = LISTEN_HOST || '(all interfaces)';
      console.log(`🚀 Server listening on http://${hostLabel}:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    };
    server = LISTEN_HOST ? app.listen(PORT, LISTEN_HOST, onListening) : app.listen(PORT, onListening);
    server.keepAliveTimeout = 75_000;
    server.headersTimeout = 76_000;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

