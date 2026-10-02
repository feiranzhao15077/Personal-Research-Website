import type { ReaderGuideContent } from './reader-guide-content';
import { setupGuidePosition } from './reader-guide-position';
import { setupGuideHints } from './reader-guide-hints';
import { setupGuideQuestions } from './reader-guide-questions';

/** Reviewed prompts, small character animations and server-backed questions. */
export function setupReaderGuide() {
  const root = document.querySelector<HTMLElement>('[data-reader-guide]');
  if (!root) return;
  const trigger = root.querySelector<HTMLButtonElement>('[data-guide-trigger]')!;
  const panel = root.querySelector<HTMLElement>('.guide-panel')!;
  const close = root.querySelector<HTMLButtonElement>('[data-guide-close]')!;
  const read = root.querySelector<HTMLElement>('[data-guide-read]')!;
  const ask = root.querySelector<HTMLElement>('[data-guide-ask]')!;
  const topic = root.querySelector<HTMLSelectElement>('[data-guide-topic]')!;
  const title = root.querySelector<HTMLElement>('[data-guide-answer-title]')!;
  const body = root.querySelector<HTMLElement>('[data-guide-answer-body]')!;
  const links = root.querySelector<HTMLElement>('[data-guide-links]')!;
  const greeting = root.querySelector<HTMLElement>('.guide-greeting')!;
  const speechText = root.querySelector<HTMLElement>('[data-guide-speech-text]')!;
  const pause = root.querySelector<HTMLButtonElement>('[data-guide-pause]')!;
  const modes = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-guide-mode]'));
  const content: ReaderGuideContent = JSON.parse(root.querySelector('[data-guide-content]')!.textContent!);
  setupGuideQuestions(root);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 700px)');
  let open = false, paused = reduced.matches, gestureTimer = 0, greetingTimer = 0, greetingShown = false;
  const frames = { idle: [0, 6, 2], wave: [3, 4, .8], jump: [4, 5, .85], review: [8, 6, 1.8] } as const;
  const resting = () => setState(open ? 'review' : 'idle');
  function setState(state: keyof typeof frames) {
    const [row, count, duration] = frames[state];
    root!.dataset.state = state;
    root!.style.setProperty('--sprite-row', String(row));
    root!.style.setProperty('--sprite-frames', String(count));
    root!.style.setProperty('--sprite-duration', `${duration}s`);
  }
  const gesture = (state: 'wave' | 'jump') => {
    window.clearTimeout(gestureTimer);
    if (paused || reduced.matches) return;
    setState(state);
    gestureTimer = window.setTimeout(resting, frames[state][2] * 1000);
  };
  const dismissGreeting = () => { greeting.hidden = true; window.clearTimeout(greetingTimer); };
  const renderTopic = () => {
    const selected = content.topics.find(item => item.id === topic.value) || content.topics[0];
    title.textContent = selected.title;
    body.replaceChildren(...selected.paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
    links.replaceChildren(...selected.links.map(item => {
      const a = document.createElement('a'); a.textContent = item.label; a.href = item.href;
      if (item.href.startsWith('https://') || /\.pdf(?:$|[?#])/i.test(item.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      return a;
    }));
  };
  const changeMode = (mode: 'read' | 'ask') => {
    read.hidden = mode !== 'read'; ask.hidden = mode !== 'ask';
    modes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.guideMode === mode)));
    gesture('wave');
    positioning.layout();
  };
  const setOpen = (value: boolean, focus = true) => {
    open = value; panel.hidden = !value; trigger.setAttribute('aria-expanded', String(value));
    trigger.setAttribute('aria-label', value ? '收起阅读向导' : '打开阅读向导');
    hintController.dismiss(); root.dataset.minimized = 'false';
    if (value) { gesture('wave'); if (focus) close.focus({ preventScroll: true }); }
    else { window.clearTimeout(gestureTimer); resting(); if (focus) trigger.focus({ preventScroll: true }); }
    positioning.layout();
  };
  const syncMotion = () => {
    if (reduced.matches) paused = true;
    root.dataset.paused = String(paused);
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? '继续动作' : '暂停动作';
    pause.disabled = reduced.matches;
    if (reduced.matches) pause.textContent = '动作已减少';
  };
  const syncAvailability = () => {
    const blocked = document.hidden || document.body.style.overflow === 'hidden'
      || document.documentElement.classList.contains('hero-intro-pending')
      || !!document.querySelector('dialog[open]');
    root.dataset.blocked = String(blocked); root.inert = blocked;
    if (blocked) hintController.dismiss();
    else positioning.autoPlace();
    if (blocked || root.dataset.ready !== 'true' || open || compact.matches || greetingShown) return;
    greetingShown = true;
    let welcomed = false;
    try { welcomed = sessionStorage.getItem('zfr-reader-guide-greeting-v1') === 'seen'; } catch {}
    if (welcomed) return;
    try { sessionStorage.setItem('zfr-reader-guide-greeting-v1', 'seen'); } catch {}
    speechText.textContent = '你好，我来陪你读一读。点我看导读，也可以按住我，挪到你喜欢的位置哦。';
    greeting.hidden = false; positioning.layout(); gesture('wave');
    greetingTimer = window.setTimeout(dismissGreeting, 8500);
  };
  const positioning = setupGuidePosition({ root, trigger, panel, speech: greeting,
    canAutoPlace: () => !open && greeting.hidden && root.dataset.blocked !== 'true' && root.dataset.minimized !== 'true',
    onMove: () => { setOpen(false, false); window.clearTimeout(gestureTimer); resting(); },
    onDrop: () => gesture('jump'),
  });
  const hintController = setupGuideHints(root, greeting,
    () => root.dataset.ready === 'true' && root.dataset.blocked !== 'true' && !open
      && root.dataset.dragging !== 'true' && root.dataset.minimized !== 'true',
    (text, element) => {
      dismissGreeting(); speechText.textContent = text; greeting.hidden = false;
      positioning.perch(element); gesture('wave');
    },
    () => { dismissGreeting(); positioning.perch(null); });
  trigger.addEventListener('click', () => { if (!positioning.consumeClick()) setOpen(!open); });
  trigger.addEventListener('pointerenter', () => { if (!open) gesture('wave'); });
  close.addEventListener('click', () => setOpen(false));
  root.querySelector('[data-guide-greeting-close]')!.addEventListener('click', () => hintController.dismiss(true));
  root.querySelector('[data-guide-minimize]')!.addEventListener('click', () => { setOpen(false); root.dataset.minimized = 'true'; positioning.layout(); });
  root.querySelector('[data-guide-reset]')!.addEventListener('click', positioning.reset);
  modes.forEach(button => button.addEventListener('click', () => changeMode(button.dataset.guideMode as 'read' | 'ask')));
  root.querySelector('[data-guide-return-read]')!.addEventListener('click', () => { changeMode('read'); modes[0].focus({ preventScroll: true }); });
  topic.addEventListener('change', () => { renderTopic(); positioning.layout(); gesture('jump'); });
  pause.addEventListener('click', () => { paused = !paused; syncMotion(); });
  root.addEventListener('keydown', event => { if (event.key === 'Escape') { if (open) setOpen(false); else hintController.dismiss(true); } });
  links.addEventListener('click', event => { if ((event.target as HTMLElement).closest('a')) setOpen(false, false); });
  document.addEventListener('pointerdown', event => { if (open && !root.contains(event.target as Node)) setOpen(false, false); });
  const observer = new MutationObserver(syncAvailability);
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  document.querySelectorAll('dialog').forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  document.addEventListener('visibilitychange', syncAvailability);
  window.addEventListener('pageshow', syncAvailability);
  window.addEventListener('pagehide', () => { dismissGreeting(); window.clearTimeout(gestureTimer); });
  reduced.addEventListener('change', syncMotion);
  renderTopic(); syncMotion(); syncAvailability();
  // Defer the small optimized atlas until the main page has been painted.
  window.setTimeout(() => {
    const perch = new Image();
    perch.onload = () => { root.style.setProperty('--guide-perch', `url("${perch.src}")`); root.dataset.perchReady = 'true'; positioning.layout(); };
    perch.src = root.dataset.perchUrl!;
    const image = new Image();
    image.onload = () => { root.style.setProperty('--guide-sheet', `url("${image.src}")`); root.dataset.ready = 'true'; positioning.restore(); syncAvailability(); };
    image.onerror = () => { root.dataset.minimized = 'true'; root.dataset.ready = 'true'; positioning.restore(); syncAvailability(); };
    image.src = root.dataset.spriteUrl!;
  }, 700);
}
