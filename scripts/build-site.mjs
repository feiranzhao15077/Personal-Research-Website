import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const production = process.env.RELEASE_MODE === 'production';
const target = process.env.RELEASE_TARGET === 'initial' ? 'initial' : 'full';
const steps = ['validate:content', 'validate:public', ...(production ? [target === 'initial' ? 'validate:initial' : 'validate:release'] : []), 'build:astro', 'validate:dist'];
for (const script of steps) {
  const result = spawnSync(npm, ['run', script], { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
