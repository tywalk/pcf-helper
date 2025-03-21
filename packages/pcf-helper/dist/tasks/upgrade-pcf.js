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
 * Upgrades the Power Apps component framework project.
 *
 * @param {string} path The path to the project folder containing the pcfproj.json file.
 * @param {boolean} verbose - If true, additional debug information is logged.
 *
 * @returns {number} The exit code of the spawned process.
 */
function run(path, verbose) {
    color_logger_1.default.log('[PCF Helper] ' + (0, performanceUtil_1.formatTime)(new Date()) + ' Starting upgrade...\n');
    const tick = performance.now();
    const task = (0, child_process_1.spawnSync)(`pac solution version -s Solution -sp ${path} && pac pcf version -s Manifest && npm version patch --no-git-tag-version`, {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
        timeout: 1000 * 60 // 1 min
    });
    return (0, performanceUtil_1.handleTaskCompletion)(task, 'upgrade', performance.now() - tick, verbose);
}
