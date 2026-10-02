import { guideOccupiedSpace, guideOverlap, guideRestingPoint, type GuidePoint } from './reader-guide-safe-space';

interface GuidePositionOptions {
  root: HTMLElement;
  trigger: HTMLButtonElement;
  panel: HTMLElement;
  speech: HTMLElement;
  canAutoPlace: () => boolean;
  onMove: () => void;
  onDrop: () => void;
}

/** Manual placement wins; a card perch is temporary and never changes saved coordinates. */
export function setupGuidePosition({ root, trigger, panel, speech, canAutoPlace, onMove, onDrop }: GuidePositionOptions) {
  const storageKey = 'zfr-reader-guide-position-v1', gap = 12, edge = 12;
  let manual: GuidePoint | null = null, rest: GuidePoint | null = null, position: GuidePoint | null = null;
  let card: Element | null = null, arrival: Animation | null = null;
  let drag: { id: number; startX: number; startY: number; x: number; y: number; maxX: number; maxY: number; moved: boolean } | null = null;
  let frame = 0, scrollTimer = 0, suppressClick = false;
  const compact = matchMedia('(max-width: 700px)');
  const viewport = () => ({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight });
  const bottomEdge = () => compact.matches ? 80 : edge;
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));
  const applyPosition = () => {
    if (!position) {
      for (const property of ['left', 'top', 'bottom', 'transform']) root.style.removeProperty(property);
      return;
    }
    root.style.left = '0px'; root.style.top = '0px'; root.style.bottom = 'auto';
    root.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
  };
  const save = () => {
    if (!manual) return;
    const { width, height } = viewport(), rect = trigger.getBoundingClientRect();
    try { sessionStorage.setItem(storageKey, JSON.stringify({
      x: (manual.x - edge) / Math.max(1, width - rect.width - edge * 2),
      y: (manual.y - edge) / Math.max(1, height - rect.height - edge - bottomEdge()),
    })); } catch {}
  };
  function layout() {
    if (root.dataset.ready !== 'true') return;
    const { width, height } = viewport();
    const rect = card?.getBoundingClientRect();
    const header = document.querySelector('.site-header')?.getBoundingClientRect();
    const headerBottom = header && header.top < height && header.bottom > 0 ? header.bottom : 0;
    // Keep the pose and short speech above the card, clear of its research text.
    const perched = !!rect && !compact.matches && panel.hidden && root.dataset.perchReady === 'true'
      && root.dataset.blocked !== 'true' && root.dataset.minimized !== 'true'
      && rect.top > headerBottom + 150 && rect.top < height - 24 && rect.width >= 240;
    root.dataset.perched = String(perched);
    let anchor = trigger.getBoundingClientRect();
    position = perched && rect ? { x: rect.right - anchor.width - 10, y: rect.top - anchor.height + 5 } : manual ?? rest;
    if (position) {
      position = { x: clamp(position.x, edge, width - anchor.width - edge),
        y: clamp(position.y, edge, height - anchor.height - bottomEdge()) };
      if (!perched && manual) manual = position;
    }
    applyPosition(); anchor = trigger.getBoundingClientRect();
    if (!panel.hidden) {
      const panelWidth = Math.min(360, width - edge * 2);
      panel.style.width = `${panelWidth}px`;
      panel.style.left = `${clamp(anchor.left, edge, width - panelWidth - edge) - anchor.left}px`;
      const above = anchor.top - edge - gap, below = height - anchor.bottom - edge - gap;
      const placeAbove = above >= below;
      panel.style.top = placeAbove ? 'auto' : `${anchor.height + gap}px`;
      panel.style.bottom = placeAbove ? `${anchor.height + gap}px` : 'auto';
      panel.style.maxHeight = `${Math.min(660, Math.max(64, placeAbove ? above : below))}px`;
    }
    if (!speech.hidden) {
      const speechWidth = Math.min(perched && rect ? Math.max(190, rect.width - anchor.width - 24) : 258, 258, width - edge * 2);
      speech.style.width = `${speechWidth}px`;
      const speechHeight = speech.getBoundingClientRect().height;
      let point: GuidePoint;
      if (perched && rect) {
        point = { x: rect.left + 8, y: rect.top - speechHeight - 12 };
      } else {
        const occupied = guideOccupiedSpace();
        const candidates = [
          { x: anchor.right + gap, y: anchor.top + (anchor.height - speechHeight) / 2 },
          { x: anchor.left - speechWidth - gap, y: anchor.top + (anchor.height - speechHeight) / 2 },
          { x: anchor.left, y: anchor.top - speechHeight - gap },
          { x: anchor.left, y: anchor.bottom + gap },
        ].map(p => ({ x: clamp(p.x, edge, width - speechWidth - edge), y: clamp(p.y, edge, height - speechHeight - edge) }));
        point = candidates.reduce((best, p) => {
          const box = { left: p.x, top: p.y, right: p.x + speechWidth, bottom: p.y + speechHeight };
          const score = guideOverlap(box, occupied) + guideOverlap(box, [anchor]) * 10;
          return score < best.score ? { point: p, score } : best;
        }, { point: candidates[0], score: Infinity }).point;
      }
      speech.style.left = `${clamp(point.x, edge, width - speechWidth - edge) - anchor.left}px`;
      speech.style.top = `${clamp(point.y, edge, height - speechHeight - edge) - anchor.top}px`;
      speech.style.bottom = 'auto';
    }
  }
  const autoPlace = () => {
    if (manual || card || drag || compact.matches || !canAutoPlace() || root.dataset.ready !== 'true') return;
    const rect = trigger.getBoundingClientRect();
    rest = guideRestingPoint(rect.width, rect.height, rest);
    layout();
  };
  const scheduleLayout = () => {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; layout(); });
  };
  const perch = (target: Element | null) => {
    const next = target?.closest('#research-map .b-card') ?? null;
    if (next === card) { layout(); return; }
    arrival?.cancel(); arrival = null;
    const from = trigger.getBoundingClientRect();
    card = next; layout();
    if (!card) autoPlace();
    if (root.dataset.perched !== 'true' || root.dataset.paused === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const to = trigger.getBoundingClientRect();
    // Only the character moves. The prompt is immediately readable at its final position.
    arrival = trigger.animate([
      { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`, opacity: .65 },
      { transform: 'translate(0, 0)', opacity: 1 },
    ], { duration: 210, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  };
  const restore = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        const { width, height } = viewport(), rect = trigger.getBoundingClientRect();
        manual = { x: edge + clamp(saved.x, 0, 1) * Math.max(0, width - rect.width - edge * 2),
          y: edge + clamp(saved.y, 0, 1) * Math.max(0, height - rect.height - edge - bottomEdge()) };
      }
    } catch {}
    layout(); autoPlace();
  };
  const reset = () => {
    manual = null; rest = null; card = null; arrival?.cancel();
    try { sessionStorage.removeItem(storageKey); } catch {}
    layout(); autoPlace();
  };
  trigger.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || root.dataset.blocked === 'true') return;
    arrival?.cancel();
    const rect = trigger.getBoundingClientRect(), view = viewport();
    suppressClick = false;
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: rect.left, y: rect.top,
      maxX: view.width - rect.width - edge, maxY: view.height - rect.height - bottomEdge(), moved: false };
    trigger.setPointerCapture(event.pointerId);
  });
  trigger.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) {
      drag.moved = true; root.dataset.dragging = 'true';
      manual = { x: drag.x, y: drag.y }; onMove();
      const rect = trigger.getBoundingClientRect(), view = viewport();
      drag.maxX = view.width - rect.width - edge; drag.maxY = view.height - rect.height - bottomEdge();
    }
    manual = position = { x: clamp(drag.x + dx, edge, drag.maxX), y: clamp(drag.y + dy, edge, drag.maxY) };
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; applyPosition(); });
  });
  const finishDrag = (cancelled = false) => {
    if (!drag) return;
    const moved = drag.moved, id = drag.id; drag = null;
    cancelAnimationFrame(frame); frame = 0;
    applyPosition(); root.dataset.dragging = 'false';
    if (trigger.hasPointerCapture(id)) trigger.releasePointerCapture(id);
    suppressClick = moved && !cancelled;
    if (moved) { layout(); save(); onDrop(); }
    window.setTimeout(() => { suppressClick = false; }, 0);
  };
  trigger.addEventListener('pointerup', () => finishDrag());
  trigger.addEventListener('pointercancel', () => finishDrag(true));
  trigger.addEventListener('lostpointercapture', () => finishDrag(true));
  window.addEventListener('blur', () => finishDrag(true));
  trigger.addEventListener('keydown', event => {
    if (event.key === 'Home') { event.preventDefault(); onMove(); reset(); return; }
    const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const direction = moves[event.key];
    if (!direction) return;
    event.preventDefault();
    const rect = trigger.getBoundingClientRect();
    manual = { x: rect.left, y: rect.top }; onMove();
    const view = viewport(), anchor = trigger.getBoundingClientRect(), distance = event.shiftKey ? 40 : 16;
    manual = { x: clamp(manual.x + direction[0] * distance, edge, view.width - anchor.width - edge),
      y: clamp(manual.y + direction[1] * distance, edge, view.height - anchor.height - bottomEdge()) };
    layout(); save();
  });
  window.addEventListener('scroll', () => {
    if (card) scheduleLayout();
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(autoPlace, 140);
  }, { passive: true });
  window.addEventListener('resize', () => { scheduleLayout(); window.clearTimeout(scrollTimer); scrollTimer = window.setTimeout(autoPlace, 140); });
  window.visualViewport?.addEventListener('resize', scheduleLayout);
  document.addEventListener('transitionend', event => { if (event.target === card && event.propertyName === 'transform') scheduleLayout(); });
  window.addEventListener('pagehide', () => { window.clearTimeout(scrollTimer); cancelAnimationFrame(frame); arrival?.cancel(); });
  return { layout, restore, reset, perch, autoPlace, consumeClick: () => { const consumed = suppressClick; suppressClick = false; return consumed; } };
}
