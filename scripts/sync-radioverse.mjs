import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const siteRoot = path.resolve(import.meta.dirname, '..');
const sourceRoot = path.resolve(process.env.RADIOVERSE_SOURCE || path.join(siteRoot, '..', 'RadioVerse'));
const packageFile = path.join(sourceRoot, 'package.json');
const publicRoot = path.resolve(siteRoot, 'public');
const destination = path.resolve(publicRoot, 'radioverse');

if (!fs.existsSync(packageFile)) {
  if (!process.env.RADIOVERSE_SOURCE && fs.existsSync(path.join(destination, 'index.html'))) {
    console.log('RadioVerse: using the bundled static build.');
    process.exit(0);
  }
  throw new Error('RadioVerse source not found. Set RADIOVERSE_SOURCE to its project directory.');
}
if (JSON.parse(fs.readFileSync(packageFile, 'utf8')).name !== 'radioverse') {
  throw new Error('RADIOVERSE_SOURCE must point to the RadioVerse project.');
}

const base = process.env.PUBLIC_BASE_PATH || '/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('Invalid PUBLIC_BASE_PATH.');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npm, ['run', 'build'], {
  cwd: sourceRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, VITE_RESEARCH_HOME: `${base}#about` },
});
if (result.error || result.status !== 0) process.exit(result.status || 1);

const output = path.join(sourceRoot, 'dist');
if (!fs.existsSync(path.join(output, 'index.html'))) throw new Error('RadioVerse build has no index.html.');
// Only replace this module's generated public directory, after a successful build.
if (path.dirname(destination) !== publicRoot || path.basename(destination) !== 'radioverse') {
  throw new Error('Unsafe RadioVerse destination.');
}
fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(output, destination, { recursive: true });
console.log('RadioVerse: static app, local fonts and Worker copied to public/radioverse/.');
