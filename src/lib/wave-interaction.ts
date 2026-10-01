import gsap from 'gsap';

/** A shared travelling phase: fixed field vectors oscillate while crests travel +x. */
export function setupWaveInteraction(control: HTMLButtonElement) {
  const patterns = control.querySelectorAll<SVGGElement>('.wave-pattern');
  const electric = control.querySelector<SVGPathElement>('[data-wave-field="e"]');
  const magnetic = control.querySelector<SVGPathElement>('[data-wave-field="b"]');
  const amplitude = Number(control.dataset.waveAmplitude);
  const period = Number(control.dataset.wavePeriod);
  const count = Number(control.dataset.waveVectorCount);
  if (patterns.length !== 2 || !electric || !magnetic || !amplitude || !period || count < 2) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const moveX = gsap.quickSetter(patterns, 'x', 'px');
  const moveY = gsap.quickSetter(patterns, 'y', 'px');
  const origins = Array.from({ length: count }, (_, i) => {
    const x = 280 * i / (count - 1);
    return { x, px: 70 + x, py: 128 - .08 * x };
  });
  const speed = { value: 0 };
  let phase = 0;
  let ticking = false;
  let requested = false;
  let ramp: gsap.core.Tween | undefined;

  const render = () => {
    moveX(phase);
    moveY(-.08 * phase);
    const e: string[] = [];
    const b: string[] = [];
    for (const { x, px, py } of origins) {
      const field = amplitude * Math.sin(2 * Math.PI * (x - phase) / period);
      // Avoid a nonzero arrowhead at a zero-field node.
      if (Math.abs(field) <= 1) continue;
      const origin = `M ${px.toFixed(2)} ${py.toFixed(2)} L `;
      e.push(`${origin}${px.toFixed(2)} ${(py - field).toFixed(2)}`);
      b.push(`${origin}${(px - .65 * field).toFixed(2)} ${(py + .35 * field).toFixed(2)}`);
    }
    // Two small SVG paths; no per-frame geometry reads or per-arrow tweens.
    electric.setAttribute('d', e.join(' '));
    magnetic.setAttribute('d', b.join(' '));
  };
  const tick = (_time: number, delta: number) => {
    phase = (phase + period / 4.6 * speed.value * Math.min(delta, 64) / 1000) % period;
    render();
  };
  const stop = () => {
    ramp?.kill();
    speed.value = 0;
    gsap.ticker.remove(tick);
    ticking = false;
  };
  let hovered = false;
  let toggled = false;
  let pausedByClick = false;
  let visible = false;
  let suspended = false;
  let windowActive = true;

  const update = () => {
    const playing = (hovered || toggled) && !pausedByClick && visible
      && !document.hidden && !suspended && windowActive && !reduced.matches;
    const unavailable = !visible || document.hidden || suspended || !windowActive || reduced.matches;
    if (unavailable) {
      requested = false;
      stop();
    } else if (playing !== requested) {
      requested = playing;
      ramp?.kill();
      if (playing && !ticking) { gsap.ticker.add(tick); ticking = true; }
      ramp = gsap.to(speed, {
        value: playing ? 1 : 0,
        duration: playing ? .8 : .65,
        ease: 'sine.inOut',
        onComplete: () => { if (!requested) stop(); },
      });
    }
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
  // Returning to a window / restored page does not necessarily fire pointerenter.
  const syncHover = () => {
    hovered = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      && control.matches(':hover');
  };
  const move = (event: PointerEvent) => {
    if (!hovered && event.pointerType === 'mouse') enter(event);
  };
  const click = () => {
    if (reduced.matches) return;
    if (hovered) pausedByClick = !pausedByClick;
    else toggled = !toggled;
    update();
  };
  const focusOut = () => { toggled = false; pausedByClick = false; update(); };
  const preference = () => {
    if (reduced.matches) { toggled = false; stop(); phase = 0; render(); }
    update();
  };
  const blur = () => { windowActive = false; hovered = false; update(); };
  const focus = () => { windowActive = true; syncHover(); update(); };
  const pageShow = () => { suspended = false; syncHover(); update(); };
  const visibility = () => {
    if (!document.hidden) syncHover();
    update();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }, { threshold: .1 });
  observer.observe(control);
  control.addEventListener('pointerenter', enter, { passive: true });
  control.addEventListener('pointermove', move, { passive: true });
  control.addEventListener('pointerleave', leave);
  control.addEventListener('click', click);
  control.addEventListener('blur', focusOut);
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', preference);
  window.addEventListener('blur', blur);
  window.addEventListener('focus', focus);
  window.addEventListener('pageshow', pageShow);
  const pageHide = (event: PageTransitionEvent) => {
    suspended = true;
    update();
    if (!event.persisted) {
      stop();
      observer.disconnect();
      control.removeEventListener('pointerenter', enter);
      control.removeEventListener('pointermove', move);
      control.removeEventListener('pointerleave', leave);
      control.removeEventListener('click', click);
      control.removeEventListener('blur', focusOut);
      document.removeEventListener('visibilitychange', visibility);
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
