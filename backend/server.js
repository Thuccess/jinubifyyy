import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import blogRoutes from './routes/blog.js';
import blogsPublicRoutes from './routes/blogsPublic.js';
import contactRoutes from './routes/contact.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import serviceRoutes from './routes/services.js';
import pricingRoutes from './routes/pricing.js';
import orderRoutes from './routes/orders.js';
import demoRoutes from './routes/demos.js';
import cmsRoutes from './routes/cms.js';
import adminCmsRoutes from './routes/adminCms.js';
import briefRoutes from './routes/briefs.js';
import assetRoutes from './routes/assets.js';
import { mongoSanitizeMiddleware } from './middleware/sanitize.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLogger } from './middleware/logger.js';
import { validateEnv } from './config/env.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swagger.js';

// Load environment variables first
dotenv.config();

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;
let server;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

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
app.use('/api/blog', blogRoutes);
app.use('/api/blogs', blogsPublicRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/demos', demoRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/admin/cms', adminCmsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/briefs', briefRoutes);
app.use('/api/assets', assetRoutes);

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
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
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

const connectDB = async (retries = 3, delay = 5000) => {
  const atlasUri = process.env.MONGODB_URI;
  const localUri = getLocalUri();
  const options = getMongoOptions();
  const useAtlas = atlasUri && isAtlasUri(atlasUri);

  // In development: try local MongoDB first so the app works without Atlas (e.g. IP not whitelisted)
  if (process.env.NODE_ENV !== 'production' && useAtlas) {
    try {
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000 });
      console.log('✅ Connected to MongoDB (local)');
      return;
    } catch (_) {
      // Local not running; will try Atlas below
    }
  }

  const mongoUri = atlasUri || localUri;
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(mongoUri, options);
      console.log('✅ Connected to MongoDB');
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
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (useAtlas) {
        console.warn('⚠️  Atlas unreachable. Trying local MongoDB...');
        try {
          await mongoose.connect(localUri, { ...options, family: undefined, autoSelectFamily: undefined });
          console.log('✅ Connected to MongoDB (local fallback)');
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

// Connection event handlers (log message only to avoid huge stack traces)
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message || err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
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
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

