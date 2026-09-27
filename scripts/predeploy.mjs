import { spawnSync } from 'node:child_process';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const steps = [
  ['typecheck'], ['validate:content'], ['validate:public'], ['validate:release'], ['build'], ['test'], ['validate:links']
];
for (const [script] of steps) {
  console.log(`PREFLIGHT STEP: ${script}`);
  const env = ['build', 'test'].includes(script) ? { ...process.env, RELEASE_MODE: 'production' } : process.env;
  const result = spawnSync(npm, ['run', script], { env, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
console.log('PREDEPLOY PASS — local production artifact ready for review; no deployment performed.');
