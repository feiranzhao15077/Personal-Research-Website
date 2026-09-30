import gsap from 'gsap';

/** Decorative rotor motion; unrelated to the project's flight-control results. */
export function setupRotorInteraction(root: HTMLElement) {
  const card = root.querySelector<HTMLElement>('.branch-node .b-card');
  const drawing = root.querySelector<HTMLElement>('.aircraft-drawing');
  const blades = Array.from(root.querySelectorAll<HTMLImageElement>('.aircraft-propeller'));
  if (!card || !drawing || blades.length !== 4) return;

  const media = gsap.matchMedia();
  media.add('(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const angles = blades.map(blade => Number(blade.dataset.rotorAngle || 0));
    const directions = [1, -1, -1, 1];
    const speed = { value: 0 };
    const setters = blades.map((blade, i) => {
      gsap.set(blade, { rotation: angles[i] });
      return gsap.quickSetter(blade, 'rotation', 'deg');
    });
    let hovered = false;
    let focused = card.contains(document.activeElement);
    let visible = false;
    let ticking = false;

    const tick = (_time: number, deltaMs: number) => {
      const seconds = Math.min(deltaMs, 50) / 1000;
      setters.forEach((setAngle, i) => {
        angles[i] = (angles[i] + directions[i] * speed.value * seconds) % 360;
        setAngle(angles[i]);
      });
    };
    const stop = () => {
      gsap.ticker.remove(tick);
      ticking = false;
      drawing.classList.remove('rotors-running');
    };
    const pause = () => {
      gsap.killTweensOf(speed);
      speed.value = 0;
      stop();
    };
    const update = () => {
      if (!visible || document.hidden) { pause(); return; }
      const active = hovered || focused;
      gsap.killTweensOf(speed);
      if (active) {
        if (!ticking) { gsap.ticker.add(tick); ticking = true; }
        drawing.classList.add('rotors-running');
        gsap.to(speed, { value: 1000, duration: .65, ease: 'power2.out' });
      } else if (ticking) {
        gsap.to(speed, { value: 0, duration: .85, ease: 'power2.out', onComplete: stop });
      }
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') { hovered = true; update(); }
    };
    const leave = () => { hovered = false; update(); };
    const focusIn = () => { focused = true; update(); };
    const focusOut = (event: FocusEvent) => {
      focused = event.relatedTarget instanceof Node && card.contains(event.relatedTarget);
      update();
    };
    const onVisibility = () => {
      if (!document.hidden) {
        hovered = card.matches(':hover');
        focused = card.contains(document.activeElement);
      }
      update();
    };
    const onBlur = () => { hovered = false; pause(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: .1 });
    observer.observe(drawing);
    card.addEventListener('pointerenter', enter, { passive: true });
    card.addEventListener('pointerleave', leave);
    card.addEventListener('focusin', focusIn);
    card.addEventListener('focusout', focusOut);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      pause();
      observer.disconnect();
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointerleave', leave);
      card.removeEventListener('focusin', focusIn);
      card.removeEventListener('focusout', focusOut);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  });
  const onPageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) media.revert();
  };
  window.addEventListener('pagehide', onPageHide);
}
