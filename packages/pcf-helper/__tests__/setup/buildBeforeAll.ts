import { spawnSync } from 'child_process';

export function buildBeforeAll(): void {
  const npmExecPath = process.env.npm_execpath;
  if (!npmExecPath) {
    throw new Error('Unable to locate npm executable path from npm_execpath.');
  }

  const build = spawnSync(process.execPath, [npmExecPath, 'run', 'build'], {
    cwd: process.cwd(),
    encoding: 'utf-8'
  });

  if (build.status !== 0) {
    throw new Error(`Failed to build pcf-helper before CLI tests.\n${build.error?.message || build.stderr || build.stdout}`);
  }
}
