import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import YAML from 'yaml';

const root = path.resolve(import.meta.dirname, '..');
const read = (name) => YAML.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const profile = read('src/content/site/profile.yaml');
const cv = read('src/content/materials/cv.yaml');
const errors = [];
const block = (code, message) => errors.push(`RELEASE BLOCKER: ${code} — ${message}`);
const target = process.argv.includes('--full') ? 'full' : process.argv.includes('--initial') || process.env.RELEASE_TARGET === 'initial' ? 'initial' : 'full';

if (profile.publicName?.zh !== '赵斐然' || profile.nameStatus !== 'APPROVED' ||
    profile.schoolWording?.zh !== '西安邮电大学理学院应用物理学' || profile.schoolStatus !== 'APPROVED' ||
    profile.publicEmail !== 'zhaofeiran0724@outlook.com' || profile.emailStatus !== 'APPROVED') {
  block('IDENTITY_UNAPPROVED', '公开姓名、学校或邮箱与已批准值不一致');
}

const origin = process.env.PUBLIC_SITE_URL || '';
try {
  const url = new URL(origin);
  if (url.protocol !== 'https:' || !url.hostname.includes('.') || /(?:\.invalid|\.localhost|\.test|\.example)$|^example\.(?:com|org|net)$/.test(url.hostname) ||
      /^(?:localhost|127\.|0\.|192\.168\.|10\.)/.test(url.hostname) || url.pathname !== '/' ||
      url.search || url.hash || url.username || url.password) throw new Error('invalid origin');
} catch { block('PUBLIC_URL_MISSING', 'PUBLIC_SITE_URL 必须是获批准的 HTTPS origin，不能包含路径或本地地址'); }

const base = process.env.PUBLIC_BASE_PATH || '/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) block('BASE_PATH_INVALID', 'PUBLIC_BASE_PATH 必须为 / 或 /repository-name/');
if (origin.replace(/\/$/, '') !== 'https://zhaofeiran.pages.dev' || base !== '/') block('SITE_IDENTITY_MISMATCH', '正式站点仅允许 https://zhaofeiran.pages.dev/ 且 base=/');
const cvPath = path.join(root, 'public/documents/cv.pdf');
if (target === 'initial') {
  if (cv.accessStatus !== 'PENDING' || cv.publicUrl || fs.existsSync(cvPath)) block('INITIAL_CV_EXPOSED', '初版不得包含 CV 链接或 PDF');
} else {
  if (cv.accessStatus !== 'PUBLIC' || cv.publicUrl !== '/documents/cv.pdf' || cv.type !== 'CV' || cv.id !== profile.cvMaterialId) {
    block('FINAL_CV_MISSING', 'cv.yaml 尚未指向已批准的 /documents/cv.pdf');
  }
  if (cv.approvalStatus !== 'APPROVED') block('FINAL_CV_UNAPPROVED', '最终 CV 尚未得到本人批准');
  if (!fs.existsSync(cvPath)) block('FINAL_CV_MISSING', 'public/documents/cv.pdf 不存在');
  else {
    const buffer = fs.readFileSync(cvPath);
    const hash = createHash('sha256').update(buffer).digest('hex');
    if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-')) || !cv.sourceHash || cv.sourceHash !== hash ||
        !cv.sourceSize || cv.sourceSize !== buffer.length) block('FINAL_CV_UNVERIFIED', '最终 CV 的 PDF 签名、大小或 SHA-256 与 cv.yaml 不符');
  }
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`${target === 'initial' ? 'INITIAL_SITE_RELEASE' : 'FULL_RELEASE'} gate passed: approved identity and site URL${target === 'initial' ? '; CV omitted' : '; verified final CV'}.`);
