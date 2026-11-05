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
const modelFiles = fs.readdirSync(path.join(dist, 'models'), { withFileTypes: true })
  .filter(entry => entry.isDirectory()).map(entry => `models/${entry.name}/index.html`);
const allFiles = [...files, 'models/index.html', ...modelFiles];

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
  for (const file of allFiles) {
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

test('CSS, initial JavaScript and deferred 3D dependencies stay within separate budgets', () => {
  const cssDir = path.join(dist, '_astro');
  const cssFiles = fs.readdirSync(cssDir).filter((file) => file.endsWith('.css'));
  const bytes = cssFiles.reduce((n, file) => n + gzipSync(fs.readFileSync(path.join(cssDir,file))).length, 0);
  assert.ok(bytes < 50 * 1024, `CSS gzip ${bytes} > 50KB`);
  // Independent module gzip sums are regression budgets, not measured network timing.
  // Static imports and HTML modulepreloads belong to the initial graph. Dynamic
  // imports remain counted in the total; only the known 3D routes get that allowance.
  const measure = (html, includeDeferred) => {
    const seen = new Set();
    const resolve = (specifier, owner) => specifier.startsWith('.')
      ? path.posix.normalize(path.posix.join(path.posix.dirname(owner), specifier))
      : specifier.startsWith(base) ? decodeURIComponent(specifier.slice(base.length)) : null;
    const imports = (source, owner) => {
      const matches = [...source.matchAll(/\b(?:import|export)\s*(?:[^"'();]*?\bfrom\s*)?["']([^"']+)["']/g)];
      if (includeDeferred) matches.push(...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g));
      return matches.reduce((sum, match) => {
        const dependency = resolve(match[1], owner);
        return sum + (dependency?.endsWith('.js') ? visit(dependency) : 0);
      }, 0);
    };
    const visit = relative => {
      if (seen.has(relative)) return 0;
      seen.add(relative);
      const source = read(relative);
      return gzipSync(source).length + imports(source, relative);
    };
    let bytes = 0;
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/type="(?:application\/ld\+json|application\/json)"/.test(match[1])) continue;
      const src = match[1].match(/src="([^\"]+)"/)?.[1];
      if (src?.startsWith(base)) bytes += visit(decodeURIComponent(src.slice(base.length)));
      else if (!src) bytes += gzipSync(match[2]).length + imports(match[2], 'index.html');
    }
    for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
      if (!/rel="modulepreload"/.test(match[0])) continue;
      const href = match[0].match(/href="([^\"]+)"/)?.[1];
      if (href?.startsWith(base)) bytes += visit(decodeURIComponent(href.slice(base.length)));
    }
    return { bytes, modules: seen };
  };
  for (const file of allFiles) {
    const html = read(file);
    const initial = measure(html, false);
    const total = measure(html, true);
    const permits3D = file === 'index.html' || file === 'space/index.html' || modelFiles.includes(file);
    const totalLimit = (permits3D ? 250 : 50) * 1024;
    assert.ok(initial.bytes < 50 * 1024, `${file}: initial JS gzip ${initial.bytes} > 50KiB`);
    assert.ok(total.bytes < totalLimit, `${file}: total JS gzip ${total.bytes} > ${totalLimit / 1024}KiB`);
    assert.ok(![...initial.modules].some(module => /model-stage-runtime\./.test(module)), `${file}: 3D runtime must remain deferred`);
    assert.doesNotMatch(html, /<script[^>]+src="https?:/i, `${file}: third-party script`);
  }
});

test('every model detail has a native HD image entry before JavaScript enhancement', () => {
  assert.ok(modelFiles.length > 0, 'model details must be included');
  for (const file of modelFiles) {
    const html = read(file);
    const entry = html.match(/<a\b[^>]*data-model-gallery-toggle[^>]*>/)?.[0];
    assert.ok(entry, `${file}: native image entry missing`);
    const href = entry.match(/href="([^\"]+)"/)?.[1];
    const firstImage = html.match(/<a\b[^>]*class="model-view-image[^\"]*"[^>]*href="([^\"]+)"/)?.[1];
    assert.equal(href, firstImage, `${file}: native entry must open the first full-resolution view`);
    assert.ok(href?.startsWith(base) && /\.webp$/.test(href), `${file}: full-resolution image link`);
    assert.ok(fs.existsSync(path.join(dist, decodeURIComponent(href.slice(base.length)))), `${file}: HD image exists`);
  }
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
