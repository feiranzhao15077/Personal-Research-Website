import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../dist');
const base = (process.env.PUBLIC_BASE_PATH || '/').replace(/\/$/, '');
const files = fs.readdirSync(root, { recursive: true }).filter((name) => name.endsWith('.html'));
const external = new Set();
const results = [];
const failures = [];
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const pagePath = file === 'index.html' ? '/' : `/${file.replace(/index\.html$/, '')}`;
  for (const match of html.matchAll(/<(?:a|img|link)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^mailto:/.test(href)) continue;
    if (/^https?:/.test(href)) {
      // Canonical and OG metadata are not outbound material links.
      if (/^<(?:a|img)\b/.test(match[0])) external.add(href);
      continue;
    }
    const url = new URL(href, `https://audit.invalid${base}${pagePath}`);
    if (base && !url.pathname.startsWith(`${base}/`)) { failures.push(`${file}: missing deployment base ${href}`); continue; }
    let target = decodeURIComponent(url.pathname.slice(base.length)).replace(/^\//, '');
    if (!target || target.endsWith('/')) target += 'index.html';
    const resolved = path.resolve(root, target);
    if (!resolved.startsWith(`${root}${path.sep}`) || !fs.existsSync(resolved)) { failures.push(`${file}: missing ${href}`); continue; }
    if (url.hash && target.endsWith('.html')) {
      const text = fs.readFileSync(resolved, 'utf8');
      if (!text.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) failures.push(`${file}: missing anchor ${href}`);
    }
  }
}
if (process.argv.includes('--external')) {
  for (const url of external) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'ResearchWebsiteReleaseAudit' } });
      await response.body?.cancel();
      results.push({ url, status: response.status, classification: response.ok ? 'PASS' : 'BROKEN' });
      if (!response.ok) failures.push(`External material ${response.status}: ${url}`);
    } catch (error) { results.push({ url, classification: 'UNVERIFIED', error: error.message }); failures.push(`External material unverified: ${url}`); }
  }
}
console.log(JSON.stringify({ htmlRoutes: files.length, externalResults: results, failures }, null, 2));
if (failures.length) process.exit(1);
