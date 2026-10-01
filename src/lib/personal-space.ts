/** Local gallery framework: empty slots with a draggable, depth-layered card field. */
export function setupPersonalSpace() {
  const stage = document.querySelector<HTMLElement>('.space-stage');
  const pause = document.querySelector<HTMLButtonElement>('[data-space-pause]');
  const dialog = document.querySelector<HTMLDialogElement>('.space-dialog');
  const close = document.querySelector<HTMLButtonElement>('[data-space-close]');
  const heading = document.querySelector<HTMLElement>('#space-dialog-title');
  const items = Array.from(document.querySelectorAll<HTMLElement>('.space-card'));
  if (!stage || !pause || !dialog || !close || !heading || !items.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const counts = [0, 0, 0];
  const cards = items.map((element) => {
    const layer = Number(element.dataset.layer);
    return { element, layer, ordinal: counts[layer]++, tilt: Number(element.dataset.tilt), x: 0,
      width: 0, height: 0, period: 0, lane: 0, depth: [.42, .7, 1][layer] };
  });
  let width = 0, offset = 0, inertia = 0, clock = 0;
  let manualPause = false, focusPause = false, hoverPause = false, visible = true;
  let drag: { id: number; originX: number; originY: number; lastX: number; lastTime: number; active: boolean } | undefined;
  let blockClickUntil = 0, raf = 0, previousTime = 0;
  let opener: HTMLButtonElement | undefined;
  let keyboardMode = false, lastFocusedIndex = 0;

  const isPaused = () => manualPause || focusPause || hoverPause || dialog.open;
  const render = () => {
    if (reduced.matches) return;
    cards.forEach((card) => {
      const phase = (width < 650 ? [.35, .82, .58] : [.22, .5, .12])[card.layer] * width;
      const position = card.ordinal * card.period / counts[card.layer] + phase + offset * card.depth;
      card.x = ((position % card.period) + card.period) % card.period - card.width;
      const sway = Math.sin(clock * .55 + card.ordinal * 2 + card.layer) * [3, 5, 7][card.layer];
      const tilt = card.tilt + Math.sin(clock * .35 + card.ordinal) * .7;
      card.element.style.transform = `translate3d(${card.x}px, ${card.lane + sway}px, 0) rotate(${tilt}deg)`;
    });
  };
  const measure = () => {
    if (reduced.matches) return;
    width = stage.clientWidth;
    const height = stage.clientHeight;
    const compact = width < 650;
    cards.forEach((card) => {
      card.width = (compact ? [130, 160, 185] : [165, 205, 240])[card.layer];
      card.height = Math.round(card.width * 1.3);
      card.period = Math.max(width + card.width * 2, counts[card.layer] * card.width * 1.9);
      card.lane = (height - card.height) * [.06, .45, .91][card.layer];
      card.element.style.setProperty('--card-width', `${card.width}px`);
      card.element.style.setProperty('--card-height', `${card.height}px`);
      card.element.style.zIndex = String(card.layer + 1);
    });
    render();
  };
  const tick = (time: number) => {
    raf = 0;
    const dt = Math.min((time - previousTime) / 1000, .05);
    previousTime = time;
    if (!isPaused() && !drag?.active) {
      offset += (-22 + inertia) * dt;
      inertia *= Math.exp(-2.3 * dt);
      clock += dt;
      render();
    }
    if (visible && !document.hidden && !reduced.matches && !isPaused() && !drag?.active) raf = requestAnimationFrame(tick);
  };
  const wake = () => {
    if (raf || !visible || document.hidden || reduced.matches || isPaused() || drag?.active) return;
    previousTime = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const syncPause = () => {
    pause.textContent = reduced.matches ? '静态浏览' : manualPause ? '继续漂浮' : '暂停漂浮';
    pause.setAttribute('aria-pressed', String(manualPause || reduced.matches));
    pause.disabled = reduced.matches;
    wake();
  };
  const motionChange = () => {
    cancelAnimationFrame(raf); raf = 0; inertia = 0;
    document.body.classList.toggle('space-enhanced', !reduced.matches);
    if (reduced.matches) cards.forEach(({ element }) => { element.style.transform = ''; });
    else measure();
    syncPause();
  };

  const pointerDown = (event: PointerEvent) => {
    if (reduced.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag = { id: event.pointerId, originX: event.clientX, originY: event.clientY,
      lastX: event.clientX, lastTime: performance.now(), active: false };
    inertia = 0;
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
    const dt = Math.max((now - drag.lastTime) / 1000, .008);
    offset += dx;
    inertia = Math.max(-1500, Math.min(1500, inertia * .5 + dx / dt * .5));
    drag.lastX = event.clientX; drag.lastTime = now;
    render();
  };
  const pointerEnd = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.active) {
      blockClickUntil = performance.now() + 300;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    }
    if (event.type === 'pointercancel' || manualPause) inertia = 0;
    drag = undefined; hoverPause = false;
    stage.classList.remove('is-dragging'); wake();
  };
  const openCard = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-open-card]');
    if (!target || performance.now() < blockClickUntil) return;
    const card = target.closest<HTMLElement>('.space-card');
    if (!card) return;
    opener = target; inertia = 0;
    heading.textContent = card.querySelector('strong')?.textContent || '自由作品';
    dialog.dataset.color = card.dataset.color;
    dialog.showModal(); close.focus();
  };
  const dialogClosed = () => { opener?.focus({ preventScroll: true }); wake(); };
  const revealFocusedCard = (event: FocusEvent) => {
    const card = cards.find(({ element }) => element.contains(event.target as Node));
    if (!card) return;
    lastFocusedIndex = items.indexOf(card.element);
    if (reduced.matches || !keyboardMode) return;
    focusPause = true; inertia = 0;
    offset += (width / 2 - card.width / 2 - card.x) / card.depth;
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
  const pointerLeave = () => { hoverPause = false; wake(); };
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
  pause.addEventListener('click', () => { manualPause = !manualPause; inertia = 0; syncPause(); });
  document.querySelectorAll<HTMLButtonElement>('[data-space-step]').forEach((button) => {
    button.addEventListener('click', () => {
      if (reduced.matches) {
        const index = Math.max(0, Math.min(items.length - 1, lastFocusedIndex + Number(button.dataset.spaceStep)));
        items[index].querySelector<HTMLButtonElement>('button')?.focus();
        return;
      }
      offset -= Number(button.dataset.spaceStep) * Math.min(width * .45, 320);
      inertia = 0; render();
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', dialogClosed);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.addEventListener('visibilitychange', wake);
  document.addEventListener('keydown', keyboardInput);
  document.addEventListener('pointerdown', pointerInput, { capture: true, passive: true });
  reduced.addEventListener('change', motionChange);
  const pageHide = (event: PageTransitionEvent) => {
    cancelAnimationFrame(raf); raf = 0;
    if (event.persisted) return;
    resize.disconnect(); intersection.disconnect();
    document.removeEventListener('visibilitychange', wake);
    document.removeEventListener('keydown', keyboardInput);
    document.removeEventListener('pointerdown', pointerInput, { capture: true });
    reduced.removeEventListener('change', motionChange);
  };
  window.addEventListener('pagehide', pageHide);
  window.addEventListener('pageshow', wake);
  motionChange();
}
