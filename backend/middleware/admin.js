import { authenticate } from './auth.js';

// Base helper to attach a dev admin user when ALLOW_ANONYMOUS_ADMIN is enabled.
// Returns true if it handled the request by attaching a user, false otherwise.
const maybeAttachDevAdmin = (req) => {
  if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_ANONYMOUS_ADMIN !== 'false') {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
      req.user = { role: 'admin' };
      return true;
    }
  }
  return false;
};

// Middleware to check if user is admin (or super_admin) for full admin area
export const requireAdmin = (req, res, next) => {
  if (maybeAttachDevAdmin(req)) {
    return next();
  }

  authenticate(req, res, () => {
    const role = req.user?.role;
    if (role === 'admin' || role === 'super_admin') {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  });
};

// Middleware to allow CMS editors (editor, admin, super_admin) for content management
export const requireCmsEditor = (req, res, next) => {
  if (maybeAttachDevAdmin(req)) {
    return next();
  }

  authenticate(req, res, () => {
    const role = req.user?.role;
    if (role === 'editor' || role === 'admin' || role === 'super_admin') {
      next();
    } else {
      res.status(403).json({ message: 'CMS editor access required' });
    }
  });
};

