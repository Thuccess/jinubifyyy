const slugifyBase = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'user';

/**
 * @param {typeof User} UserModel
 * @param {string} label name or company
 */
export async function ensureUniqueProfileSlug(UserModel, label) {
  let slug = slugifyBase(label);
  if (!slug) slug = 'user';
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const exists = await UserModel.findOne({ profileSlug: candidate }).select('_id').lean();
    if (!exists) return candidate;
    n += 1;
    if (n > 2000) {
      throw new Error('Unable to allocate a unique profile slug');
    }
  }
}
