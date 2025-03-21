"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMsToSec = formatMsToSec;
exports.formatTime = formatTime;
exports.handleTaskCompletion = handleTaskCompletion;
const util_1 = __importDefault(require("util"));
const color_logger_1 = __importDefault(require("@tywalk/color-logger"));
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
function formatMsToSec(format, ms) {
    const seconds = ms / 1000;
    return util_1.default.format(format, seconds);
}
/**
 * Formats a Date object into a human-readable string.
 *
 * @param {Date} date - The date object to be formatted.
 *
 * @returns {string} The formatted string.
 */
function formatTime(date) {
    return formatter.format(date);
}
function handleTaskCompletion(task, name, duration, verbose) {
    var _a;
    if (task.status === 0) {
        color_logger_1.default.success(`[PCF Helper] ${name} complete!`);
        color_logger_1.default.debug(formatMsToSec(`[PCF Helper] ${formatTime(new Date())} ${name} finished in %is.\n`, duration));
    }
    else {
        if (task.error) {
            if (task.signal === 'SIGTERM') {
                color_logger_1.default.error(`[PCF Helper] Unable to complete ${name}. A timeout of 5 minutes was reached.`, task.error.message);
            }
            else {
                color_logger_1.default.error(`[PCF Helper] Unable to complete ${name}:`, task.signal, task.error.message);
            }
            if (verbose) {
                color_logger_1.default.debug('[PCF Helper] Error details:', task.signal, task.error.stack);
            }
        }
        else {
            color_logger_1.default.error(`[PCF Helper] Unable to complete ${name}: One or more errors ocurred.`);
        }
        color_logger_1.default.debug(formatMsToSec(`[PCF Helper] ${formatTime(new Date())} ${name} finished with errors in %is.\n`, duration));
    }
    return (_a = task.status) !== null && _a !== void 0 ? _a : 1;
}
