export interface GuidePoint { x: number; y: number; }
export interface GuideBox { left: number; top: number; right: number; bottom: number; }

/** Read content bounds when a scroll settles or a prompt opens, never during a drag. */
export function guideOccupiedSpace(): GuideBox[] {
  const height = document.documentElement.clientHeight;
  const contents = 'p, h1, h2, h3, h4, h5, li, dt, dd, a, button, img, .b-card';
  // Read section bounds first, so paragraphs in far-off sections need no geometry reads.
  const visibleSections = Array.from(document.querySelector('main')?.children ?? []).filter(section => {
    const rect = section.getBoundingClientRect();
    return !rect.width || !rect.height || (rect.bottom > 0 && rect.top < height);
  });
  const candidates = new Set<Element>(document.querySelectorAll(
    '.site-header, .cabinet-nav, .cabinet-footer, .space-nav a, .space-nav button, .space-owner, [aria-label="返回导航"]',
  ));
  visibleSections.forEach(section => {
    if (section.matches(contents)) candidates.add(section);
    section.querySelectorAll(contents).forEach(element => candidates.add(element));
  });
  return Array.from(candidates).flatMap(element => {
    if (element.closest('[data-reader-guide]')) return [];
    const rect = element.getBoundingClientRect();
    return rect.width && rect.height && rect.bottom > 0 && rect.top < height ? [rect] : [];
  });
}

export function guideOverlap(box: GuideBox, occupied: GuideBox[]) {
  return occupied.reduce((sum, rect) => sum
    + Math.max(0, Math.min(box.right, rect.right + 6) - Math.max(box.left, rect.left - 6))
    * Math.max(0, Math.min(box.bottom, rect.bottom + 6) - Math.max(box.top, rect.top - 6)), 0);
}

/** Prefer a quiet outer margin; retain a safe current spot rather than constantly moving. */
export function guideRestingPoint(width: number, height: number, current: GuidePoint | null): GuidePoint {
  const viewWidth = document.documentElement.clientWidth, viewHeight = document.documentElement.clientHeight;
  const header = document.querySelector('.site-header, .cabinet-nav, .space-nav')?.getBoundingClientRect();
  const top = Math.max(12, header && header.bottom > 0 && header.top < viewHeight ? header.bottom + 12 : 12);
  const bottom = Math.max(top, viewHeight - height - 16), right = Math.max(12, viewWidth - width - 16);
  const spaceHeader = document.querySelector('.space-nav')?.getBoundingClientRect();
  const occupied = guideOccupiedSpace();
  const candidates = [
    ...(current && current.y >= top && current.y <= bottom && current.x >= 12 && current.x <= right ? [current] : []),
    // The personal page has a quiet gap between Return and the owner name.
    ...(spaceHeader && spaceHeader.bottom > 0 && spaceHeader.top < viewHeight ? [{ x: (viewWidth - width) / 2, y: Math.max(12, spaceHeader.top + 12) }] : []),
    ...[bottom, top, top + (bottom - top) * .35, top + (bottom - top) * .65]
      .flatMap(y => [{ x: right, y }, { x: 12, y }]),
  ];
  return candidates.reduce((best, point) => {
    const score = guideOverlap({ left: point.x, top: point.y, right: point.x + width, bottom: point.y + height }, occupied);
    return score < best.score ? { point, score } : best;
  }, { point: candidates[0], score: Infinity }).point;
}
