import gsap from 'gsap';

/** A decorative, bounded transition. Real anchors remain the navigation fallback. */
export function setupMaxwellTransition(root: HTMLElement) {
  const equations = Array.from(root.querySelectorAll<MathMLElement>('.maxwell-equation'));
  if (equations.length !== 4) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let layer: HTMLDivElement | undefined;
  let timeline: gsap.core.Timeline | undefined;
  let fallback: number | undefined;
  let pendingUrl: string | undefined;

  const reset = () => {
    window.clearTimeout(fallback);
    timeline?.kill();
    layer?.remove();
    root.classList.remove('maxwell-converging');
    timeline = undefined;
    layer = undefined;
    pendingUrl = undefined;
  };

  const navigate = () => {
    const url = pendingUrl;
    reset();
    if (url) window.location.assign(url);
  };

  const onClick = (event: MouseEvent) => {
    const link = event.target instanceof Element
      ? event.target.closest<HTMLAnchorElement>('.card-link') : null;
    if (!link || !root.contains(link) || event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      || link.hasAttribute('download') || (link.target && link.target !== '_self')
      || reducedMotion.matches || new URL(link.href).origin !== window.location.origin) return;

    // Let modified clicks/new tabs work normally; suppress duplicate ordinary activations.
    if (pendingUrl) { event.preventDefault(); return; }

    const cardRect = link.getBoundingClientRect();
    const keyboard = event.detail === 0;
    const targetX = keyboard ? cardRect.left + cardRect.width / 2 : event.clientX;
    const targetY = keyboard ? cardRect.top + cardRect.height / 2 : event.clientY;
    const compact = window.innerWidth <= 900;
    const duration = compact ? .34 : .44;

    // Read all geometry before writing. Offscreen mobile notes fan in from nearby edges.
    const positions = equations.map((equation, index) => {
      const rect = equation.getBoundingClientRect();
      const style = getComputedStyle(equation);
      const visible = rect.top >= 0 && rect.bottom <= window.innerHeight
        && rect.left >= 0 && rect.right <= window.innerWidth;
      const sideX = index % 2 === 0 ? -1 : 1;
      const sideY = index < 2 ? -1 : 1;
      const centerX = Math.min(window.innerWidth - rect.width / 2 - 12,
        Math.max(rect.width / 2 + 12, targetX + sideX * 115));
      const centerY = Math.min(window.innerHeight - rect.height / 2 - 12,
        Math.max(rect.height / 2 + 12, targetY + sideY * 95));
      return {
        equation, width: rect.width, height: rect.height,
        left: visible ? rect.left : centerX - rect.width / 2,
        top: visible ? rect.top : centerY - rect.height / 2,
        fontSize: style.fontSize, fontFamily: style.fontFamily,
      };
    });

    event.preventDefault();
    pendingUrl = link.href;
    // Navigation never depends solely on an animation completing.
    fallback = window.setTimeout(navigate, 900);

    try {
      layer = document.createElement('div');
      layer.className = 'maxwell-flight-layer';
      layer.setAttribute('aria-hidden', 'true');
      const fragments = positions.map((position) => {
        const clone = position.equation.cloneNode(true) as MathMLElement;
        clone.classList.add('maxwell-flight-equation');
        Object.assign(clone.style, {
          left: `${position.left}px`, top: `${position.top}px`,
          width: `${position.width}px`, height: `${position.height}px`,
          fontSize: position.fontSize, fontFamily: position.fontFamily,
          transition: 'none',
        });
        layer!.append(clone);
        return clone;
      });
      const point = document.createElement('span');
      point.className = 'maxwell-convergence-point';
      point.style.left = `${targetX}px`;
      point.style.top = `${targetY}px`;
      layer.append(point);
      document.body.append(layer);
      root.classList.add('maxwell-converging');

      timeline = gsap.timeline({ onComplete: navigate });
      timeline.addLabel('gather', 0);
      fragments.forEach((fragment, index) => {
        const position = positions[index];
        timeline!.to(fragment, {
          x: targetX - position.left - position.width / 2,
          y: targetY - position.top - position.height / 2,
          scale: .035, opacity: 0, rotation: index % 2 === 0 ? -8 : 8,
          duration, ease: 'power2.in',
        }, 'gather');
      });
      timeline.fromTo(point, { scale: .4, opacity: 0 }, {
        scale: 1.4, opacity: .8, duration: .09, ease: 'power2.out',
      }, duration - .08);
      timeline.to(point, { scale: 2.2, opacity: 0, duration: .1 }, '>');
    } catch {
      navigate();
    }
  };

  // Backgrounding must not strand the user waiting on a paused animation.
  const onVisibility = () => { if (document.hidden && pendingUrl) navigate(); };
  const onMotionChange = () => { if (reducedMotion.matches && pendingUrl) navigate(); };
  root.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener('change', onMotionChange);
  window.addEventListener('pageshow', reset);
  window.addEventListener('pagehide', (event) => {
    reset();
    if (!event.persisted) {
      root.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onMotionChange);
      window.removeEventListener('pageshow', reset);
    }
  });
}
