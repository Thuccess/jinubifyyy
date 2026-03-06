import { resolveImageUrl } from './image';

export function getImageUrl(path?: string): string {
  if (!path) return '';
  return resolveImageUrl(path);
}

