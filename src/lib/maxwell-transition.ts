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
  let navigating = false;
  let animationFrame: number | undefined;

  const reset = () => {
    window.clearTimeout(fallback);
    if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
    timeline?.kill();
    layer?.remove();
    root.classList.remove('maxwell-converging');
    timeline = undefined;
    layer = undefined;
    pendingUrl = undefined;
    animationFrame = undefined;
    navigating = false;
  };

  const navigate = () => {
    if (!pendingUrl || navigating) return;
    navigating = true;
    window.clearTimeout(fallback);
    timeline?.pause();
    // Hold the outgoing state until the new document replaces it. Restoring the
    // originals here exposes a flash during network / document loading.
    try { window.location.assign(pendingUrl); } catch { reset(); }
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
    const duration = .44;

    // Read all geometry before writing; never invent positions for offscreen notes.
    const positions = equations.map((equation) => {
      const rect = equation.getBoundingClientRect();
      const style = getComputedStyle(equation);
      const visible = rect.top >= 0 && rect.bottom <= window.innerHeight
        && rect.left >= 0 && rect.right <= window.innerWidth;
      return {
        equation, width: rect.width, height: rect.height,
        left: rect.left, top: rect.top, visible,
        fontSize: style.fontSize, fontFamily: style.fontFamily, color: style.color,
      };
    });
    if (positions.some((position) => !position.visible || !position.width || !position.height)) return;

    event.preventDefault();
    pendingUrl = link.href;
    // Navigation never depends solely on an animation completing.
    fallback = window.setTimeout(navigate, 900);

    try {
      layer = document.createElement('div');
      layer.className = 'maxwell-flight-layer';
      layer.setAttribute('aria-hidden', 'true');
      const fragments = positions.map((position) => {
        // Transform a composited HTML wrapper; keep MathML typesetting static.
        const fragment = document.createElement('div');
        fragment.className = 'maxwell-flight-equation';
        const clone = position.equation.cloneNode(true) as MathMLElement;
        Object.assign(fragment.style, {
          left: `${position.left}px`, top: `${position.top}px`,
          width: `${position.width}px`, height: `${position.height}px`,
        });
        Object.assign(clone.style, {
          fontSize: position.fontSize, fontFamily: position.fontFamily,
          color: position.color, transition: 'none',
        });
        fragment.append(clone);
        layer!.append(fragment);
        return fragment;
      });
      const point = document.createElement('span');
      point.className = 'maxwell-convergence-point';
      point.style.left = `${targetX}px`;
      point.style.top = `${targetY}px`;
      layer.append(point);
      document.body.append(layer);
      root.classList.add('maxwell-converging');

      gsap.set(fragments, { force3D: true, x: 0, y: 0 });
      timeline = gsap.timeline({ paused: true, onComplete: navigate });
      timeline.addLabel('gather', 0);
      fragments.forEach((fragment, index) => {
        const position = positions[index];
        timeline!.to(fragment, {
          x: targetX - position.left - position.width / 2,
          y: targetY - position.top - position.height / 2,
          scale: .06, duration, ease: 'power2.inOut', force3D: true,
        }, 'gather');
        timeline!.to(fragment, { opacity: 0, duration: .14, ease: 'power1.in' }, duration - .14);
      });
      timeline.fromTo(point, { scale: .4, opacity: 0 }, {
        scale: 1.4, opacity: .8, duration: .09, ease: 'power2.out',
      }, duration - .08);
      timeline.to(point, { scale: 2.2, opacity: 0, duration: .1 }, '>');
      // Give the browser a frame to prepare the four layers before motion starts.
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = undefined;
        if (!navigating) timeline?.play();
      });
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
    window.clearTimeout(fallback);
    if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
    timeline?.kill();
    if (!event.persisted) {
      root.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onMotionChange);
      window.removeEventListener('pageshow', reset);
    }
  });
}
