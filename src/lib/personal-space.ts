/** Photos arranged along a draggable, continuous gallery arc. */
export function setupPersonalSpace() {
  const stage = document.querySelector<HTMLElement>('.space-stage');
  const pause = document.querySelector<HTMLButtonElement>('[data-space-pause]');
  const dialog = document.querySelector<HTMLDialogElement>('.space-dialog');
  const close = document.querySelector<HTMLButtonElement>('[data-space-close]');
  const heading = document.querySelector<HTMLElement>('#space-dialog-title');
  const photo = document.querySelector<HTMLImageElement>('[data-space-photo]');
  let photoIndex = 0;
  const items = Array.from(document.querySelectorAll<HTMLElement>('.space-card'));
  if (!stage || !pause || !dialog || !close || !heading || !items.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = items.map((element, index) => ({ element, index, distance: 0, elevation: 0 }));
  let width = 0, height = 0, cardWidth = 0, cardHeight = 0, spacing = 0, period = 0;
  let offset = 0, inertia = 0, clock = 0;
  let manualPause = false, focusPause = false, hoverPause = false, visible = true;
  let drag: { id: number; originX: number; originY: number; lastX: number; lastTime: number;
    startOffset: number; active: boolean } | undefined;
  let settle: { from: number; to: number; started: number } | undefined;
  let blockClickUntil = 0, raf = 0, previousTime = 0;
  let opener: HTMLButtonElement | undefined;
  let keyboardMode = false, lastFocusedIndex = 0;
  let pendingOffset: number | undefined, needsRender = false, coasting = false;

  const opening = document.querySelector<HTMLDialogElement>('.space-opening');
  const isPaused = () => manualPause || focusPause || (hoverPause && !coasting) || dialog.open || opening?.open || document.documentElement.classList.contains('space-opening-pending');
  const render = () => {
    if (reduced.matches) return;
    cards.forEach((card) => {
      const position = card.index * spacing + offset + period / 2;
      card.distance = ((position % period) + period) % period - period / 2;
      const depth = card.distance / spacing;
      const recession = 1 - Math.exp(-depth * depth * .55);
      const scale = 1 - recession * .28;
      const sway = Math.sin(clock * .6 + card.index * 1.7) * 1.5;
      const x = width / 2 + card.distance - cardWidth / 2;
      const y = height * .54 - cardHeight / 2 - recession * 64 + sway;
      const tilt = Math.max(-9, Math.min(9, depth * 4));
      card.element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg) scale(${scale})`;
      const elevation = Math.round(30 - Math.min(Math.abs(depth), 4) * 4);
      if (elevation !== card.elevation) {
        card.element.style.zIndex = String(elevation); card.elevation = elevation;
      }
    });
  };
  const measure = () => {
    if (reduced.matches) return;
    const previousSpacing = spacing;
    width = stage.clientWidth;
    height = stage.clientHeight;
    const compact = width < 650;
    cardWidth = compact ? Math.min(260, width * .66) : Math.min(288, Math.max(238, width * .2));
    cardHeight = Math.round(cardWidth * 1.35);
    spacing = cardWidth + (compact ? 24 : 32);
    period = cards.length * spacing;
    if (previousSpacing) offset *= spacing / previousSpacing;
    settle = undefined; pendingOffset = undefined;
    stage.style.setProperty('--card-width', `${cardWidth}px`);
    stage.style.setProperty('--card-height', `${cardHeight}px`);
    render();
  };
  const tick = (time: number) => {
    raf = 0;
    const dt = Math.min((time - previousTime) / 1000, .05);
    previousTime = time;
    if (pendingOffset !== undefined) {
      offset = pendingOffset; pendingOffset = undefined; needsRender = true;
    }
    if (settle) {
      const progress = Math.min(1, (time - settle.started) / 380);
      offset = settle.from + (settle.to - settle.from) * (1 - Math.pow(1 - progress, 4));
      if (progress === 1) settle = undefined;
      needsRender = true;
    } else if (!isPaused() && !drag) {
      offset += (-18 + inertia) * dt;
      inertia *= Math.exp(-2.3 * dt);
      if (Math.abs(inertia) < 4) { inertia = 0; coasting = false; }
      clock += dt;
      needsRender = true;
    }
    if (needsRender) { render(); needsRender = false; }
    if (visible && !document.hidden && !reduced.matches && (settle || (!isPaused() && !drag))) raf = requestAnimationFrame(tick);
  };
  const wake = () => {
    if (raf || !visible || document.hidden || reduced.matches) return;
    if (!needsRender && pendingOffset === undefined && !settle && (isPaused() || drag)) return;
    previousTime = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const queueRender = () => { needsRender = true; wake(); };
  const syncPause = () => {
    pause.textContent = reduced.matches ? '静态浏览' : manualPause ? '继续漂浮' : '暂停漂浮';
    pause.setAttribute('aria-pressed', String(manualPause || reduced.matches));
    pause.disabled = reduced.matches;
    wake();
  };
  const motionChange = () => {
    cancelAnimationFrame(raf); raf = 0; inertia = 0; coasting = false; settle = undefined;
    pendingOffset = undefined;
    document.body.classList.toggle('space-enhanced', !reduced.matches);
    if (reduced.matches) cards.forEach(({ element }) => { element.style.transform = ''; });
    else measure();
    syncPause();
  };

  const pointerDown = (event: PointerEvent) => {
    if (reduced.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (drag) return;
    drag = { id: event.pointerId, originX: event.clientX, originY: event.clientY,
      lastX: event.clientX, lastTime: performance.now(), startOffset: offset,
      active: false };
    inertia = 0; coasting = false; settle = undefined;
    stage.classList.add('is-pressing');
  };
  const pointerMove = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    const totalX = event.clientX - drag.originX, totalY = event.clientY - drag.originY;
    if (!drag.active) {
      if (Math.abs(totalX) < 7 || Math.abs(totalX) < Math.abs(totalY)) return;
      drag.active = true; stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    }
    const now = performance.now();
    const dx = event.clientX - drag.lastX;
    const dt = Math.max((now - drag.lastTime) / 1000, .004);
    pendingOffset = drag.startOffset + totalX;
    const blend = 1 - Math.exp(-22 * dt);
    inertia = Math.max(-1500, Math.min(1500, inertia * (1 - blend) + dx / dt * blend));
    drag.lastX = event.clientX; drag.lastTime = now;
    queueRender();
  };
  const pointerEnd = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.active) {
      // A stationary hold before release should stop the deck, not launch an old velocity.
      inertia *= Math.exp(-Math.max(0, performance.now() - drag.lastTime - 50) / 70);
      blockClickUntil = performance.now() + 300;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    }
    if (event.type === 'pointercancel' || manualPause) inertia = 0;
    coasting = drag.active && Math.abs(inertia) >= 4;
    drag = undefined; hoverPause = false;
    stage.classList.remove('is-dragging', 'is-pressing'); wake();
  };
  const showPhoto = (index: number) => {
    photoIndex = (index + items.length) % items.length;
    const card = items[photoIndex];
    heading.textContent = card.querySelector('strong')?.textContent || '照片';
    dialog.dataset.color = card.dataset.color;
    if (photo) { photo.src = card.dataset.photoSrc || ''; photo.alt = card.dataset.photoAlt || ''; }
  };
  const openCard = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-open-card]');
    if (!target || performance.now() < blockClickUntil) return;
    const card = target.closest<HTMLElement>('.space-card');
    if (!card) return;
    opener = target; inertia = 0; coasting = false; settle = undefined;
    showPhoto(items.indexOf(card));
    dialog.showModal(); close.focus();
  };
  const dialogClosed = () => { opener?.focus({ preventScroll: true }); wake(); };
  const revealFocusedCard = (event: FocusEvent) => {
    const card = cards.find(({ element }) => element.contains(event.target as Node));
    if (!card) return;
    lastFocusedIndex = items.indexOf(card.element);
    if (reduced.matches || !keyboardMode) return;
    focusPause = true; inertia = 0; coasting = false; settle = undefined;
    offset -= card.distance;
    // Center before native focus scrolling can try to reveal a distant card.
    render();
  };
  const focusOut = (event: FocusEvent) => {
    if (!stage.contains(event.relatedTarget as Node)) { focusPause = false; wake(); }
  };
  const pointerOver = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || drag?.active) return;
    hoverPause = Boolean((event.target as HTMLElement).closest('[data-open-card]'));
    wake();
  };
  const pointerLeave = () => {
    hoverPause = false;
    if (drag && !drag.active) { drag = undefined; stage.classList.remove('is-pressing'); }
    wake();
  };
  const keyboardInput = () => { keyboardMode = true; };
  const pointerInput = () => { keyboardMode = false; focusPause = false; };
  const resize = new ResizeObserver(measure);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); });
  resize.observe(stage); intersection.observe(stage);
  stage.addEventListener('pointerdown', pointerDown);
  stage.addEventListener('pointermove', pointerMove);
  stage.addEventListener('pointerup', pointerEnd);
  stage.addEventListener('pointercancel', pointerEnd);
  stage.addEventListener('pointerover', pointerOver);
  stage.addEventListener('pointerleave', pointerLeave);
  stage.addEventListener('focusin', revealFocusedCard);
  stage.addEventListener('focusout', focusOut);
  stage.addEventListener('click', openCard);
  pause.addEventListener('click', () => { manualPause = !manualPause; inertia = 0; coasting = false; syncPause(); });
  document.querySelectorAll<HTMLButtonElement>('[data-space-step]').forEach((button) => {
    button.addEventListener('click', () => {
      if (reduced.matches) {
        const index = Math.max(0, Math.min(items.length - 1, lastFocusedIndex + Number(button.dataset.spaceStep)));
        items[index].querySelector<HTMLButtonElement>('button')?.focus();
        return;
      }
      const target = Math.round(offset / spacing) * spacing - Number(button.dataset.spaceStep) * spacing;
      settle = { from: offset, to: target, started: performance.now() };
      inertia = 0; coasting = false; queueRender();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-photo-step]').forEach((button) => {
    button.addEventListener('click', () => showPhoto(photoIndex + Number(button.dataset.photoStep)));
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', dialogClosed);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.addEventListener('visibilitychange', wake);
  document.addEventListener('space:opening-change', wake);
  document.addEventListener('keydown', keyboardInput);
  document.addEventListener('pointerdown', pointerInput, { capture: true, passive: true });
  reduced.addEventListener('change', motionChange);
  const pageHide = (event: PageTransitionEvent) => {
    cancelAnimationFrame(raf); raf = 0;
    if (event.persisted) return;
    resize.disconnect(); intersection.disconnect();
    document.removeEventListener('visibilitychange', wake);
    document.removeEventListener('space:opening-change', wake);
    document.removeEventListener('keydown', keyboardInput);
    document.removeEventListener('pointerdown', pointerInput, { capture: true });
    reduced.removeEventListener('change', motionChange);
  };
  window.addEventListener('pagehide', pageHide);
  window.addEventListener('pageshow', wake);
  motionChange();
}
