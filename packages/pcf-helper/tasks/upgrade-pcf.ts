import { spawnSync } from 'child_process';
import { formatTime, handleTaskCompletion } from '../util/performanceUtil';
import logger from '@tywalk/color-logger';

/**
 * Upgrades the Power Apps component framework project.
 *
 * @param {string} path The path to the project folder containing the pcfproj.json file.
 * @param {boolean} verbose - If true, additional debug information is logged.
 *
 * @returns {number} The exit code of the spawned process.
 */
function runUpgrade(path: string, verbose?: boolean): number {
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting upgrade...\n');
  const tick = performance.now();
  const task = spawnSync(`pac solution version -s Solution -sp ${path} && pac pcf version -s Manifest && npm version patch --no-git-tag-version`, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 // 1 min
  });

  return handleTaskCompletion(task, 'upgrade', performance.now() - tick, verbose);
}

export { runUpgrade }