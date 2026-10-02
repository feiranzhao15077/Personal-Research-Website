import { gsap } from 'gsap';

// A bounded decorative interaction; these coordinates are not simulation data.
export function initRadarTracking() {
  const control = document.querySelector<HTMLButtonElement>('.radar-control');
  if (!control || control.dataset.ready) return;
  control.dataset.ready = 'true';
  const pause = document.querySelector<HTMLButtonElement>('[data-radar-pause]');
  let manualPause = false;
  const svg = control.querySelector<SVGSVGElement>('svg')!;
  const target = svg.querySelector<SVGGElement>('.radar-target')!;
  const dish = svg.querySelector<SVGGElement>('.radar-dish')!;
  const beam = svg.querySelector<SVGPathElement>('.radar-beam')!;
  const ray = svg.querySelector<SVGPathElement>('.radar-ray')!;
  const waves = Array.from(svg.querySelectorAll<SVGPathElement>('[data-wavefront]'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const origin = { x: 220, y: 72 };
  const home = { x: 316, y: 220 };
  const state = { ...home };
  const destination = { ...state };
  let touchTimer: ReturnType<typeof setTimeout> | undefined;
  let visible = false;
  let windowActive = true;
  let pointerInside = false;
  let keyboardActive = false;
  let touchActive = false;
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const render = () => {
    const dx = state.x - origin.x, dy = state.y - origin.y;
    const length = Math.hypot(dx, dy);
    const nx = -dy / length, ny = dx / length;
    const width = Math.min(30, length * .17);
    target.setAttribute('transform', `translate(${state.x} ${state.y})`);
    dish.setAttribute('transform', `rotate(${-Math.atan2(dx, dy) * 180 / Math.PI} ${origin.x} ${origin.y})`);
    beam.setAttribute('d', `M ${origin.x} ${origin.y} L ${state.x + nx * width} ${state.y + ny * width} L ${state.x - nx * width} ${state.y - ny * width} Z`);
    ray.setAttribute('d', `M ${origin.x} ${origin.y} L ${state.x} ${state.y}`);
    waves.forEach((wave) => {
      const fraction = Number(wave.dataset.wavefront);
      const cx = origin.x + dx * fraction, cy = origin.y + dy * fraction;
      const spread = width * fraction;
      wave.setAttribute('d', `M ${cx + nx * spread} ${cy + ny * spread} Q ${cx + dx / length * 5} ${cy + dy / length * 5} ${cx - nx * spread} ${cy - ny * spread}`);
    });
  };
  const moveX = gsap.quickTo(state, 'x', { duration: .35, ease: 'power2.out', onUpdate: render });
  const moveY = gsap.quickTo(state, 'y', { duration: .35, ease: 'power2.out', onUpdate: render });
  const flight = { phase: 0, x: home.x, y: home.y, radiusX: 38, radiusY: 12 };
  const idle = gsap.to(flight, {
    phase: Math.PI * 2, duration: 16, repeat: -1, ease: 'none', paused: true,
    onUpdate: () => {
      state.x = flight.x + Math.sin(flight.phase) * flight.radiusX;
      state.y = flight.y + Math.sin(flight.phase * 2) * flight.radiusY;
      Object.assign(destination, state);
      render();
    },
  });
  const sync = () => {
    const animated = visible && windowActive && !document.hidden && !reduced.matches && !manualPause;
    if (pause) {
      pause.disabled = reduced.matches;
      pause.setAttribute('aria-pressed', String(manualPause || reduced.matches));
      pause.textContent = reduced.matches ? '静态示意' : manualPause ? '继续巡航' : '暂停巡航';
    }
    const interacting = pointerInside || keyboardActive || touchActive;
    if (!animated || interacting) {
      idle.pause();
      control.classList.remove('is-flying');
      control.classList.toggle('is-tracking', animated && interacting);
      if (!animated) { moveX.tween.pause(); moveY.tween.pause(); }
      return;
    }
    control.classList.remove('is-tracking');
    if (!control.classList.contains('is-flying')) {
      moveX.tween.pause(); moveY.tween.pause();
      flight.x = state.x; flight.y = state.y;
      flight.radiusX = Math.max(0, Math.min(38, state.x - 50, 390 - state.x));
      flight.radiusY = Math.max(0, Math.min(12, state.y - 110, 285 - state.y));
      idle.restart();
      control.classList.add('is-flying');
    }
  };
  const move = (x: number, y: number, instant = false) => {
    destination.x = clamp(x, 50, 390);
    destination.y = clamp(y, 110, 285);
    idle.pause();
    control.classList.remove('is-flying');
    if (reduced.matches || manualPause || instant) {
      moveX.tween.pause(); moveY.tween.pause();
      Object.assign(state, destination);
      render();
    } else {
      moveX(destination.x);
      moveY(destination.y);
    }
  };
  const pointerMove = (event: PointerEvent) => {
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    clearTimeout(touchTimer);
    if (event.pointerType === 'touch') touchActive = true;
    else pointerInside = true;
    sync();
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    move(point.x, point.y, event.pointerType === 'touch');
    if (event.pointerType === 'touch') touchTimer = setTimeout(() => { touchActive = false; sync(); }, 1200);
  };
  control.addEventListener('pointermove', (event) => {
    if (fine.matches && event.pointerType !== 'touch') pointerMove(event);
  });
  control.addEventListener('pointerdown', pointerMove);
  control.addEventListener('pointerleave', (event) => { if (event.pointerType !== 'touch') { pointerInside = false; sync(); } });
  control.addEventListener('focus', () => {
    keyboardActive = control.matches(':focus-visible');
    sync();
  });
  control.addEventListener('blur', () => { keyboardActive = false; sync(); });
  control.addEventListener('keydown', (event) => {
    const steps: Record<string, [number, number]> = { ArrowLeft: [-18, 0], ArrowRight: [18, 0], ArrowUp: [0, -18], ArrowDown: [0, 18] };
    if (event.key === 'Escape') { move(home.x, home.y, true); render(); sync(); }
    if (!steps[event.key]) return;
    event.preventDefault();
    keyboardActive = true;
    sync();
    const [dx, dy] = steps[event.key];
    move(destination.x + dx, destination.y + dy);
  });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(control);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('blur', () => { windowActive = false; sync(); });
  window.addEventListener('focus', () => { windowActive = true; sync(); });
  reduced.addEventListener('change', sync);
  pause?.addEventListener('click', () => { manualPause = !manualPause; sync(); });
  window.addEventListener('pagehide', (event) => {
    windowActive = false;
    clearTimeout(touchTimer);
    touchActive = false;
    sync();
    if (!event.persisted) { observer.disconnect(); moveX.tween.kill(); moveY.tween.kill(); idle.kill(); }
  });
  window.addEventListener('pageshow', (event) => { if (event.persisted) { windowActive = true; sync(); } });
  render();
}
