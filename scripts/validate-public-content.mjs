import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = path.resolve(import.meta.dirname, '..');
const release = process.env.RELEASE_MODE === 'production';
const scanDist = process.argv.includes('--dist');
const directories = scanDist ? ['dist'] : ['src/content', 'src/data', 'public'];
const problems = [];
const patterns = [
  [/(?:[A-Za-z]:\\(?:Users|Documents|Desktop|不如自成宇宙)|file:\/\/)/i, 'local filesystem path'],
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
      for (const [regex, label] of patterns) if (regex.test(text)) problems.push(`${relative}: ${label}`);
    }
  }
}
for (const directory of directories) if (fs.existsSync(path.join(root, directory))) walk(directory);
if (release) {
  const profile = YAML.parse(fs.readFileSync(path.join(root, 'src/content/site/profile.yaml'), 'utf8'));
  const origin = process.env.PUBLIC_SITE_URL || '';
  if (!/^https:\/\/[^/]+\.[^/]+/.test(origin) || origin.endsWith('.invalid')) problems.push('PUBLIC_SITE_URL requires an approved production origin');
  for (const [key, status] of [['publicName','nameStatus'], ['schoolWording','schoolStatus'], ['publicEmail','emailStatus']]) {
    if (profile[status] !== 'APPROVED' || (typeof profile[key] === 'string' ? profile[key] === 'TBD' : profile[key]?.zh === 'TBD')) problems.push(`${key} remains unapproved`);
  }
  const cv = YAML.parse(fs.readFileSync(path.join(root, 'src/content/materials/cv.yaml'), 'utf8'));
  if (cv.accessStatus !== 'PUBLIC' || !cv.publicUrl) problems.push('CV is not public and approved');
  if (scanDist) {
    const index = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
    if (/noindex|\.invalid/.test(index)) problems.push('dist contains draft indexing metadata');
  }
}
if (problems.length) { console.error(problems.map((x) => `FAIL ${x}`).join('\n')); process.exit(1); }
console.log(`Public-content scan passed (${scanDist ? 'dist' : 'source'}${release ? ', release mode' : ', draft mode'}).`);
