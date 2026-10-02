/** Account for wrapped navigation and text zoom when locating an anchor. */
export function setupHeaderOffset() {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;
  const update = () => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
  update();
  const observer = new ResizeObserver(update);
  observer.observe(header);
  const initialHash = location.hash;
  const alignHash = () => {
    if (!initialHash || location.hash !== initialHash) return;
    try { document.getElementById(decodeURIComponent(initialHash.slice(1)))?.scrollIntoView({ block: 'start' }); } catch {}
  };
  if (document.readyState === 'complete') alignHash();
  else window.addEventListener('load', alignHash, { once: true });
  window.addEventListener('pageshow', update);
  window.addEventListener('pagehide', event => { if (!event.persisted) observer.disconnect(); });
}
