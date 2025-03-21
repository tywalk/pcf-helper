"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const child_process_1 = require("child_process");
const performanceUtil_1 = require("../util/performanceUtil");
const color_logger_1 = __importDefault(require("@tywalk/color-logger"));
/**
 * Builds the Power Apps component framework project.
 *
 * @param {string} path The path to the project folder containing the pcfproj.json file.
 * @param {boolean} verbose - If true, additional debug information is logged.
 *
 * @returns {number} The exit code of the spawned process.
 */
function run(path, verbose) {
    color_logger_1.default.log('[PCF Helper] ' + (0, performanceUtil_1.formatTime)(new Date()) + ' Starting build...\n');
    const tick = performance.now();
    const task = (0, child_process_1.spawnSync)('dotnet build', ['--restore', '-c', 'Release', path], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
        timeout: 1000 * 60 * 5 // 5 minutes
    });
    return (0, performanceUtil_1.handleTaskCompletion)(task, 'build', performance.now() - tick, verbose);
}
