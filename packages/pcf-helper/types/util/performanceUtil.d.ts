import { SpawnSyncReturns } from 'child_process';
/**
 * Formats a number of milliseconds into seconds.
 *
 * @param {string} format - The string format to use when formatting the number of seconds.
 * @param {number} ms - The number of milliseconds to be formatted.
 *
 * @returns {string} The formatted number of seconds.
 */
declare function formatMsToSec(format: string, ms: number): string;
/**
 * Formats a Date object into a human-readable string.
 *
 * @param {Date} date - The date object to be formatted.
 *
 * @returns {string} The formatted string.
 */
declare function formatTime(date: Date): string;
declare function handleTaskCompletion(task: SpawnSyncReturns<Buffer<ArrayBufferLike>>, name: string, duration: number, verbose?: boolean): number;
export { formatMsToSec, formatTime, handleTaskCompletion };
