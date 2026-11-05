import { isPageScrolling, onPageScrollChange } from './page-scroll';

/** Keep decorative exhibits out of the critical render and scrolling work. */
export function setupModelStages() {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-model-stage]:not([data-stage-queued])'));
  if (!roots.length) return;
  const near = new Set<HTMLElement>();
  const pending = new Map<HTMLElement, { timer: number; idle: number }>();
  const headerHeight = Math.ceil(document.querySelector('.site-header, .space-nav')?.getBoundingClientRect().height || 0);
  const pageAvailable = () => !isPageScrolling() && !document.hidden && document.body.style.overflow !== 'hidden'
    && !document.documentElement.matches('.hero-intro-pending, .space-opening-pending');
  const cancel = (root: HTMLElement) => {
    const work = pending.get(root);
    if (!work) return;
    clearTimeout(work.timer);
    if (work.idle && 'cancelIdleCallback' in window) window.cancelIdleCallback(work.idle);
    pending.delete(root);
  };
  const load = (root: HTMLElement) => {
    cancel(root);
    if (!root.isConnected || root.dataset.stageMounted || root.dataset.stageLoading) return;
    root.dataset.stageLoading = 'true';
    if (!root.dataset.stageDesktop) {
      root.querySelector<HTMLElement>('[data-stage-status]')!.textContent = '三维模型正在准备，先看看高清图。';
      return;
    }
    import('./model-stage-runtime').then(({ mountModelStage }) => {
      if (!root.isConnected) return;
      // The module can finish downloading after the reader has started scrolling again.
      if (root.dataset.stageMode === 'entry' && (!pageAvailable() || !near.has(root))) {
        delete root.dataset.stageLoading;
        if (near.has(root)) queue(root);
        return;
      }
      return mountModelStage(root);
    }).catch(() => {
      delete root.dataset.stageLoading;
      root.querySelector<HTMLElement>('[data-stage-status]')!.textContent = '暂时无法打开三维展柜，可以继续查看高清图。';
    });
  };
  const queue = (root: HTMLElement) => {
    if (!pageAvailable() || pending.has(root) || root.dataset.stageLoading || root.dataset.stageMounted) return;
    const work = { timer: 0, idle: 0 };
    pending.set(root, work);
    work.timer = window.setTimeout(() => {
      const start = () => {
        pending.delete(root);
        if (pageAvailable() && near.has(root)) load(root);
      };
      if (typeof window.requestIdleCallback === 'function') work.idle = window.requestIdleCallback(start, { timeout: 1000 });
      else work.timer = window.setTimeout(start, 80);
    }, 160);
  };
  const entries = new IntersectionObserver(items => {
    items.forEach(item => {
      const root = item.target as HTMLElement;
      if (item.isIntersecting) { near.add(root); queue(root); }
      else { near.delete(root); cancel(root); }
    });
  }, { rootMargin: `-${headerHeight}px 0px 60px 0px`, threshold: .1 });
  const viewers = new IntersectionObserver(items => {
    items.forEach(item => {
      if (!item.isIntersecting) return;
      viewers.unobserve(item.target); load(item.target as HTMLElement);
    });
  }, { rootMargin: '220px' });
  roots.forEach(root => {
    root.dataset.stageQueued = 'true';
    if (root.dataset.stageMode === 'entry') entries.observe(root);
    else viewers.observe(root);
  });
  const visibility = () => {
    if (!pageAvailable()) [...pending.keys()].forEach(cancel);
    else near.forEach(queue);
  };
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pageshow', visibility);
  const stopScroll = onPageScrollChange(visibility);
  const locks = new MutationObserver(visibility);
  locks.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  locks.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('pagehide', event => {
    [...pending.keys()].forEach(cancel);
    if (event.persisted) return;
    stopScroll();
    entries.disconnect(); viewers.disconnect(); locks.disconnect();
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pageshow', visibility);
  });
}
