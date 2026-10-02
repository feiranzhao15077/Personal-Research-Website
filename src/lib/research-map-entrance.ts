/** One quiet entrance, with visible static content as the default. */
export function setupMapEntrance(map: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const played = new Set<Element>();
  const active = new Set<Animation>();
  let observer: IntersectionObserver | undefined;
  const animate = (element: Element, frames: Keyframe[], duration: number) => {
    const animation = element.animate(frames, { duration, easing: 'cubic-bezier(.16,1,.3,1)' });
    active.add(animation);
    animation.finished.then(() => active.delete(animation)).catch(() => active.delete(animation));
  };
  const sync = () => {
    observer?.disconnect();
    active.forEach(animation => animation.cancel()); active.clear();
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer?.unobserve(entry.target); played.add(entry.target);
        if (entry.target.matches('.blueprint-lines')) {
          entry.target.querySelectorAll('line, path').forEach(line =>
            animate(line, [{ strokeDashoffset: '24' }, { strokeDashoffset: '0' }], 900));
        } else {
          animate(entry.target, [{ opacity: .55, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], 480);
        }
      }
    }, { threshold: .12 });
    map.querySelectorAll('.gs-fade-up, .blueprint-lines').forEach(element => {
      if (!played.has(element)) observer!.observe(element);
    });
  };
  reduced.addEventListener('change', sync);
  window.addEventListener('pagehide', () => {
    observer?.disconnect(); active.forEach(animation => animation.cancel()); active.clear();
  });
  window.addEventListener('pageshow', sync);
  sync();
}
