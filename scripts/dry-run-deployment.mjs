import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '../dist');
const base = process.env.PUBLIC_BASE_PATH || '/';
const prefix = base === '/' ? '' : base.slice(0, -1);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (prefix && !url.pathname.startsWith(`${prefix}/`)) { res.writeHead(404); res.end(); return; }
  let name = decodeURIComponent(url.pathname.slice(prefix.length)).replace(/^\//, '');
  if (!name || name.endsWith('/')) name += 'index.html';
  const file = path.resolve(root, name);
  const valid = file.startsWith(`${root}${path.sep}`) && fs.existsSync(file) && fs.statSync(file).isFile();
  const target = valid ? file : path.join(root, '404.html');
  res.writeHead(valid ? 200 : 404, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = (pathname) => `${origin}${prefix}${pathname}`;
const slugs = ['emvision', 'lowalt-md', 'em-trace', 'quadcontrol-lab'];
const figureLinks = new Set();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const width of [1440, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    const response = await page.goto(url('/'));
    assert.equal(response.status(), 200);
    assert.equal(await page.locator('#research-map').count(), 1);
    assert.equal(await page.locator('a[href$="/documents/research-overview.pdf"]').count() > 0, true);
    assert.equal(await page.locator('a[href^="https://github.com/"]').count() > 0, true);
    assert.equal(await page.locator('a[href^="mailto:"]').count() > 0, true);
    if (await page.locator('a[href$="/documents/Zhaofeiran_CV.pdf"]').count()) {
      assert.equal(await page.locator('a[href$="/documents/Zhaofeiran_CV.pdf"][download="Zhaofeiran_CV.pdf"]').count(), 1);
      const cv = await fetch(url('/documents/Zhaofeiran_CV.pdf'));
      assert.equal(cv.status, 200);
      assert.match(cv.headers.get('content-type') || '', /application\/pdf/);
      assert.equal(Buffer.from(await cv.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    const mapLink = page.locator('#research-map a[href*="/projects/"]').first();
    await mapLink.click();
    assert.match(page.url(), /\/projects\//);
    for (const slug of slugs) {
      const response = await page.goto(url(`/projects/${slug}/`));
      assert.equal(response.status(), 200, slug);
      assert.equal(await page.locator('.boundary').count() > 0, true, `${slug} boundary`);
      assert.equal(await page.locator('.evidence-block').count() > 0, true, `${slug} evidence`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${slug} overflow at ${width}`);
      await page.locator('.deep-figures').evaluateAll((elements) => elements.forEach((el) => { el.open = true; }));
      for (const href of await page.locator('.figure-image-link').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href')))) figureLinks.add(href);
      const figure = page.locator('.figure-image-link').first();
      await figure.click();
      assert.equal(await page.locator('.figure-viewer').isVisible(), true, `${slug} viewer`);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.figure-viewer').isVisible(), false, `${slug} viewer close`);
    }
    const missing = await page.goto(url('/missing-release-check/'));
    assert.equal(missing.status(), 404);
    assert.equal(await page.locator('main h1').textContent(), '页面未找到');
    await page.close();
  }
  assert.equal(figureLinks.size, 13, '13 unique figure links');
  for (const link of figureLinks) {
    const response = await fetch(new URL(link, origin));
    assert.equal(response.status, 200, link);
    assert.match(response.headers.get('content-type') || '', /image\//, link);
    await response.body?.cancel();
  }
  const pdf = await fetch(url('/documents/research-overview.pdf'));
  assert.equal(pdf.status, 200);
  assert.match(pdf.headers.get('content-type') || '', /application\/pdf/);
  assert.equal(Buffer.from(await pdf.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
  console.log(`DRY RUN PASS: base=${base}; 2 widths; 4 projects; 13 figures; PDF; 404; map; viewer; boundaries.`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
