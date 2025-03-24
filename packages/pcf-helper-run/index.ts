#!/usr/bin/env node
import upgradeTask from '@tywalk/pcf-helper/tasks/upgrade-pcf';
import buildTask from '@tywalk/pcf-helper/tasks/build-pcf';
import importTask from '@tywalk/pcf-helper/tasks/import-pcf';
// import initTask from '@tywalk/pcf-helper/tasks/init-pcf';
import { Logger } from '@tywalk/color-logger';
const version = require('./package.json').version;
import { formatMsToSec, formatTime } from './util/performanceUtil';
const [, , ...args] = process.argv;

const commandArgument = args.at(0)?.toLowerCase() ?? '';
if (['-v', '--version'].includes(commandArgument)) {
  console.log('v%s', version);
  process.exit(0);
}

const logger = new Logger('log');

const verboseArgument = args.find(a => ['-v', '--verbose'].includes(a));
if (typeof verboseArgument !== 'undefined') {
  logger.setDebug(true);
}

logger.log('PCF Helper Run version\n', version);

if (typeof commandArgument === 'undefined' || !['upgrade', 'build', 'import', 'deploy', 'init'].includes(commandArgument)) {
  logger.error('Command [command] (upgrade, build, import, deploy) is required.');
  process.exit(1);
}
const runAll = commandArgument === 'deploy';

const pathArgument = args.find(a => ['-p', '--path'].includes(a));
if (typeof pathArgument === 'undefined') {
  logger.error('Path argument is required. Use --path to specify the path to solution folder.');
  process.exit(1);
}

const pathIndex = args.indexOf(pathArgument) + 1;
const path = args.at(pathIndex);
if (typeof path === 'undefined') {
  logger.error('Path argument is required. Use --path to specify the path to solution folder.');
  process.exit(1);
}

const tick = performance.now();

const envArgument = args.find(a => ['-env', '--environment'].includes(a)) ?? '';
let envIndex = args.indexOf(envArgument) + 1;
let env = '';
if (envIndex > 0) {
  env = args.at(envIndex) ?? '';
}

function executeTasks() {
  if (commandArgument === 'upgrade' || runAll) {
    const upgradeResult = upgradeTask.run(path);
    if (upgradeResult === 1) return 1;
  }
  if (commandArgument === 'build' || runAll) {
    const buildResult = buildTask.run(path);
    if (buildResult === 1) return 1;
  }
  if (commandArgument === 'import' || runAll) {
    const importResult = importTask.run(path, env);
    if (importResult === 1) return 1;
  }
  // if (commandArgument === 'init') {
  //   const importResult = initTask.run(path, env);
  //   if (importResult === 1) return 1;
  // }
  return 0;
}

var result = 0;
try {
  logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' ' + commandArgument + ' started.\n');
  result = executeTasks();
  if (result === 0) {
    logger.log('[PCF Helper Run] ' + commandArgument + ' completed successfully!');
  } else {
    logger.log('[PCF Helper Run] ' + commandArgument + ' completed with errors.');
  }
} catch (e: any) {
  logger.error('[PCF Helper Run] One or more tasks failed while deploying: ', (e && e.message) || 'unkown error');
  result = 1;
} finally {
  const tock = performance.now();
  logger.log(formatMsToSec('[PCF Helper Run] ' + formatTime(new Date()) + ' ' + commandArgument + ' finished in %is.', tock - tick));
}

process.exit(result);
