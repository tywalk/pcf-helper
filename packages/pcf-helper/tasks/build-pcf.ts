import { spawnSync } from 'child_process';
import { formatTime, handleTaskCompletion } from '../util/performanceUtil';
import logger from '@tywalk/color-logger';

/**
 * Builds the Power Apps component framework project.
 *
 * @param {string} path The path to the project folder containing the pcfproj.json file.
 * @param {boolean} verbose - If true, additional debug information is logged.
 *
 * @returns {number} The exit code of the spawned process.
 */
function runBuild(path: string, verbose: boolean): number {
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting build...\n');
  const tick = performance.now();
  const task = spawnSync('dotnet build', ['--restore', '-c', 'Release', path], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5 // 5 minutes
  });
  
  return handleTaskCompletion(task, 'build', performance.now() - tick, verbose);
}

export { runBuild };