import { SpawnSyncReturns } from 'child_process';
import util from 'util';
import logger from '@tywalk/color-logger';

var formatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

/**
 * Formats a number of milliseconds into seconds.
 *
 * @param {string} format - The string format to use when formatting the number of seconds.
 * @param {number} ms - The number of milliseconds to be formatted.
 *
 * @returns {string} The formatted number of seconds.
 */
function formatMsToSec(format: string, ms: number): string {
  const seconds = ms / 1000;
  return util.format(format, seconds);
}

/**
 * Formats a Date object into a human-readable string.
 *
 * @param {Date} date - The date object to be formatted.
 *
 * @returns {string} The formatted string.
 */
function formatTime(date: Date): string {
  return formatter.format(date);
}

function handleTaskCompletion(task: SpawnSyncReturns<Buffer<ArrayBufferLike>>, name: string, duration: number, verbose?: boolean) {
  if (task.status === 0) {
    logger.success(`[PCF Helper] ${name} complete!`);
    logger.debug(formatMsToSec(`[PCF Helper] ${formatTime(new Date())} ${name} finished in %is.\n`, duration));
  } else {
    if (task.error) {
      if (task.signal === 'SIGTERM') {
        logger.error(`[PCF Helper] Unable to complete ${name}. A timeout of 5 minutes was reached.`, task.error.message);
      } else {
        logger.error(`[PCF Helper] Unable to complete ${name}:`, task.signal, task.error.message);
      }
      if (verbose) {
        logger.debug('[PCF Helper] Error details:', task.signal, task.error.stack);
      }
    } else {
      logger.error(`[PCF Helper] Unable to complete ${name}: One or more errors ocurred.`);
    }
    logger.debug(formatMsToSec(`[PCF Helper] ${formatTime(new Date())} ${name} finished with errors in %is.\n`, duration));
  }
  return task.status ?? 1;
}

export {
  formatMsToSec,
  formatTime,
  handleTaskCompletion
}