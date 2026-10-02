import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const base = process.env.PUBLIC_BASE_PATH || '/';
const production = process.env.RELEASE_MODE === 'production';
const sitePath = (pathname) => `${base.replace(/\/$/, '')}${pathname}`;
const files = [
  'index.html', 'projects/emvision/index.html', 'projects/lowalt-md/index.html',
  'projects/em-trace/index.html', 'projects/quadcontrol-lab/index.html',
  'coursework/index.html', 'space/index.html', '404.html'
];
const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8');

test('all required static routes exist with semantic metadata', () => {
  for (const file of files) {
    assert.ok(fs.existsSync(path.join(dist,file)), file);
    const html = read(file);
    assert.match(html, /<html lang="zh-CN">/);
    assert.match(html, file === 'space/index.html' ? /<main id="space-main">/ : /<main id="main">/);
    assert.match(html, /<title>/);
    assert.match(html, /name="description"/);
    if (!production || file === '404.html' || file === 'space/index.html') assert.match(html, /name="robots" content="noindex,nofollow"/);
    else assert.doesNotMatch(html, /name="robots" content="noindex,nofollow"/);
    assert.ok(gzipSync(html).length < 100 * 1024, `${file}: HTML over budget`);
  }
});

test('navigation, core evidence and boundaries render in static HTML', () => {
  const home = read('index.html');
  if (production) assert.ok(home.includes('https://zhaofeiran.pages.dev/'));
  if (production && process.env.RELEASE_TARGET === 'initial') {
    assert.ok(!home.includes('/documents/Zhaofeiran_CV.pdf'));
    assert.ok(!home.includes('版本待确认'));
  }
  for (const href of ['/#research-map','/#projects','/#materials','/#contact','/projects/emvision/','/projects/lowalt-md/','/projects/em-trace/','/projects/quadcontrol-lab/','/documents/research-overview.pdf'].map(sitePath)) assert.ok(home.includes(href), href);
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
      assert.ok(url.pathname.startsWith(base), `${file}: wrong base ${url.pathname}`);
      const relative = decodeURIComponent(url.pathname.slice(base.length));
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
  // The budget applies to what a route can load, counting each dependency once.
  // Include dynamic dependencies conservatively, even when a later action loads them.
  for (const file of files) {
    const html = read(file), seen = new Set();
    const visit = relative => {
      if (seen.has(relative)) return 0;
      seen.add(relative);
      const source = fs.readFileSync(path.join(dist, relative), 'utf8');
      let bytes = gzipSync(source).length;
      const imports = [
        ...source.matchAll(/\b(?:import|export)\s*(?:[^"'();]*?\bfrom\s*)?["']([^"']+)["']/g),
        ...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g),
      ];
      for (const match of imports) {
        if (!match[1].startsWith('.')) continue;
        const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(relative), match[1]));
        if (dependency.endsWith('.js')) bytes += visit(dependency);
      }
      return bytes;
    };
    let bytes = 0;
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/type="(?:application\/ld\+json|application\/json)"/.test(match[1])) continue;
      const src = match[1].match(/src="([^"]+)"/)?.[1];
      if (src?.startsWith(base)) bytes += visit(decodeURIComponent(src.slice(base.length)));
      else if (!src) bytes += gzipSync(match[2]).length;
    }
    assert.ok(bytes < 50 * 1024, `${file}: JS gzip ${bytes} > 50KiB per route`);
  }
  for (const file of files) assert.doesNotMatch(read(file), /<script[^>]+src="https?:/i, `${file}: third-party script`);
});

test('gallery keeps full photos deferred and private space out of the sitemap', () => {
  const html = read('space/index.html');
  assert.match(html, /data-space-photo[^>]*alt=""/);
  assert.doesNotMatch(html, /<img[^>]*data-space-photo[^>]*src=/);
  assert.equal([...html.matchAll(/data-photo-src=/g)].length, 18);
  assert.equal([...html.matchAll(/data-photo-rotation="-90"/g)].length, 1);
  assert.equal([...html.matchAll(/data-photo-rotation="90"/g)].length, 1);
  const sitemap = read('sitemap-0.xml');
  assert.doesNotMatch(sitemap, /\/space\//);
});
