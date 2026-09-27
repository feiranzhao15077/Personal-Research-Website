import { spawnSync } from 'node:child_process';
const env = { ...process.env, RELEASE_MODE: 'production', RELEASE_TARGET: 'full' };
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const gate = spawnSync(npm, ['run', 'validate:release'], { env, stdio: 'inherit', shell: process.platform === 'win32' });
if (gate.status !== 0) process.exit(gate.status || 1);
const build = spawnSync(npm, ['run', 'build'], { env, stdio: 'inherit', shell: process.platform === 'win32' });
if (build.status !== 0) process.exit(build.status || 1);
const links = spawnSync(process.execPath, ['scripts/validate-links.mjs', '--external'], { env, stdio: 'inherit' });
process.exit(links.status || (links.error ? 1 : 0));
