const { spawnSync } = require('child_process');
const { formatMsToSec, formatTime } = require('../util/performanceUtil');
const logger = require('@tywalk/color-logger').default;

/**
 * Upgrades the Power Apps component framework project.
 *
 * @param {string} path The path to the project folder containing the pcfproj.json file.
 *
 * @returns {number} The exit code of the spawned process.
 */
function run(path) {
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting upgrade...\n');
  const tick = performance.now();
  const task = spawnSync(`pac solution version -s Solution -sp ${path} && pac pcf version -s Manifest && npm version patch --no-git-tag-version`, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 // 1 min
  });
  const tock = performance.now();

  if (task.status === 0) {
    logger.log('[PCF Helper] Upgrade complete!');
    logger.log(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Upgrade finished in %is.\n', tock - tick));
  } else {
    if (task.error) {
      if (task.signal === 'SIGTERM') {
        logger.error('[PCF Helper] Unable to complete upgrade. A timeout of 1 minutes was reached.', task.error.message);
      } else {
        logger.error('[PCF Helper] Unable to complete upgrade:', task.signal, task.error.message);
      }
      logger.debug('[PCF Helper] Error details:', task.signal, task.error.stack);
    } else {
      logger.error('[PCF Helper] Unable to complete upgrade: One or more errors ocurred.');
    }
    logger.log(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Upgrade finished with errors in %is.\n', tock - tick));
  }
  return task.status;
}

exports.run = run;