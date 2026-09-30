import gsap from 'gsap';

/** Translate a periodic plane wave along +x; E and B share the same phase. */
export function setupWaveInteraction(control: HTMLButtonElement) {
  const patterns = control.querySelectorAll<SVGGElement>('.wave-pattern');
  if (patterns.length !== 2) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = gsap.to(patterns, {
    x: 140, y: -11.2, duration: 3.2, ease: 'none', repeat: -1, paused: true,
  });
  let hovered = false;
  let toggled = false;
  let pausedByClick = false;
  let visible = false;
  let suspended = false;
  let windowActive = true;

  const update = () => {
    const playing = (hovered || toggled) && !pausedByClick && visible
      && !document.hidden && !suspended && windowActive && !reduced.matches;
    if (playing) motion.resume(); else motion.pause();
    control.setAttribute('aria-pressed', String(playing));
    control.setAttribute('aria-disabled', String(reduced.matches));
    control.setAttribute('aria-label', reduced.matches
      ? '电磁波传播示意，已启用减少动态效果'
      : playing ? '暂停电磁波传播动画' : '播放电磁波传播动画');
  };
  const enter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') { hovered = true; pausedByClick = false; update(); }
  };
  const leave = () => {
    if (hovered) { hovered = false; toggled = false; pausedByClick = false; update(); }
  };
  const click = () => {
    if (reduced.matches) return;
    if (hovered) pausedByClick = !pausedByClick;
    else toggled = !toggled;
    update();
  };
  const focusOut = () => { toggled = false; pausedByClick = false; update(); };
  const preference = () => {
    if (reduced.matches) { toggled = false; motion.pause().time(0); }
    update();
  };
  const blur = () => { windowActive = false; hovered = false; update(); };
  const focus = () => { windowActive = true; update(); };
  const pageShow = () => { suspended = false; update(); };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }, { threshold: .1 });
  observer.observe(control);
  control.addEventListener('pointerenter', enter, { passive: true });
  control.addEventListener('pointerleave', leave);
  control.addEventListener('click', click);
  control.addEventListener('blur', focusOut);
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', preference);
  window.addEventListener('blur', blur);
  window.addEventListener('focus', focus);
  window.addEventListener('pageshow', pageShow);
  const pageHide = (event: PageTransitionEvent) => {
    suspended = true;
    update();
    if (!event.persisted) {
      motion.kill();
      observer.disconnect();
      control.removeEventListener('pointerenter', enter);
      control.removeEventListener('pointerleave', leave);
      control.removeEventListener('click', click);
      control.removeEventListener('blur', focusOut);
      document.removeEventListener('visibilitychange', update);
      reduced.removeEventListener('change', preference);
      window.removeEventListener('blur', blur);
      window.removeEventListener('focus', focus);
      window.removeEventListener('pageshow', pageShow);
      window.removeEventListener('pagehide', pageHide);
    }
  };
  window.addEventListener('pagehide', pageHide);
  update();
}
