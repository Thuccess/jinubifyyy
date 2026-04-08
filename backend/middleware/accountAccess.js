/**
 * Account state gates for identity dashboard routes (verified email, optional write blocks).
 * Does not replace `authenticate` or `verifyApproved` used elsewhere.
 */

export function requireEmailVerified(req, res, next) {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({ message: 'Please activate your account via email' });
  }
  return next();
}

/** Block POST/PUT/PATCH/DELETE for rejected accounts (read-only identity experience). */
export function blockRejectedWrites(req, res, next) {
  if (req.user?.status === 'rejected') {
    const rr = req.user?.rejectionReason ? String(req.user.rejectionReason).trim() : '';
    return res.status(403).json({
      message: 'Your application was not approved. Profile edits are disabled.',
      ...(rr ? { rejectionReason: rr } : {}),
    });
  }
  return next();
}
