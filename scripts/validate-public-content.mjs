import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = path.resolve(import.meta.dirname, '..');
const release = process.env.RELEASE_MODE === 'production';
const scanDist = process.argv.includes('--dist');
const directories = scanDist ? ['dist'] : ['src', 'public'];
const problems = [];
const approvedEmail = YAML.parse(fs.readFileSync(path.join(root, 'src/content/site/profile.yaml'), 'utf8')).publicEmail;
const patterns = [
  [/raw\.githubusercontent\.com\/feiranzhao15077\/(?:EMvision|LowAlt-MD|EM-Trace|QuadControl-Lab)(?:\/|\b)/i, 'private raw artifact URL'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}/, 'credential material'],
  [/(?:\b[A-Za-z]:[\\/]|file:\/\/)/i, 'local filesystem path'],
  [/(?:localhost|127\.0\.0\.1)(?::\d+)?/i, 'local host'],
  [/github\.com\/feiranzhao15077\/(?:EMvision|LowAlt-MD|EM-Trace|QuadControl-Lab)(?:\/|\b)/i, 'unapproved project repository URL'],
  [/(?:api[_-]?key|access[_-]?token|password|secret)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{12,}/i, 'credential pattern'],
];
function walk(directory) {
  for (const item of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.join(directory, item.name);
    if (item.isDirectory()) walk(relative);
    else if (/\.(?:md|yaml|yml|html|xml|txt|svg|json|js|css)$/i.test(item.name)) {
      const text = fs.readFileSync(path.join(root, relative), 'utf8');
      if (release && scanDist && /\bTBD\b|\.invalid\b|PLACEHOLDER|版本待确认|正式 CV 待版本确定后补入|最终 CV 版本仍待确认/.test(text)) problems.push(`${relative}: unresolved release placeholder`);
      for (const email of text.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) if (email[0] !== approvedEmail) problems.push(`${relative}: unapproved email`);
      for (const [regex, label] of patterns) if (regex.test(text)) problems.push(`${relative}: ${label}`);
    }
  }
}
for (const directory of directories) if (fs.existsSync(path.join(root, directory))) walk(directory);
if (release) {
  const profile = YAML.parse(fs.readFileSync(path.join(root, 'src/content/site/profile.yaml'), 'utf8'));
  const origin = process.env.PUBLIC_SITE_URL || '';
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || !url.hostname.includes('.') || /(?:\.invalid|\.localhost|\.test|\.example)$/.test(url.hostname) || /^(?:localhost|127\.|0\.|192\.168\.|10\.)/.test(url.hostname) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error();
  } catch { problems.push('PUBLIC_SITE_URL requires an approved HTTPS production origin; configure paths with PUBLIC_BASE_PATH'); }
  for (const [key, status] of [['publicName','nameStatus'], ['schoolWording','schoolStatus'], ['publicEmail','emailStatus']]) {
    if (profile[status] !== 'APPROVED' || (typeof profile[key] === 'string' ? profile[key] === 'TBD' : profile[key]?.zh === 'TBD')) problems.push(`${key} remains unapproved`);
  }
  const cv = YAML.parse(fs.readFileSync(path.join(root, 'src/content/materials/cv.yaml'), 'utf8'));
  if (process.env.RELEASE_TARGET === 'initial') {
    if (cv.accessStatus !== 'PENDING' || cv.publicUrl || fs.existsSync(path.join(root, 'public/documents/Zhaofeiran_CV.pdf'))) problems.push('initial release contains a CV asset or link');
  } else if (cv.accessStatus !== 'PUBLIC' || !cv.publicUrl) problems.push('CV is not public and approved');
  if (scanDist) {
    const index = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
    if (/noindex|\.invalid\b/.test(index)) problems.push('dist contains draft indexing metadata');
    if (process.env.RELEASE_TARGET === 'initial' && /documents\/cv\.pdf|版本待确认|CV 版本/.test(index)) problems.push('initial release dist exposes CV or a CV placeholder');
    if (/feiranzhao15077\.github\.io|\/personal-research-website\//i.test(index)) problems.push('dist contains obsolete deployment URL or base path');
    if (!index.includes('https://zhaofeiran.pages.dev/')) problems.push('dist lacks frozen canonical site URL');
    const robots = fs.readFileSync(path.join(root, 'dist/robots.txt'), 'utf8');
    if (!robots.includes('Sitemap: ') || /Disallow: \/(?:\s|$)/.test(robots)) problems.push('production robots configuration is invalid');
  }
}
if (problems.length) { console.error(problems.map((x) => `FAIL ${x}`).join('\n')); process.exit(1); }
console.log(`Public-content scan passed (${scanDist ? 'dist' : 'source'}${release ? ', release mode' : ', draft mode'}).`);
