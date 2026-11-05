(() => {
  const output = document.createElement('output'); output.id = 'local-scroll-profile'; output.hidden = true; document.body.append(output);
  let active = false, end = 0, frame = 0, previous = 0, samples = [], tasks = [], bursts = 0;
  const report = () => { const sorted = [...samples].sort((a, b) => a - b); output.textContent = JSON.stringify({ bursts, frames: samples.length, framesOver35ms: samples.filter(t => t > 35).length, p95: +(sorted[Math.floor(sorted.length * .95)] || 0).toFixed(1), maxFrame: +Math.max(0, ...samples).toFixed(1), longTasks: tasks.map(t => ({ duration: +t.duration.toFixed(1), at: +t.at.toFixed(1) })), stages: [...document.querySelectorAll('[data-model-stage]')].map(el => ({ mode: el.dataset.stageMode, mounted: el.dataset.stageMounted, rendered: el.dataset.stageRendered })), root: document.documentElement.dataset.scrollActive }); };
  const tick = now => { frame = 0; if (!active) return; if (previous) samples.push(now - previous); previous = now; frame = requestAnimationFrame(tick); };
  if (PerformanceObserver.supportedEntryTypes.includes('longtask')) new PerformanceObserver(list => { if (active) tasks.push(...list.getEntries().map(e => ({ duration: e.duration, at: e.startTime }))); }).observe({ type: 'longtask' });
  addEventListener('scroll', () => { if (document.body.style.overflow === 'hidden') return; if (!active) { bursts++; previous = 0; } active = true; clearTimeout(end); if (!frame) frame = requestAnimationFrame(tick); end = setTimeout(() => { active = false; report(); }, 600); }, { passive: true });
  report();
})();
(() => {
 const output = document.createElement('output'); output.id = 'local-scroll-phase'; output.hidden = true; document.body.append(output);
 const events = []; output.textContent = '[]';
 new MutationObserver(records => { for (const record of records) {
  const node = record.target; if (node.matches?.('[data-model-stage]') && ['data-stage-mounted', 'data-stage-rendered', 'data-stage-scroll-paused'].includes(record.attributeName)) {
   events.push({ attribute: record.attributeName, value: node.getAttribute(record.attributeName), scrolling: document.documentElement.dataset.scrollActive });
  }
 } output.textContent = JSON.stringify(events); }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-stage-mounted', 'data-stage-rendered', 'data-stage-scroll-paused'] });
})();
