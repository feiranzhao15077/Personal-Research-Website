/** One passive signal lets optional work wait until the reader stops scrolling. */
let started = false, active = false, timer = 0;
const listeners = new Set<(scrolling: boolean) => void>();

function publish(scrolling: boolean) {
  active = scrolling;
  document.documentElement.dataset.scrollActive = String(scrolling);
  listeners.forEach(listener => listener(scrolling));
}

function start() {
  if (started) return;
  started = true;
  const mark = () => {
    if (document.hidden || document.body.style.overflow === 'hidden') return;
    if (!active) publish(true);
    clearTimeout(timer);
    timer = window.setTimeout(() => publish(false), 360);
  };
  window.addEventListener('scroll', mark, { passive: true });
  // Pause before a wheel scroll reaches the next animation frame.
  window.addEventListener('wheel', event => { if (!event.ctrlKey && (event.deltaX || event.deltaY)) mark(); }, { passive: true });
  window.addEventListener('pagehide', () => { clearTimeout(timer); active = false; });
  window.addEventListener('pageshow', () => publish(false));
}

export function isPageScrolling() { start(); return active; }

export function onPageScrollChange(listener: (scrolling: boolean) => void) {
  start(); listeners.add(listener); listener(active);
  return () => { listeners.delete(listener); };
}

export function waitForPageScrollIdle(signal?: AbortSignal): Promise<boolean> {
  start();
  if (signal?.aborted) return Promise.resolve(false);
  if (!active) return Promise.resolve(true);
  return new Promise(resolve => {
    const finish = (available: boolean) => {
      unsubscribe(); signal?.removeEventListener('abort', abort); resolve(available);
    };
    const abort = () => finish(false);
    const unsubscribe = onPageScrollChange(scrolling => { if (!scrolling) finish(true); });
    signal?.addEventListener('abort', abort, { once: true });
  });
}
