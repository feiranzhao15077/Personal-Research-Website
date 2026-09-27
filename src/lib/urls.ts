/** Resolve public paths against Astro's deployment base; external URLs pass through. */
export function sitePath(path: string = '/') {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (base && (path === base || path.startsWith(`${base}/`))) return path;
  return `${base}${path}`;
}
