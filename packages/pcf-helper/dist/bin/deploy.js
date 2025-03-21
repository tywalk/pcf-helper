#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
const upgradeTask = __importStar(require("../tasks/upgrade-pcf"));
const buildTask = __importStar(require("../tasks/build-pcf"));
const importTask = __importStar(require("../tasks/import-pcf"));
const performanceUtil_1 = require("../util/performanceUtil");
const version = require('../package.json').version;
const color_logger_1 = __importDefault(require("@tywalk/color-logger"));
const [, , ...args] = process.argv;
const commandArgument = (_b = (_a = args.at(0)) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
if (['-v', '--version'].includes(commandArgument)) {
    console.log('v%s', version);
    process.exit(0);
}
const verboseArgument = args.find(a => ['-v', '--verbose'].includes(a));
if (typeof verboseArgument !== 'undefined') {
    color_logger_1.default.setDebug(true);
}
color_logger_1.default.log('PCF Helper version', version);
const pathArgument = args.find(a => ['-p', '--path'].includes(a));
if (typeof pathArgument === 'undefined') {
    color_logger_1.default.error('Path argument is required. Use --path to specify the path to solution folder.');
    process.exit(1);
}
const pathIndex = args.indexOf(pathArgument) + 1;
const path = args.at(pathIndex);
if (typeof path === 'undefined') {
    color_logger_1.default.error('Path argument is required. Use --path to specify the path to solution folder.');
    process.exit(1);
}
const tick = performance.now();
const envArgument = (_c = args.find(a => ['-env', '--environment'].includes(a))) !== null && _c !== void 0 ? _c : '';
let envIndex = args.indexOf(envArgument) + 1;
let env = '';
if (envIndex > 0) {
    env = (_d = args.at(envIndex)) !== null && _d !== void 0 ? _d : '';
}
function executeTasks() {
    const upgradeResult = upgradeTask.run(path, typeof verboseArgument !== 'undefined');
    if (upgradeResult === 1)
        return 1;
    const buildResult = buildTask.run(path, typeof verboseArgument !== 'undefined');
    if (buildResult === 1)
        return 1;
    const importResult = importTask.run(path, env, typeof verboseArgument !== 'undefined');
    if (importResult === 1)
        return 1;
    return 0;
}
var result = 0;
try {
    result = executeTasks();
    if (result === 0) {
        color_logger_1.default.log('Deploy complete!');
    }
}
catch (e) {
    color_logger_1.default.error('One or more tasks failed while deploying: ', (e && e.message) || 'unkown error');
    result = 1;
}
finally {
    const tock = performance.now();
    color_logger_1.default.log((0, performanceUtil_1.formatMsToSec)('Deploy finished in %is.', tock - tick));
}
process.exit(result);
