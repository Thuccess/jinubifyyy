import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { userFromVerifiedPayload } from '../utils/accessToken.js';

const secret = () => process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, secret());
    const stateless = userFromVerifiedPayload(decoded);
    if (stateless) {
      req.user = stateless;
      return next();
    }

    const legacyId = decoded.userId || decoded.sub;
    if (!legacyId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(legacyId).select('-password').lean();
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = {
      ...user,
      id: user._id.toString(),
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;

    if (token) {
      const decoded = jwt.verify(token, secret());
      const stateless = userFromVerifiedPayload(decoded);
      if (stateless) {
        req.user = stateless;
      } else {
        const legacyId = decoded.userId || decoded.sub;
        if (legacyId) {
          const user = await User.findById(legacyId).select('-password').lean();
          if (user) {
            req.user = { ...user, id: user._id.toString() };
          }
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

/**
 * Email activation + account state gate (DB-backed for security).
 * Allows pending + approved (email verified, active, not rejected). Blocks rejected & deactivated.
 */
export const verifyApproved = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const uid = req.user._id.toString ? req.user._id.toString() : String(req.user._id);
    const fresh = await User.findById(uid)
      .select('isEmailVerified status rejectionReason isActive')
      .lean();
    if (!fresh) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (!fresh.isEmailVerified) {
      return res.status(403).json({ message: 'Please activate your account via email' });
    }
    if (fresh.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact support.' });
    }
    if (fresh.status === 'rejected') {
      const rr = fresh.rejectionReason ? String(fresh.rejectionReason).trim() : '';
      return res.status(403).json({
        message: 'Your application was not approved',
        ...(rr ? { rejectionReason: rr } : {}),
      });
    }
    req.user = {
      ...req.user,
      isEmailVerified: Boolean(fresh.isEmailVerified),
      status: fresh.status,
      rejectionReason: fresh.rejectionReason || '',
      isActive: fresh.isActive !== false,
    };
    return next();
  } catch (err) {
    return res.status(500).json({ message: 'Authentication error', error: err.message });
  }
};
