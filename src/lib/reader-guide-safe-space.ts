export interface GuidePoint { x: number; y: number; }
export interface GuideBox { left: number; top: number; right: number; bottom: number; }

/** Read content bounds when a scroll settles or a prompt opens, never during a drag. */
export function guideOccupiedSpace(): GuideBox[] {
  const height = document.documentElement.clientHeight;
  return Array.from(document.querySelectorAll<HTMLElement>(
    'main p, main h1, main h2, main h3, main h4, main h5, main li, main dt, main dd, main a, main button, main img, .b-card, .site-header, [aria-label="返回导航"]',
  )).flatMap(element => {
    if (element.closest('[data-reader-guide]') || !element.getClientRects().length) return [];
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
  const header = document.querySelector('.site-header')?.getBoundingClientRect();
  const top = Math.max(12, header && header.bottom > 0 && header.top < viewHeight ? header.bottom + 12 : 12);
  const bottom = Math.max(top, viewHeight - height - 16), right = Math.max(12, viewWidth - width - 16);
  const occupied = guideOccupiedSpace();
  const candidates = [
    ...(current && current.y >= top && current.y <= bottom && current.x >= 12 && current.x <= right ? [current] : []),
    ...[bottom, top, top + (bottom - top) * .35, top + (bottom - top) * .65]
      .flatMap(y => [{ x: right, y }, { x: 12, y }]),
  ];
  return candidates.reduce((best, point) => {
    const score = guideOverlap({ left: point.x, top: point.y, right: point.x + width, bottom: point.y + height }, occupied);
    return score < best.score ? { point, score } : best;
  }, { point: candidates[0], score: Infinity }).point;
}
