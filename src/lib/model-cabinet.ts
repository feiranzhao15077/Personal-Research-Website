/** Preserve the entrance origin; the display case owns its own light and turntable. */
export function setupCabinetEntrances() {
  document.querySelectorAll<HTMLElement>('[data-model-entrance]').forEach(entry => {
    entry.addEventListener('click', () => {
      if (entry.dataset.cabinetOrigin) {
        try { sessionStorage.setItem('zfr-model-cabinet-origin', entry.dataset.cabinetOrigin); } catch { /* The normal return link still works. */ }
      }
    });
  });
}

/** Separate figures prevent a late image request from showing the preceding view. */
export function setupModelShowcase() {
  const root = document.querySelector<HTMLElement>('[data-model-showcase]');
  if (!root) return;
  const figures = Array.from(root.querySelectorAll<HTMLElement>('[data-model-view]'));
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-select-view]'));
  const counter = root.querySelector<HTMLElement>('[data-view-counter]')!;
  const controls = root.querySelector<HTMLElement>('[data-view-controls]')!;
  const status = root.querySelector<HTMLElement>('[data-view-status]')!;
  const toggle = document.querySelector<HTMLAnchorElement>('[data-model-gallery-toggle]');
  const stage = root.dataset.modelGalleryStage ? document.getElementById(root.dataset.modelGalleryStage) : null;
  let selected = 0;
  const updateStatus = () => {
    const img = figures[selected]?.querySelector<HTMLImageElement>('img');
    const failed = img?.dataset.failed === 'true';
    status.textContent = failed ? '这张图片未能加载，可以点击打开高清图重试。' : img && (!img.complete || !img.naturalWidth) ? '正在加载这个视角…' : '';
    status.hidden = !status.textContent;
  };
  const show = (index: number) => {
    selected = (index + figures.length) % figures.length;
    figures.forEach((figure, i) => { figure.hidden = i !== selected; });
    links.forEach((link, i) => { if (i === selected) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current'); });
    counter.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(figures.length).padStart(2, '0')}`;
    const img = figures[selected].querySelector<HTMLImageElement>('img');
    if (img && !root.hidden) img.loading = 'eager';
    updateStatus();
  };
  figures.forEach(figure => {
    const img = figure.querySelector<HTMLImageElement>('img');
    img?.addEventListener('load', updateStatus);
    img?.addEventListener('error', () => { img.dataset.failed = 'true'; updateStatus(); });
  });
  links.forEach((link, i) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); show(i);
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-view-step]').forEach(button => button.addEventListener('click', () => show(selected + Number(button.dataset.viewStep))));
  root.addEventListener('keydown', event => {
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && (event.target as Element).closest('[data-select-view], [data-view-controls]')) {
      event.preventDefault(); show(selected + (event.key === 'ArrowLeft' ? -1 : 1)); links[selected].focus({ preventScroll: true });
    }
  });
  controls.hidden = figures.length < 2;
  root.dataset.showcaseReady = 'true';
  show(0);
  if (toggle && stage) {
    const setGallery = (open: boolean) => {
      root.hidden = !open;
      stage.hidden = open;
      document.body.dataset.modelView = open ? 'photos' : 'model';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '查看模型' : '细节图';
      if (open) show(selected);
    };
    // Keep the real image link usable until this enhancement is ready.
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-controls', root.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      setGallery(root.hidden);
    });
    toggle.addEventListener('keydown', event => {
      if (event.key === ' ') {
        event.preventDefault();
        if (!event.repeat) setGallery(root.hidden);
      }
    });
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !root.hidden) {
        event.preventDefault();
        setGallery(false);
        toggle.focus({ preventScroll: true });
      }
    });
  }
}
