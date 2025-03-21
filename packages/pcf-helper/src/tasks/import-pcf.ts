import { spawnSync } from 'child_process';
import { join, extname } from 'path';
import fs from 'fs';
import logger from '@tywalk/color-logger';
import { formatTime, handleTaskCompletion } from '../util/performanceUtil';

/**
 * Imports a PCF solution into a specified Dataverse environment.
 *
 * @param {string} path - The path to the solution folder containing the build output.
 * @param {string} env - The environment identifier (GUID or URL) where the solution will be imported.
 * @param {boolean} verbose - If true, additional debug information is logged.
 *
 * @returns {number} The exit status of the import process.
 */

function run(path: string, env: string, verbose?: boolean): number {
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting import...\n');
  const tick = performance.now();
  if (!env) {
    logger.warn('Path argument not provided. Assuming active auth profile organization.');
  }

  const zipDirPath = join(path, '/bin/release');
  // const zipDirPath = join(path, '');
  const zipDirFiles = fs.readdirSync(zipDirPath);
  const zipFile = zipDirFiles.find(file => extname(file).toLowerCase() === '.zip') ?? '';
  const zipFilePath = join(zipDirPath, zipFile);

  const task = spawnSync('pac solution import', ['-env', env, '-p', zipFilePath, '-pc'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5, // 5 minutes
  });

  return handleTaskCompletion(task, 'import', performance.now() - tick, verbose);
}

export { run };