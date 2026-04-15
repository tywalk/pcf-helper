import { spawnSync } from 'child_process';
import { formatTime, handleTaskCompletion } from '../util/performanceUtil';
import { resolveSpawnCommand } from '../util/commandUtil';
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
  const spawnOpts = {
    cwd: process.cwd(),
    stdio: 'inherit' as const,
    killSignal: 'SIGKILL' as const,
    timeout: 1000 * 60, // 1 min
  };

  const solutionVersionCommand = resolveSpawnCommand('pac', ['solution', 'version', '-s', 'Solution', '-sp', path]);
  const solutionVersionTask = spawnSync(solutionVersionCommand.command, solutionVersionCommand.args, spawnOpts);
  if (solutionVersionTask.status !== 0) {
    return handleTaskCompletion(solutionVersionTask, 'upgrade', performance.now() - tick, verbose);
  }

  const pcfVersionCommand = resolveSpawnCommand('pac', ['pcf', 'version', '-s', 'Manifest']);
  const pcfVersionTask = spawnSync(pcfVersionCommand.command, pcfVersionCommand.args, spawnOpts);
  if (pcfVersionTask.status !== 0) {
    return handleTaskCompletion(pcfVersionTask, 'upgrade', performance.now() - tick, verbose);
  }

  const npmVersionCommand = resolveSpawnCommand('npm', ['version', 'patch', '--no-git-tag-version']);
  const npmVersionTask = spawnSync(npmVersionCommand.command, npmVersionCommand.args, spawnOpts);
  return handleTaskCompletion(npmVersionTask, 'upgrade', performance.now() - tick, verbose);
}

export { runUpgrade }