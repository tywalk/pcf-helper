const { spawnSync } = require('child_process');
const { formatMsToSec, formatTime } = require('../util/performanceUtil');
const logger = require('@tywalk/color-logger').default;

/**
 * Builds the Power Apps component framework project.
 *
 * @param {string} path The path to the project folder containing the pcfproj.json file.
 *
 * @returns {number} The exit code of the spawned process.
 */
function run(path) {
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting build...\n');
  const tick = performance.now();
  const task = spawnSync('dotnet build', ['--restore', '-c', 'Release', path], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5 // 5 minutes
  });
  const tock = performance.now();

  if (task.status === 0) {
    logger.success('[PCF Helper] Build complete!');
    logger.debug(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Build finished in %is.\n', tock - tick));
  } else {
    if (task.error) {
      if (task.signal === 'SIGTERM') {
        logger.error('[PCF Helper] Unable to complete build. A timeout of 5 minutes was reached.', task.error.message);
      } else {
        logger.error('[PCF Helper] Unable to complete build: ', task.signal, task.error.message);
      }
      logger.debug('[PCF Helper] Error details: ', task.signal, task.error.stack);
    } else {
      logger.error('[PCF Helper] Unable to complete build: One or more errors ocurred.');
    }
    logger.debug(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Build finished with errors in %is.\n', tock - tick));
  }
  return task.status;
}

exports.run = run;