// Helper to convert sub-service labels into URL-safe slugs
// Must stay in sync with backend slug generation so routes line up.

export function labelToSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

