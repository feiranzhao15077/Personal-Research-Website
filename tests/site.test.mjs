import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const files = [
  'index.html', 'projects/emvision/index.html', 'projects/lowalt-md/index.html',
  'projects/em-trace/index.html', 'projects/quadcontrol-lab/index.html', '404.html'
];
const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8');

test('all required static routes exist with semantic metadata', () => {
  for (const file of files) {
    assert.ok(fs.existsSync(path.join(dist,file)), file);
    const html = read(file);
    assert.match(html, /<html lang="zh-CN">/);
    assert.match(html, /<main id="main">/);
    assert.match(html, /<title>/);
    assert.match(html, /name="description"/);
    assert.match(html, /name="robots" content="noindex,nofollow"/);
    assert.ok(gzipSync(html).length < 100 * 1024, `${file}: HTML over budget`);
  }
});

test('navigation, core evidence and boundaries render in static HTML', () => {
  const home = read('index.html');
  for (const href of ['/#research-map','/#projects','/#materials','/#contact','/projects/emvision/','/projects/lowalt-md/','/projects/em-trace/','/projects/quadcontrol-lab/','/documents/research-overview.pdf']) assert.ok(home.includes(href), href);
  for (const id of ['EVM-02','LOW-01','LOW-02','EMT-01','QC-01']) assert.ok(home.includes(id), id);
  assert.ok(home.includes('不支持以下解读'));
  assert.ok(!home.includes('mailto:TBD'));
  const low = read('projects/lowalt-md/index.html');
  const emt = read('projects/em-trace/index.html');
  assert.ok(low.includes('LOW-06') && low.includes('负结果'));
  assert.ok(emt.includes('EMT-05') && emt.includes('已撤回'));
});

test('local links and figure assets resolve in dist', () => {
  for (const file of files) {
    const html = read(file);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      const url = new URL(match[1], 'https://draft.invalid');
      const relative = decodeURIComponent(url.pathname.slice(1));
      const target = path.join(dist, relative);
      const exists = fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'));
      assert.ok(exists, `${file} → ${relative}`);
    }
  }
});

test('first-party CSS and interaction JavaScript stay within budget', () => {
  const cssDir = path.join(dist, '_astro');
  const cssFiles = fs.readdirSync(cssDir).filter((file) => file.endsWith('.css'));
  const bytes = cssFiles.reduce((n, file) => n + gzipSync(fs.readFileSync(path.join(cssDir,file))).length, 0);
  assert.ok(bytes < 50 * 1024, `CSS gzip ${bytes} > 50KB`);
  const jsFiles = fs.readdirSync(cssDir).filter((file) => file.endsWith('.js'));
  const bundledJs = jsFiles.reduce((n, file) => n + gzipSync(fs.readFileSync(path.join(cssDir,file))).length, 0);
  const inlineJs = [...read('index.html').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].reduce((n, match) => n + gzipSync(match[1]).length, 0);
  const jsBytes = bundledJs + inlineJs;
  assert.ok(jsBytes < 80 * 1024, `JS gzip ${jsBytes} > 80KB`);
  for (const file of files) assert.doesNotMatch(read(file), /<script[^>]+src="https?:/i, `${file}: third-party script`);
});
