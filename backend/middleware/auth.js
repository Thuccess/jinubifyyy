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

// Enforce account readiness on already-authenticated requests.
// Use after `authenticate` on protected route groups.
export const verifyApproved = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({ message: 'Please verify your email before accessing this resource' });
  }
  if (req.user?.status === 'pending') {
    return res.status(403).json({ message: 'Your account is under review' });
  }
  if (req.user?.status === 'rejected') {
    const rr = req.user?.rejectionReason ? String(req.user.rejectionReason).trim() : '';
    return res.status(403).json({
      message: 'Your application was not approved',
      ...(rr ? { rejectionReason: rr } : {}),
    });
  }
  if (req.user?.status !== 'approved') {
    return res.status(403).json({ message: 'Your account is under review' });
  }
  return next();
};
