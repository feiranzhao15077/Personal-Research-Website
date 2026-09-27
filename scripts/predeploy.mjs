import { spawnSync } from 'node:child_process';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const initial = process.argv.includes('--initial');
const target = initial ? 'initial' : 'full';
const steps = [
  'typecheck', 'validate:content', 'validate:public', initial ? 'validate:initial' : 'validate:release', 'build', 'test', 'test:browser', 'validate:links', 'validate:external'
];
for (const script of steps) {
  console.log(`PREFLIGHT STEP: ${script}`);
  const env = { ...process.env, RELEASE_TARGET: target, ...(['build', 'test', 'test:browser'].includes(script) ? { RELEASE_MODE: 'production' } : {}) };
  const result = spawnSync(npm, ['run', script], { env, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
console.log('PREDEPLOY PASS — local production artifact ready for review; no deployment performed.');
