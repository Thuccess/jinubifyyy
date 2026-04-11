/**
 * Convert YouTube/Vimeo watch links to iframe-safe embed URLs.
 * Watch pages (youtube.com/watch?v=) cannot be embedded and show "refused to connect".
 */
export function toEmbeddableVideoUrl(raw: string): string {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';

  if (/youtube\.com\/embed\//i.test(trimmed) || /youtube-nocookie\.com\/embed\//i.test(trimmed)) {
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  }
  if (/player\.vimeo\.com\/video\//i.test(trimmed)) {
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const u = new URL(withProtocol);
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v');
      if (v) {
        return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v)}`;
      }
      const shorts = u.pathname.match(/\/shorts\/([^/?#]+)/i);
      if (shorts?.[1]) {
        return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(shorts[1])}`;
      }
      const live = u.pathname.match(/\/live\/([^/?#]+)/i);
      if (live?.[1]) {
        return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(live[1])}`;
      }
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
      if (m?.[1]) return `https://player.vimeo.com/video/${m[1]}`;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] && /^\d+$/.test(parts[0])) {
        return `https://player.vimeo.com/video/${parts[0]}`;
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}
