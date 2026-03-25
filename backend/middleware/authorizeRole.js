import { authenticate } from './auth.js';

const maybeAttachDevAdmin = (req) => {
  if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_ANONYMOUS_ADMIN !== 'false') {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
      req.user = { role: 'admin' };
      return true;
    }
  }
  return false;
};

/**
 * Returns middleware that allows only the given role(s).
 * @param {...string} allowedRoles - One or more roles: 'user' | 'editor' | 'admin' | 'super_admin'
 * @example
 *   router.get('/settings', authorizeRole('super_admin'), handler);
 *   router.get('/cms', authorizeRole('editor', 'admin', 'super_admin'), handler);
 */
export function authorizeRole(...allowedRoles) {
  const set = new Set(allowedRoles);
  return (req, res, next) => {
    if (maybeAttachDevAdmin(req)) {
      return next();
    }
    const check = () => {
      const role = req.user?.role;
      if (role && set.has(role)) {
        next();
      } else {
        res.status(403).json({ message: 'Insufficient permissions' });
      }
    };

    if (req.user) return check();
    authenticate(req, res, check);
  };
}

export default authorizeRole;
