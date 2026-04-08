import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const secret = () => process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

/**
 * Signed JWT with embedded claims — avoids User.findById on every authenticated request.
 * Tokens issued before this change only contain { userId } and trigger one legacy DB lookup.
 *
 * Claims: sub, role, st (status), ev (email verified 0|1), nm, em, ph (photo, optional), bal, v:2
 */
export function signAccessToken(userDoc) {
  const photoURL = userDoc.photoURL ? String(userDoc.photoURL) : '';
  const ph = photoURL.length > 0 && photoURL.length <= 512 ? photoURL : undefined;
  const rr =
    userDoc.status === 'rejected' && userDoc.rejectionReason
      ? String(userDoc.rejectionReason).slice(0, 280)
      : undefined;
  const isActive = userDoc.isActive !== false;
  return jwt.sign(
    {
      sub: userDoc._id.toString(),
      role: userDoc.role,
      st: userDoc.status,
      ev: userDoc.isEmailVerified ? 1 : 0,
      ia: isActive ? 1 : 0,
      nm: userDoc.name,
      em: userDoc.email,
      ...(ph ? { ph } : {}),
      ...(rr ? { rr } : {}),
      bal: typeof userDoc.balance === 'number' ? userDoc.balance : Number(userDoc.balance) || 0,
      v: 2,
    },
    secret(),
    { expiresIn: expiresIn() },
  );
}

/** @returns {object|null} req.user-shaped plain object, or null if legacy token */
export function userFromVerifiedPayload(decoded) {
  if (!decoded || typeof decoded !== 'object') return null;
  const sub = decoded.sub || decoded.userId;
  if (!sub || !mongoose.Types.ObjectId.isValid(sub)) return null;
  const _id = new mongoose.Types.ObjectId(sub);

  if (decoded.v === 2 && decoded.role) {
    return {
      _id,
      id: sub,
      role: decoded.role,
      status: decoded.st,
      isEmailVerified: decoded.ev === 1,
      isActive: decoded.ia !== 0,
      name: decoded.nm || '',
      email: decoded.em || '',
      photoURL:
        decoded.ph ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.nm || 'User')}&background=random`,
      balance: typeof decoded.bal === 'number' ? decoded.bal : Number(decoded.bal) || 0,
      rejectionReason: decoded.rr || '',
    };
  }
  return null;
}
