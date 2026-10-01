import gsap from 'gsap';

/** Art-directed movement of a single illustration, not a flight simulation. */
export function setupCloudFlight(figure: HTMLElement) {
  const scene = figure.querySelector<HTMLButtonElement>('.flight-scene');
  const jet = figure.querySelector<HTMLElement>('.flight-jet');
  const bank = figure.querySelector<HTMLElement>('.flight-jet-bank');
  const veil = figure.querySelector<HTMLElement>('.flight-cloud-veil');
  const pause = figure.querySelector<HTMLButtonElement>('.flight-pause');
  const clouds = Array.from(figure.querySelectorAll<HTMLElement>('[data-cloud]'));
  if (!scene || !jet || !bank || !veil || !pause || clouds.length !== 3) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let suspended = false;
  let windowActive = true;
  let manuallyPaused = false;
  let maneuver: gsap.core.Timeline | undefined;
  let last = -1;
  let readyAt = 0;
  const names = ['banked-turn', 'cloud-dive', 'fast-pass', 'climbing-pass', 's-curve',
    'level-recovery', 'double-sweep', 'distant-arc', 'descending-bank', 'low-fast-pass'];

  const cruise = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut' } })
    .to(jet, { xPercent: -3, yPercent: -5, rotation: 1.4, duration: 3.8 })
    .to(jet, { xPercent: 2, yPercent: 4, rotation: -1.2, duration: 4.4 })
    .to(jet, { xPercent: 0, yPercent: 0, rotation: 0, duration: 3.8 });
  const cloudMotion = clouds.map((cloud, i) => gsap.fromTo(cloud,
    { xPercent: -50 },
    { xPercent: 0, duration: [36, 26, 18][i], ease: 'none', repeat: -1, paused: true },
  ));
  gsap.set(bank, { transformPerspective: 700 });

  const canPlay = () => visible && !document.hidden && windowActive && !suspended
    && !manuallyPaused && !reduced.matches;
  const update = () => {
    const playing = canPlay();
    cloudMotion.forEach((motion) => playing ? motion.resume() : motion.pause());
    if (maneuver) { cruise.pause(); playing ? maneuver.resume() : maneuver.pause(); }
    else { playing ? cruise.resume() : cruise.pause(); }
    scene.setAttribute('aria-disabled', String(reduced.matches || manuallyPaused));
    pause.setAttribute('aria-pressed', String(manuallyPaused));
    pause.textContent = manuallyPaused ? '继续' : '暂停';
    pause.setAttribute('aria-label', manuallyPaused ? '继续飞行动画' : '暂停飞行动画');
  };

  const resetPose = () => {
    gsap.set(jet, { x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, opacity: 1 });
    gsap.set(bank, { rotationX: 0, rotationY: 0 });
    gsap.set(veil, { opacity: .32 });
  };
  const trigger = () => {
    if (!canPlay() || maneuver || performance.now() < readyAt) return;
    // Uniform selection without repeating the previous maneuver.
    const slot = Math.floor(Math.random() * (last < 0 ? names.length : names.length - 1));
    const selected = last < 0 || slot < last ? slot : slot + 1;
    last = selected;
    scene.dataset.maneuver = names[selected];
    scene.classList.add('is-maneuvering');
    cruise.pause();
    // Paths use scene dimensions so shrinking the illustration leaves a wide flight envelope.
    const { width: w, height: h } = scene.getBoundingClientRect();
    const jetWidth = jet.offsetWidth;
    gsap.set(jet, {
      x: Number(gsap.getProperty(jet, 'x')) + Number(gsap.getProperty(jet, 'xPercent')) * jetWidth / 100,
      y: Number(gsap.getProperty(jet, 'y')) + Number(gsap.getProperty(jet, 'yPercent')) * jet.offsetHeight / 100,
      xPercent: 0, yPercent: 0,
    });
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => {
      maneuver = undefined;
      scene.classList.remove('is-maneuvering');
      readyAt = performance.now() + 300;
      cruise.restart().pause();
      update();
    } });
    maneuver = tl;

    type Point = { x: number; y: number };
    // The nose follows the curve tangent. A modest axial bank supplies depth without a flat spin.
    const curve = (points: [Point, Point, Point, Point], duration: number, bankAngle: number,
      startScale: number, endScale: number, visibility: 'enter' | 'exit' | 'hold', ease = 'none') => {
      const travel = { p: 0 };
      const [a, b, c, d] = points;
      tl.to(travel, { p: 1, duration, ease, onUpdate: () => {
        const p = travel.p, q = 1 - p;
        const dx = 3 * q * q * (b.x - a.x) + 6 * q * p * (c.x - b.x) + 3 * p * p * (d.x - c.x);
        const dy = 3 * q * q * (b.y - a.y) + 6 * q * p * (c.y - b.y) + 3 * p * p * (d.y - c.y);
        const fade = Math.min(1, Math.max(0, visibility === 'enter' ? p / .2
          : visibility === 'exit' ? (1 - p) / .22 : 1));
        gsap.set(jet, {
          x: q ** 3 * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p ** 3 * d.x,
          y: q ** 3 * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p ** 3 * d.y,
          rotation: Math.atan2(-dy, -dx) * 180 / Math.PI,
          scale: startScale + (endScale - startScale) * p,
          opacity: fade * fade * (3 - 2 * fade),
        });
        gsap.set(bank, { rotationX: bankAngle * Math.sin(Math.PI * p) });
      } });
    };
    type Route = {
      bend: number; exit: number; entry: number; roll: number; duration: number; scale: number;
      returnDuration?: number; returnBend?: number;
      via?: { y: number; roll: number; duration: number; scale: number };
    };
    const routes: Route[] = [
      { bend: -.25, exit: .03, entry: -.12, roll: 22, duration: 2.05, scale: .88 },
      { bend: .03, exit: .4, entry: -.24, roll: -18, duration: 1.65, scale: .75 },
      { bend: -.06, exit: -.03, entry: .04, roll: 8, duration: 1.15, scale: .94 },
      { bend: -.3, exit: -.22, entry: .18, roll: 20, duration: 1.9, scale: .65 },
      { bend: .3, exit: -.16, entry: .2, roll: -24, duration: 2.15, scale: .9 },
      // Shallow dive and a level recovery, with the nose settling before the cloud exit.
      { bend: .16, exit: .05, entry: .12, roll: 12, duration: 1.5, scale: .96,
        via: { y: .18, roll: -14, duration: .95, scale: 1.06 } },
      // Two opposing curved passes; banking reverses as the path changes curvature.
      { bend: -.25, exit: -.02, entry: .17, roll: 25, duration: 1.65, scale: .88,
        returnBend: -.12, via: { y: .16, roll: -22, duration: .95, scale: 1 } },
      // A slower climb into the distance followed by an approaching upper-cloud pass.
      { bend: -.34, exit: -.26, entry: -.2, roll: 17, duration: 1.8, scale: .48,
        returnDuration: 2.35, via: { y: -.19, roll: 15, duration: 1.25, scale: .72 } },
      // Broad descending bank, then a gentle rise back to the cruising height.
      { bend: .35, exit: .22, entry: .25, roll: -30, duration: 2.35, scale: 1.08,
        returnDuration: 2.1, returnBend: .22 },
      // Low, fast foreground pass; the slight increase in scale suggests proximity.
      { bend: .24, exit: .2, entry: -.06, roll: 10, duration: .85, scale: 1.1,
        returnDuration: 1.15, via: { y: .15, roll: -10, duration: .65, scale: 1.12 } },
    ];
    const route = routes[selected];
    const sx = Number(gsap.getProperty(jet, 'x'));
    const sy = Number(gsap.getProperty(jet, 'y'));
    let departure = { x: sx, y: sy };
    let departureScale = 1;
    if (route.via) {
      const via = route.via;
      const waypoint = { x: -w * .24, y: h * via.y };
      curve([
        departure,
        { x: sx - w * .08, y: sy },
        { x: waypoint.x + w * .08, y: waypoint.y },
        waypoint,
      ], via.duration, via.roll, 1, via.scale, 'hold');
      departure = waypoint;
      departureScale = via.scale;
    }
    curve([
      departure,
      { x: departure.x - w * .15, y: departure.y },
      { x: -w * .43, y: h * route.bend },
      { x: -w * .68, y: h * route.exit },
    ], route.duration, route.roll, departureScale, route.scale, 'exit');
    tl.to(veil, { opacity: selected === 1 ? .65 : .32, duration: .65 }, '<.6')
      .set(jet, { x: w * .68, y: h * route.entry, opacity: 0, rotation: 0 });
    curve([
      { x: w * .68, y: h * route.entry },
      { x: w * .4, y: h * (route.returnBend ?? route.entry) },
      { x: w * .2, y: 0 },
      { x: 0, y: 0 },
    ], route.returnDuration ?? (selected === 2 ? 1.25 : 1.75), -route.roll * .7,
      route.scale, 1, 'enter', 'power1.out');
    tl.to(veil, { opacity: .32, duration: .6 }, '<')
      .set(jet, { rotation: 0, x: 0, y: 0 })
      .set(bank, { rotationX: 0, rotationY: 0 });
  };

  const enter = (event: PointerEvent) => { if (event.pointerType === 'mouse') trigger(); };
  const togglePause = () => { manuallyPaused = !manuallyPaused; update(); };
  const motionChange = () => {
    if (reduced.matches) {
      maneuver?.kill(); maneuver = undefined;
      scene.classList.remove('is-maneuvering');
      cruise.pause().time(0); resetPose();
    }
    update();
  };
  const blur = () => { windowActive = false; update(); };
  const focus = () => { windowActive = true; update(); };
  const pageShow = () => { suspended = false; update(); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .05 });
  observer.observe(scene);
  scene.addEventListener('pointerenter', enter, { passive: true });
  scene.addEventListener('click', trigger);
  pause.addEventListener('click', togglePause);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('blur', blur);
  window.addEventListener('focus', focus);
  window.addEventListener('pageshow', pageShow);
  reduced.addEventListener('change', motionChange);
  const pageHide = (event: PageTransitionEvent) => {
    suspended = true; update();
    if (event.persisted) return;
    cruise.kill(); maneuver?.kill(); cloudMotion.forEach((motion) => motion.kill()); observer.disconnect();
    scene.removeEventListener('pointerenter', enter); scene.removeEventListener('click', trigger);
    pause.removeEventListener('click', togglePause); document.removeEventListener('visibilitychange', update);
    window.removeEventListener('blur', blur); window.removeEventListener('focus', focus);
    window.removeEventListener('pageshow', pageShow); window.removeEventListener('pagehide', pageHide);
    reduced.removeEventListener('change', motionChange);
  };
  window.addEventListener('pagehide', pageHide);
  motionChange();
}
