import { authenticate } from './auth.js';

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  // Development-only bypass: allow unauthenticated admin access (no login).
  // Set ALLOW_ANONYMOUS_ADMIN=false in .env to disable in dev.
  if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_ANONYMOUS_ADMIN !== 'false') {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
      req.user = { role: 'admin' };
      return next();
    }
  }

  // First authenticate the user
  authenticate(req, res, () => {
    // Then check if user is admin
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  });
};

