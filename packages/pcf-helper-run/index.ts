#!/usr/bin/env node
import * as tasks from '@tywalk/pcf-helper';
import { Logger } from '@tywalk/color-logger';
import { version } from './package.json';
import { formatMsToSec, formatTime } from './util/performanceUtil';
import { getArgValue } from './util/argumentUtil';
const [, , ...args] = process.argv;

const commandArgument = args.at(0)?.toLowerCase() ?? '';
if (['-v', '--version'].includes(commandArgument)) {
  console.log('v%s', version);
  process.exit(0);
}

const logger = new Logger('log');

const verboseArgument = args.find(a => ['-v', '--verbose'].includes(a));
const isVerbose = verboseArgument !== undefined;
if (isVerbose) {
  logger.setDebug(true);
}

logger.log('PCF Helper Run version\n', version);

if (typeof commandArgument === 'undefined' || !['upgrade', 'build', 'import', 'deploy', 'init'].includes(commandArgument)) {
  logger.error('Command [command] (upgrade, build, import, deploy, init) is required.');
  process.exit(1);
}
const runAll = commandArgument === 'deploy';
const runInit = commandArgument === 'init';

const path = getArgValue(args, ['-p', '--path']);
if (typeof path === 'undefined') {
  if (runInit) {
    logger.error('Path argument is required. Use --path to specify the PCF folder.');
  } else {
    logger.error('Path argument is required. Use --path to specify the path to solution folder.');
  }
  process.exit(1);
}

const tick = performance.now();

const env = getArgValue(args, ['-env', '--environment']) ?? '';
if (env === '' && !runInit) {
  logger.warn('No environment specified. Defaulting to "local".');
}

function executeTasks() {
  if (commandArgument === 'upgrade' || runAll) {
    const upgradeResult = tasks.runUpgrade(path as string, isVerbose);
    if (upgradeResult === 1) return 1;
  }
  if (commandArgument === 'build' || runAll) {
    const buildResult = tasks.runBuild(path as string, isVerbose);
    if (buildResult === 1) return 1;
  }
  if (commandArgument === 'import' || runAll) {
    const importResult = tasks.runImport(path as string, env as string, isVerbose);
    if (importResult === 1) return 1;
  }
  if (commandArgument === 'init') {
    const name = getArgValue(args, ['-n', '--name']);
    const publisherName = getArgValue(args, ['-pn', '--publisher-name']);
    const publisherPrefix = getArgValue(args, ['-pp', '--publisher-prefix']);
    if (typeof name === 'undefined') {
      logger.error('Name argument is required. Use --name to specify the name of the control.');
      process.exit(1);
    }
    if (typeof publisherName === 'undefined') {
      logger.error('Publisher Name argument is required. Use --publisher-name to specify the name of the control.');
      process.exit(1);
    }
    if (typeof publisherPrefix === 'undefined') {
      logger.error('Publisher Prefix argument is required. Use --publisher-prefix to specify the name of the control.');
      process.exit(1);
    }
    const initResult = tasks.runInit(path as string, name, publisherName, publisherPrefix, isVerbose);
    if (initResult === 1) return 1;
  }
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
