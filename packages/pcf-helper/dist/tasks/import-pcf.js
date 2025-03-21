"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
const color_logger_1 = __importDefault(require("@tywalk/color-logger"));
const performanceUtil_1 = require("../util/performanceUtil");
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
    var _a;
    color_logger_1.default.log('[PCF Helper] ' + (0, performanceUtil_1.formatTime)(new Date()) + ' Starting import...\n');
    const tick = performance.now();
    if (!env) {
        color_logger_1.default.warn('Path argument not provided. Assuming active auth profile organization.');
    }
    const zipDirPath = (0, path_1.join)(path, '/bin/release');
    // const zipDirPath = join(path, '');
    const zipDirFiles = fs_1.default.readdirSync(zipDirPath);
    const zipFile = (_a = zipDirFiles.find(file => (0, path_1.extname)(file).toLowerCase() === '.zip')) !== null && _a !== void 0 ? _a : '';
    const zipFilePath = (0, path_1.join)(zipDirPath, zipFile);
    const task = (0, child_process_1.spawnSync)('pac solution import', ['-env', env, '-p', zipFilePath, '-pc'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
        timeout: 1000 * 60 * 5, // 5 minutes
    });
    return (0, performanceUtil_1.handleTaskCompletion)(task, 'import', performance.now() - tick, verbose);
}
