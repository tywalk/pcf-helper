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
function pcfExistsInParent(path) {
    let levels = 0;
    while (levels < 3) {
        let pathFiles = fs_1.default.readdirSync(path);
        let atRoot = pathFiles.some(file => (0, path_1.extname)(file).toLowerCase() === '.pcfproj');
        if (atRoot) {
            return path;
        }
        path = (0, path_1.join)(path, '..');
        levels++;
    }
    throw new Error('PCF project not found.');
}
function run(path, name, publisherName, publisherPrefix, verbose) {
    color_logger_1.default.log('[PCF Helper] ' + (0, performanceUtil_1.formatTime)(new Date()) + ' Starting init...\n');
    const tick = performance.now();
    path = path !== null && path !== void 0 ? path : process.cwd();
    let pathFiles = fs_1.default.readdirSync(path);
    let atRoot = pathFiles.some(file => (0, path_1.extname)(file).toLowerCase() === '.pcfproj');
    const cdsPath = atRoot ? (0, path_1.join)(path, 'Solutions', name) : (0, path_1.join)(path, name);
    const initTask = (0, child_process_1.spawnSync)('pac solution init', ['-pn', publisherName, '-pp', publisherPrefix, '-o', cdsPath], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
        timeout: 1000 * 60 * 5, // 5 minutes
    });
    if (initTask.status !== 0) {
        return (0, performanceUtil_1.handleTaskCompletion)(initTask, 'init', performance.now() - tick, verbose);
    }
    if (!atRoot) {
        path = pcfExistsInParent(path);
    }
    const packageTask = (0, child_process_1.spawnSync)('pac solution add-reference', ['-p', path], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
        timeout: 1000 * 60 * 5, // 5 minutes
    });
    return (0, performanceUtil_1.handleTaskCompletion)(packageTask, 'init', performance.now() - tick, verbose);
}
