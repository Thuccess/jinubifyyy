export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const s = String(hex || '').trim();
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(s);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbaFromHex(hex: string, alpha: number): string {
  const p = parseHexColor(hex);
  if (!p) return '';
  return `rgba(${p.r},${p.g},${p.b},${alpha})`;
}

export function textLuminance(hex: string): number | null {
  const p = parseHexColor(hex);
  if (!p) return null;
  const [rs, gs, bs] = [p.r, p.g, p.b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Valid #RGB / #RRGGBB or empty */
export function isValidProfileHex(v: string): boolean {
  const s = String(v || '').trim();
  if (s === '') return true;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
}

export function colorInputValue(hex: string | undefined, fallback: string): string {
  const s = String(hex || '').trim();
  if (!parseHexColor(s)) return fallback;
  if (s.length === 4) return expandShortHex(s);
  return s.toLowerCase();
}

function expandShortHex(short: string): string {
  const m = /^#([0-9a-fA-F]{3})$/.exec(short.trim());
  if (!m) return short;
  const [a, b, c] = m[1].split('');
  return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
}
