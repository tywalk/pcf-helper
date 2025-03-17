const { spawnSync } = require('child_process');
const { join, extname } = require('path');
const fs = require('fs');
const logger = require('@tywalk/color-logger').default;
const { formatMsToSec, formatTime } = require('../util/performanceUtil');

/**
 * Imports a PCF solution into a specified Dataverse environment.
 *
 * @param {string} path - The path to the solution folder containing the build output.
 * @param {string} env - The environment identifier (GUID or URL) where the solution will be imported.
 * @param {boolean} verbose - If true, additional debug information is logged.
 *
 * @returns {number} The exit status of the import process.
 */

function run(path, env, verbose) {
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting import...\n');
  const tick = performance.now();
  if (!env) {
    logger.warn('Path argument not provided. Assuming active auth profile organization.');
  }

  const zipDirPath = join(path, '/bin/release');
  // const zipDirPath = join(path, '');
  const zipDirFiles = fs.readdirSync(zipDirPath);
  const zipFile = zipDirFiles.find(file => extname(file).toLowerCase() === '.zip');
  const zipFilePath = join(zipDirPath, zipFile);

  const task = spawnSync('pac solution import', ['-env', env, '-p', zipFilePath, '-pc'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5, // 5 minutes
  });
  const tock = performance.now();

  if (task.status === 0) {
    logger.success('[PCF Helper] Import complete!');
    logger.debug(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Import finished in %is.\n', tock - tick));
  } else {
    if (task.error) {
      if (task.signal === 'SIGTERM') {
        logger.error('[PCF Helper] Unable to complete import. A timeout of 5 minutes was reached.', task.error.message);
      } else {
        logger.error('[PCF Helper] Unable to complete import:', task.signal, task.error.message);
      }
      if (verbose) {
        logger.debug('[PCF Helper] Error details:', task.signal, task.error.stack);
      }
    } else {
      logger.error('[PCF Helper] Unable to complete import: One or more errors ocurred.');
    }
    logger.debug(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Import finished with errors in %is.\n', tock - tick));
  }
  return task.status;
}

exports.run = run;