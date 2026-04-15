import util from 'util';

const formatter = new Intl.DateTimeFormat('en-US', {
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
  const seconds = (ms / 1000).toFixed(1);
  // %i truncates floats in util.format, so normalize to %f to preserve precision.
  const normalizedFormat = format.replace(/%i/g, '%f');
  return util.format(normalizedFormat, seconds);
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

export {
  formatMsToSec,
  formatTime
}