interface ContentHint { element: Element; text: string; }

// Reviewed first-person prompts: no generated answers or additional research claims.
const hints: [string, string][] = [
  ['.drone-display', '这是我用 SolidWorks 实现的建模哦！机体几何和装配结构，都藏在这张图里啦。'],
  ['.card-link[href$="/em-trace/"]', '我从 CAD、CST 到 Python 串起计算电磁工具链，方向和极化也要对齐哦。'],
  ['.card-link[href$="/lowalt-md/"]', '我在这里研究低空传播与旋翼微多普勒，想看看多径怎样改变谱结构吗？'],
  ['.card-link[href$="/emvision/"]', '这是我的受控识别实验，训练域匹配是重点；结论限于合成测试场景哦。'],
  ['.card-link[href$="/quadcontrol-lab/"]', '我在这个独立分支里比较观测来源与闭环响应，先从仿真读起吧。'],
  ['.maxwell-notes', '我把电磁场的四条基本关系放在这里啦，矢量上的小箭头也不能丢哦。'],
  ['.map-aircraft', '我用这幅工程草图陪你看研究脉络。它是视觉示意，科研结论还是要回到项目证据里读哦。'],
  ['.evidence-block', '我会把结果、实验条件和解释边界一起看。数字也有自己的适用范围，可不能让它偷偷跑远啦。'],
  ['.hero-coursework', '我把本科课程按与研究方向的相关性整理在这里，想看看我的知识基础，就从这儿读起吧。'],
  ['.hero-github', '我带你去看公开研究摘要和精选代码。这些材料可以继续深入阅读，完整复现的条件要看各项目说明哦。'],
  ['a[href$="/Zhaofeiran_CV.pdf"]', '我的学术简历在这里，点一下就能打开 PDF。想快速认识我，也可以从这里开始哦。'],
  ['.personal-space-entry', '我还留了一个更自由的小宇宙，给个人作品和生活记录。要不要进去逛逛呀？'],
];

function findHint(target: EventTarget | null): ContentHint | null {
  if (!(target instanceof Element) || target.closest('[data-reader-guide]')) return null;
  const annotated = target.closest<HTMLElement>('[data-guide-hint]');
  if (annotated?.dataset.guideHint) return { element: annotated, text: annotated.dataset.guideHint };
  const figure = target.closest('.figure-frame');
  if (figure) {
    const name = figure.querySelector<HTMLElement>('[data-figure-title]')?.dataset.figureTitle;
    return { element: figure, text: name ? `我给你留了一张“${name}”。先读图注，再点开放大；来源和对应的证据也一起看哦。` : '我给你留了这幅科研图件，先读图注，再点开放大看看细节吧。' };
  }
  const card = target.closest('#research-map .b-card');
  for (const [selector, text] of hints) {
    const element = target.closest(selector) ?? card?.querySelector(selector);
    if (element) return { element: card ?? element, text };
  }
  return null;
}

/** Pointer dwell, keyboard focus and touch all use the same local prompts. */
export function setupGuideHints(root: HTMLElement, speech: HTMLElement, canSpeak: () => boolean,
  speak: (text: string, element: Element) => void, hide: () => void) {
  let active: ContentHint | null = null, dismissed: Element | null = null;
  let enterTimer = 0, leaveTimer = 0;
  const clearTimers = () => { window.clearTimeout(enterTimer); window.clearTimeout(leaveTimer); };
  const dismiss = (manual = false) => {
    clearTimers(); if (manual) dismissed = active?.element ?? null;
    hide();
  };
  const activate = (hint: ContentHint | null, delay: number) => {
    clearTimers();
    if (!hint) { if (active) leave(); return; }
    const same = hint.element === active?.element;
    active = hint;
    if (!same) dismissed = null;
    if (dismissed === hint.element || !canSpeak()) return;
    if (same && !speech.hidden) return;
    if (!same) speech.hidden = true;
    enterTimer = window.setTimeout(() => { if (active?.element === hint.element && canSpeak()) speak(hint.text, hint.element); }, delay);
  };
  const leave = () => {
    window.clearTimeout(enterTimer); window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(() => { active = null; dismissed = null; hide(); }, 420);
  };
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch' || root.contains(event.target as Node)) return;
    activate(findHint(event.target), 80);
  });
  document.addEventListener('pointerout', event => {
    if (active?.element.contains(event.target as Node) && !active.element.contains(event.relatedTarget as Node | null)
      && !root.contains(event.relatedTarget as Node | null)) leave();
  });
  document.addEventListener('focusin', event => { if (!root.contains(event.target as Node)) activate(findHint(event.target), 0); });
  document.addEventListener('focusout', event => {
    if (active?.element.contains(event.target as Node) && !active.element.contains(event.relatedTarget as Node | null)
      && !root.contains(event.relatedTarget as Node | null)) leave();
  });
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || root.contains(event.target as Node)) return;
    const hint = findHint(event.target); activate(hint, 0);
    if (hint) leaveTimer = window.setTimeout(() => { active = null; hide(); }, 6500);
  });
  speech.addEventListener('pointerenter', () => window.clearTimeout(leaveTimer));
  speech.addEventListener('pointerleave', event => {
    if (!active?.element.contains(event.relatedTarget as Node | null)) leave();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') dismiss(true); });
  window.addEventListener('pagehide', () => dismiss());
  return { dismiss };
}
