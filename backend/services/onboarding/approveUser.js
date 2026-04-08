import User from '../../models/User.js';
import { ensureUniqueProfileSlug } from './slugService.js';
import { getPublicBaseUrl, profileUrlToQrDataUrl } from './qrService.js';

/**
 * Approve a pending (or re-approve) user: set slug, QR data URL, approved metadata.
 * @param {string} userId
 * @param {import('mongoose').Types.ObjectId|string|null} approvedById
 * @returns {Promise<{ user?: object; error?: 'not_found' }>}
 */
export async function approveUserById(userId, approvedById) {
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'not_found' };
  }

  const baseLabel =
    user.accountType === 'business' && user.company?.trim()
      ? user.company
      : user.name?.trim() || user.email?.split('@')[0] || 'user';

  if (!user.profileSlug) {
    user.profileSlug = await ensureUniqueProfileSlug(User, baseLabel);
  }

  const baseUrl = getPublicBaseUrl();
  const publicProfileUrl = `${baseUrl}/u/${user.profileSlug}`;
  const qrSourceUrl = `${publicProfileUrl}?ref=qr`;

  if (!user.qrCodeUrl) {
    user.qrCodeUrl = await profileUrlToQrDataUrl(qrSourceUrl);
  }

  user.status = 'approved';
  user.isActive = true;
  user.approvedAt = new Date();
  user.approvedBy = approvedById || null;
  user.rejectionReason = '';

  await user.save();

  return { user: user.toJSON() };
}
