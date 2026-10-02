/** A marker-drawn, first-entry-per-session story. The gallery remains usable without it. */
type AnimationEngine = typeof import('gsap')['gsap'];
type StoryTimeline = ReturnType<AnimationEngine['timeline']>;
type StoryContext = ReturnType<AnimationEngine['context']>;

declare global { interface Window { spaceOpeningWatchdog?: number; } }

const MEMORY_KEY = 'zfr-personal-opening-session-v1';
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

export function setupPersonalSpaceOpening() {
  const opening = document.querySelector<HTMLDialogElement>('.space-opening');
  const replay = document.querySelector<HTMLButtonElement>('[data-opening-replay]');
  const pause = opening?.querySelector<HTMLButtonElement>('[data-opening-pause]');
  const skip = opening?.querySelector<HTMLButtonElement>('[data-opening-skip]');
  const caption = opening?.querySelector<HTMLElement>('.opening-caption');
  const root = document.documentElement;
  if (!opening || !replay || !pause || !skip || !caption) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let seen = false;
  try { seen = sessionStorage.getItem(MEMORY_KEY) === 'seen'; } catch {}
  // The visual loading fallback must not erase eligibility when the module arrives late.
  const autoplay = !seen && !reduced.matches;
  window.clearTimeout(window.spaceOpeningWatchdog);
  root.classList.add('space-opening-ready');
  let engine: AnimationEngine | undefined;
  let timeline: StoryTimeline | undefined, context: StoryContext | undefined;
  let active = false, manuallyPaused = false, runId = 0, assetTimer = 0, resizeTimer = 0;
  let restoreFocus: HTMLElement | undefined;

  const announceState = () => document.dispatchEvent(new Event('space:opening-change'));
  const finish = (remember: boolean, restore = true) => {
    if (!active && !root.classList.contains('space-opening-pending')) return;
    active = false; runId++;
    window.clearTimeout(assetTimer); window.clearTimeout(resizeTimer);
    timeline?.kill(); context?.revert(); timeline = undefined; context = undefined;
    opening.classList.remove('is-night');
    root.classList.remove('space-opening-pending', 'space-opening-active');
    if (opening.open) opening.close();
    if (remember) { try { sessionStorage.setItem(MEMORY_KEY, 'seen'); } catch {} }
    if (restore) {
      const target = restoreFocus || document.querySelector<HTMLElement>('#space-main');
      if (target && target !== document.body) {
        if (!restoreFocus) target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    }
    announceState();
  };

  const buildStory = (gsap: AnimationEngine) => {
    const width = opening.clientWidth, height = opening.clientHeight;
    const compact = width < 650;
    gsap.set(opening.querySelector('.opening-art'), { opacity: 1 });
    const boy = opening.querySelector<HTMLElement>('.opening-boy')!;
    const boyPicture = boy.querySelector<HTMLImageElement>(':scope > img')!;
    const rocket = opening.querySelector<HTMLElement>('.opening-rocket')!;
    const ground = opening.querySelector<HTMLElement>('.opening-ground')!;
    const night = opening.querySelector<HTMLElement>('.opening-night')!;
    const light = opening.querySelector<HTMLElement>('.opening-dream-light')!;
    const handFlame = opening.querySelector<HTMLElement>('.opening-hand-flame')!;
    const fireWash = opening.querySelector<HTMLElement>('.opening-fire-wash')!;
    const heart = opening.querySelector<HTMLElement>('.opening-heart-light')!;
    const flame = opening.querySelector<HTMLElement>('.opening-flame')!;
    const meteor = opening.querySelector<HTMLElement>('.opening-meteor')!;
    const wipe = opening.querySelector<HTMLElement>('.opening-wipe')!;
    const planets = Array.from(opening.querySelectorAll<HTMLElement>('.opening-planet'));
    const paths = Array.from(opening.querySelectorAll<SVGPathElement>('.opening-light-paths path'));
    const boyWidth = compact ? clamp(width * .43, 138, 190) : clamp(width * .17, 180, 250);
    const rocketWidth = compact ? clamp(width * .44, 132, 190) : clamp(width * .18, 200, 265);
    const baseline = height * .83;
    const boyX = width * .39 - boyWidth / 2, boyY = baseline - boyWidth * 1.5;
    const fireX = width * .5, fireY = height * .68;
    const fireScale = clamp(height * .46 / (boyWidth * .28), 4.4, 7.7);
    // Aim at the hand-held light, accounting for the boy sprite's transform pivot.
    const fireBoyX = width * .5 - boyWidth * .5 - boyWidth * .17 * fireScale;
    const fireBoyY = height * .68 - boyWidth * 1.5 * .53 + boyWidth * 1.5 * .05 * fireScale;
    const distantScale = compact ? .22 : .14;
    const distantBoyX = width * .5 - boyWidth / 2;
    // Keep the scaled shoes just beyond the far horizon, using the sprite's 53% pivot.
    const distantBoyY = height * .585 - boyWidth * 1.5 * (.53 + .47 * distantScale);
    const centerX = width / 2, centerY = height * .5;
    const skyRocketX = centerX - rocketWidth / 2, skyRocketY = centerY - rocketWidth * .75;
    const destination = { x: centerX + rocketWidth * .02, y: centerY + rocketWidth * .105 };
    const orbit = { progress: 0 };
    const nodes = planets.map((element, index) => {
      const tier = element.dataset.tier!;
      const label = element.querySelector<HTMLElement>('.opening-planet-name')!;
      const size = tier === 'near' ? (compact ? clamp(width * .155, 46, 62) : clamp(width * .083, 90, 126))
        : tier === 'middle' ? (compact ? 24 + index % 3 * 4 : 44 + index % 3 * 7)
          : (compact ? 10 + index % 4 * 3 : 18 + index % 4 * 5);
      gsap.set(element, { width: size, opacity: 0, scale: .65 });
      gsap.set(label, { xPercent: -50 });
      return { element, label, index, tier, size,
        labelWidth: (label.textContent?.length || 4) * (tier === 'near' ? (compact ? 15 : 20) : 14) + 8,
        x: gsap.quickSetter(element, 'x', 'px'), y: gsap.quickSetter(element, 'y', 'px'),
        labelX: gsap.quickSetter(label, 'x', 'px') };
    });
    const positionAt = (node: typeof nodes[number], progress: number) => {
      let angle: number, radiusX: number, radiusY: number;
      if (node.tier === 'near') {
        angle = (-150 + node.index * 60) * Math.PI / 180 + progress * .32;
        radiusX = width * .32; radiusY = height * .245;
      } else if (node.tier === 'middle') {
        angle = (-165 + (node.index - 6) * 30) * Math.PI / 180 - progress * .15;
        radiusX = width * .425; radiusY = height * .355;
      } else {
        angle = (node.index - 18) / 22 * Math.PI * 2 - Math.PI / 2 + progress * .06;
        radiusX = width * (.465 + Math.sin(node.index * 1.7) * .018);
        radiusY = height * (.405 + Math.cos(node.index * 1.2) * .02);
      }
      const x = clamp(centerX + Math.cos(angle) * radiusX, node.size / 2 + 12, width - node.size / 2 - 12);
      const y = clamp(centerY + Math.sin(angle) * radiusY, 88 + node.size / 2, height - 88 - node.size / 2);
      return { x, y };
    };
    const renderOrbit = () => nodes.forEach((node) => {
      const point = positionAt(node, orbit.progress);
      node.x(point.x - node.size / 2); node.y(point.y - node.size / 2);
      const labelCenter = clamp(point.x, 16 + node.labelWidth / 2, width - 16 - node.labelWidth / 2);
      node.labelX(labelCenter - point.x);
    });

    gsap.set(boy, { width: boyWidth, x: distantBoyX, y: distantBoyY, opacity: 1, scale: distantScale, rotation: 0 });
    gsap.set(boyPicture, { opacity: 1 });
    gsap.set(rocket, { width: rocketWidth, x: fireX - rocketWidth * .5,
      y: fireY - rocketWidth * 1.5 * .53, opacity: 0, scale: .08 });
    gsap.set([night, light, handFlame, fireWash, heart, flame, meteor, paths], { opacity: 0 });
    gsap.set(ground, { opacity: 1, y: 0, scaleX: 1, scaleY: 1.6, transformOrigin: '50% 100%' });
    gsap.set(wipe, { xPercent: -105, opacity: 1 });
    renderOrbit();
    paths.forEach((path, index) => {
      const from = positionAt(nodes[index], 1);
      const bendX = (from.x + destination.x) / 2 + (index % 2 ? -50 : 50);
      const bendY = Math.min(from.y, destination.y) - Math.min(80, height * .09);
      path.setAttribute('d', `M${from.x},${from.y} Q${bendX},${bendY} ${destination.x},${destination.y}`);
      path.setAttribute('pathLength', '1');
      gsap.set(path, { strokeDasharray: '1', strokeDashoffset: 1 });
    });

    if (reduced.matches) {
      gsap.set([boy, ground], { opacity: 0 });
      gsap.set(night, { opacity: 1 });
      gsap.set(rocket, { x: skyRocketX, y: skyRocketY, opacity: 1, scale: 1 });
      gsap.set(planets, { opacity: 1, scale: 1 });
      opening.classList.add('is-night'); caption.textContent = '把每一份好奇，画进自己的宇宙。';
      pause.disabled = true; skip.textContent = '进入个人空间';
      return;
    }

    const approachDuration = 4;
    const film = gsap.timeline({ paused: true, onComplete: () => finish(true) });
    const story = gsap.timeline();
    timeline = film;
    film.addLabel('vista', 0).addLabel('approach', 1.1).addLabel('dream', approachDuration);
    // The far horizon opens the drawing; a slow approach reveals the small dream in his hands.
    film.to(boy, { x: boyX, y: boyY, scale: 1, rotation: -3,
      duration: 2.9, ease: 'power2.inOut' }, 'approach');
    film.to(ground, { scaleX: compact ? 1.45 : 1.75, scaleY: 1.12,
      duration: 2.9, ease: 'power2.inOut' }, 'approach');
    const launchAt = 4, universeAt = launchAt + 2.3;
    const gatherAt = launchAt + 8.9, meteorAt = launchAt + 12.9;
    story.addLabel('dream', 0).addLabel('rocket-growth', 1.9).addLabel('launch', launchAt)
      .addLabel('universe', universeAt).addLabel('gather', gatherAt).addLabel('meteor', meteorAt);
    story.addLabel('fire-closeup', .35);
    story.to(handFlame, { opacity: 1, scaleX: .9, scaleY: 1, duration: .35, ease: 'power2.out' }, 0);
    story.to(light, { opacity: .55, scale: 1.1, duration: .3 }, 0);
    story.to(boy, { x: fireBoyX, y: fireBoyY, scale: fireScale, rotation: 0,
      duration: .9, ease: 'power2.inOut' }, 'fire-closeup');
    story.to(ground, { scaleX: compact ? 1.95 : 2.35, opacity: .3, duration: .9,
      ease: 'power2.inOut' }, 'fire-closeup');
    story.to(fireWash, { opacity: .93, duration: .75, ease: 'sine.inOut' }, 'fire-closeup');
    story.to(handFlame, { scaleX: 1.02, scaleY: 1.06, duration: .23,
      repeat: 5, yoyo: true, ease: 'sine.inOut' }, .35);
    // Stay inside the fire close-up: the light becomes the rocket without returning to the boy.
    story.to(handFlame, { scaleX: 1.55, scaleY: 1.5, duration: .65,
      ease: 'power2.inOut' }, 'rocket-growth');
    story.to(fireWash, { opacity: 1, duration: .55, ease: 'sine.inOut' }, 'rocket-growth');
    story.to(ground, { opacity: 0, duration: .45 }, 'rocket-growth');
    story.to(boyPicture, { opacity: 0, duration: .5, ease: 'sine.inOut' }, 'rocket-growth+=.15');
    story.to(light, { opacity: 0, duration: .4 }, 'rocket-growth+=.25');
    story.to(rocket, { scale: compact ? 1.15 : 1.08, opacity: 1,
      duration: 1.45, ease: 'power2.inOut' }, 'rocket-growth+=.15');
    story.to(handFlame, { opacity: 0, duration: .65, ease: 'sine.inOut' }, 'rocket-growth+=.7');
    story.set(boy, { opacity: 0 }, 'rocket-growth+=1.4');
    story.to(flame, { opacity: 1, scaleY: 1.15, duration: .35, ease: 'power2.out' }, 'launch-=.65');
    story.to(flame, { scaleY: .8, duration: .2, ease: 'sine.inOut', yoyo: true, repeat: 11 }, 'launch');
    story.to(rocket, { x: skyRocketX, y: skyRocketY, scale: 1, rotation: 0,
      duration: 2, ease: 'power2.inOut' }, 'launch');
    story.to(fireWash, { opacity: 0, duration: 1.1, ease: 'sine.inOut' }, 'launch+=.35');
    story.to(night, { opacity: 1, duration: 1.35, ease: 'sine.inOut' }, 'launch+=.35');
    story.to(flame, { opacity: .45, scaleY: .65, duration: .8 }, 'launch+=2');
    story.to(rocket, { y: skyRocketY - 6, rotation: 2, duration: 1.8, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 'universe');
    story.to(planets, { opacity: 1, scale: 1, duration: .75, stagger: { amount: 1.2, from: 'end' }, ease: 'power3.out' }, 'universe-=.2');
    story.to(orbit, { progress: 1, duration: 6.4, ease: 'none', onUpdate: renderOrbit }, 'universe');
    // Foreground names persist; deeper names surface in small, readable groups.
    nodes.filter(node => node.tier !== 'near').forEach((node, index) => {
      const group = Math.floor(index / 4);
      const at = universeAt + .4 + group * .73;
      story.to(node.label, { opacity: 1, duration: .16 }, at);
      story.to(node.label, { opacity: 0, duration: .25 }, at + .8);
    });
    const ordered = [...nodes.filter(node => node.tier === 'far'), ...nodes.filter(node => node.tier === 'middle'), ...nodes.filter(node => node.tier === 'near')];
    ordered.forEach((node, order) => {
      const from = positionAt(node, 1);
      const at = node.tier === 'near' ? gatherAt + 2.1 + (order - 34) * .17 : gatherAt + order * .055;
      const duration = node.tier === 'near' ? 1.05 : 1.15;
      const pull = { progress: 0 };
      const bend = { x: (from.x + destination.x) / 2 + (node.index % 2 ? -40 : 40), y: Math.min(from.y, destination.y) - 50 };
      story.to(pull, { progress: 1, duration, ease: 'power2.in', onUpdate: () => {
        const p = pull.progress, q = 1 - p;
        node.x(q * q * from.x + 2 * q * p * bend.x + p * p * destination.x - node.size / 2);
        node.y(q * q * from.y + 2 * q * p * bend.y + p * p * destination.y - node.size / 2);
      } }, at);
      story.to(node.label, { opacity: 0, duration: .2 }, at);
      story.to(node.element, { scale: .055, opacity: 0, duration, ease: 'power2.in' }, at);
      if (node.tier === 'near') {
        const path = paths[node.index];
        story.to(path, { opacity: .9, strokeDashoffset: 0, duration: .55, ease: 'power2.inOut' }, at + .2);
        story.to(path, { opacity: 0, duration: .3 }, at + .85);
      }
    });
    story.to(flame, { opacity: 0, duration: .8 }, 'gather');
    story.to(heart, { opacity: .85, scale: 2.8, duration: 2, ease: 'sine.inOut' }, 'gather+=1.5');
    story.to(heart, { opacity: 0, scale: 4, duration: .65 }, 'meteor-=.5');
    story.set(meteor, { x: -width * .35, y: height * .7, rotation: -22, opacity: 1 }, 'meteor');
    story.to(meteor, { x: width * 1.1, y: height * .12, duration: 1.2, ease: 'power2.in' }, 'meteor');
    story.to(wipe, { xPercent: 0, duration: .55, ease: 'power3.inOut' }, 'meteor+=.65');
    story.to(opening, { opacity: 0, duration: .4, ease: 'sine.out' }, 'meteor+=1.25');
    film.add(story, approachDuration);
    let lastCaption = -1;
    const sentences = [
      [0, '点亮一点想象。'], [1.9, '把梦想，画成一艘火箭。'], [launchAt, '出发，去更大的世界。'],
      [universeAt, '宇宙里，住着许许多多的好奇。'], [gatherAt, '让每一份好奇，成为自己的光。'],
      [meteorAt, '与其困于方寸，不如自成宇宙。'],
    ] as const;
    const syncScene = () => {
      const time = film.time() - approachDuration;
      opening.classList.toggle('is-night', time >= launchAt + .95 && time < meteorAt + 1);
      if (time < 0) { caption.textContent = ''; return; }
      let next = 0;
      sentences.forEach(([start], index) => { if (time >= start) next = index; });
      if (next !== lastCaption && next >= 0) { caption.textContent = sentences[next][1]; lastCaption = next; }
    };
    film.eventCallback('onUpdate', syncScene); syncScene();
    pause.disabled = false; skip.textContent = '跳过开场';
  };

  const syncPlayback = () => {
    pause.textContent = manuallyPaused ? '继续' : '暂停';
    pause.setAttribute('aria-pressed', String(manuallyPaused));
    if (manuallyPaused || document.hidden) timeline?.pause(); else timeline?.play();
  };
  const start = async () => {
    if (active) return;
    active = true; manuallyPaused = false;
    const currentRun = ++runId;
    restoreFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : undefined;
    caption.textContent = '正在打开这幅画……'; pause.disabled = true;
    pause.textContent = '暂停'; pause.setAttribute('aria-pressed', 'false'); skip.textContent = '跳过开场';
    opening.style.opacity = '1'; opening.classList.remove('is-night');
    if (!opening.open) opening.showModal();
    root.classList.add('space-opening-active'); root.classList.remove('space-opening-pending');
    skip.focus({ preventScroll: true }); announceState();
    try {
      const unique = new Map<string, HTMLImageElement>();
      opening.querySelectorAll<HTMLImageElement>('[data-opening-src]').forEach(image => {
        const url = image.dataset.openingSrc!;
        image.src = url; if (!unique.has(url)) unique.set(url, image);
      });
      const assets = Promise.all(Array.from(unique.values()).map(image => image.decode()));
      const ready = Promise.all([assets, engine ? Promise.resolve(engine) : import('gsap').then(module => module.gsap)]);
      const loaded = await Promise.race([ready, new Promise<never>((_, reject) => {
        assetTimer = window.setTimeout(() => reject(new Error('Opening assets unavailable')), 4500);
      })]);
      window.clearTimeout(assetTimer);
      if (!active || currentRun !== runId) return;
      engine = loaded[1];
      context = engine.context(() => buildStory(engine!), opening);
      syncPlayback();
    } catch {
      if (active && currentRun === runId) finish(false);
    }
  };
  const resized = () => {
    window.clearTimeout(resizeTimer);
    if (!active || !engine || !context) return;
    resizeTimer = window.setTimeout(() => {
      if (!active || !engine) return;
      const time = timeline?.time() || 0;
      timeline?.kill(); context?.revert();
      opening.style.opacity = '1';
      context = engine.context(() => buildStory(engine!), opening);
      timeline?.seek(time); syncPlayback();
    }, 140);
  };
  const motionChange = () => { if (active) finish(false); };
  const dialogClosed = () => { if (active && !opening.open) finish(true); };
  const pageHide = () => finish(false, false);
  const replayClicked = () => { void start(); };
  const skipClicked = () => finish(true);
  const pauseClicked = () => { manuallyPaused = !manuallyPaused; syncPlayback(); };
  replay.addEventListener('click', replayClicked);
  skip.addEventListener('click', skipClicked);
  pause.addEventListener('click', pauseClicked);
  opening.addEventListener('close', dialogClosed);
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('resize', resized);
  window.addEventListener('pagehide', pageHide);
  reduced.addEventListener('change', motionChange);
  if (autoplay) void start();
}
