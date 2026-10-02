interface Message { role: 'user' | 'assistant'; content: string; }
export function setupGuideQuestions(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-guide-question-form]')!;
  const question = form.querySelector<HTMLTextAreaElement>('textarea')!;
  const send = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  const status = form.querySelector<HTMLElement>('[data-guide-ask-status]')!;
  const cancel = form.querySelector<HTMLButtonElement>('[data-guide-ask-cancel]')!;
  const retry = form.querySelector<HTMLButtonElement>('[data-guide-ask-retry]')!;
  const clear = form.querySelector<HTMLButtonElement>('[data-guide-ask-clear]')!;
  const log = root.querySelector<HTMLElement>('[data-guide-conversation]')!;
  let history: Message[] = [], requestId = 0, lastQuestion = '';
  let controller: AbortController | undefined;
  const row = (role: Message['role'], text: string) => {
    const article = document.createElement('article'); article.className = `guide-message guide-message-${role}`;
    const label = document.createElement('strong'); label.textContent = role === 'user' ? '你' : 'deepseek酱';
    const body = document.createElement('p'); body.textContent = text;
    article.append(label, body); log.append(article);
    while (log.children.length > 12) log.firstElementChild?.remove();
    article.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    return article;
  };
  const busy = (value: boolean) => {
    send.disabled = value; question.readOnly = value; clear.disabled = value;
    cancel.hidden = !value; retry.hidden = true;
    form.setAttribute('aria-busy', String(value));
    send.textContent = value ? '正在回答…' : '发送问题';
  };
  const ask = async (text: string, isRetry = false) => {
    if (controller || !text.trim() || text.length > 400) return;
    lastQuestion = text.trim();
    const id = ++requestId;
    controller = new AbortController();
    const signal = controller.signal;
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller?.abort(); }, 35_000);
    if (!isRetry) row('user', lastQuestion);
    busy(true); status.textContent = '我正在结合公开资料整理回答…';
    try {
      const response = await fetch(root.dataset.guideEndpoint!, { method: 'POST', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: lastQuestion, history: history.slice(-6), page: root.dataset.guidePath }),
      });
      if (!response.headers.get('Content-Type')?.includes('application/json')) throw new Error('问答服务暂未连接，可以先阅读导读，稍后重试。');
      const result = await response.json();
      if (!response.ok || typeof result.answer !== 'string') throw new Error(result.error || '没有收到回答，请重试。');
      if (id !== requestId) return;
      const message = row('assistant', result.answer);
      if (Array.isArray(result.links)) {
        const links = document.createElement('div'); links.className = 'guide-links';
        result.links.forEach((item: { href?: string; label?: string }) => {
          if (!item.href?.startsWith('/projects/') || !item.label) return;
          const anchor = document.createElement('a'); anchor.textContent = item.label; anchor.href = item.href; links.append(anchor);
        });
        message.append(links);
      }
      history = [...history, { role: 'user', content: lastQuestion }, { role: 'assistant', content: result.answer.slice(0, 1800) }].slice(-6) as Message[];
      question.value = '';
      status.textContent = result.truncated ? '回答已达到长度上限，可以继续追问。' : '可以继续追问。';
    } catch (error) {
      if (id !== requestId) return;
      status.textContent = signal.aborted ? timedOut ? '等待超时，请重试。' : '已停止等待，问题保留在输入框中。'
        : error instanceof Error ? error.message : '连接中断，请重试。';
      question.value = lastQuestion;
      retry.hidden = false;
    } finally {
      window.clearTimeout(timeout);
      if (id === requestId) {
        const failed = !retry.hidden;
        controller = undefined; busy(false); retry.hidden = !failed;
      }
    }
  };
  form.addEventListener('submit', event => { event.preventDefault(); void ask(question.value); });
  question.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) { event.preventDefault(); form.requestSubmit(); }
  });
  cancel.addEventListener('click', () => controller?.abort());
  retry.addEventListener('click', () => { void ask(lastQuestion, true); });
  clear.addEventListener('click', () => { history = []; log.replaceChildren(); status.textContent = ''; retry.hidden = true; lastQuestion = ''; question.value = ''; question.focus(); });
  window.addEventListener('pagehide', () => { requestId++; controller?.abort(); controller = undefined; busy(false); });
}
