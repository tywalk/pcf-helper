#!/usr/bin/env node
import * as upgradeTask from '../tasks/upgrade-pcf';
import * as buildTask from '../tasks/build-pcf';
import * as importTask from '../tasks/import-pcf';
import { formatMsToSec } from '../util/performanceUtil';
import { version } from '../package.json';
import logger from '@tywalk/color-logger';
const [, , ...args] = process.argv;

const commandArgument = args.at(0)?.toLowerCase() ?? '';
if (['-v', '--version'].includes(commandArgument)) {
  console.log('v%s', version);
  process.exit(0);
}

const verboseArgument = args.find(a => ['-v', '--verbose'].includes(a));
if (typeof verboseArgument !== 'undefined') {
  logger.setDebug(true);
}

logger.log('PCF Helper version', version);

const pathArgument = args.find(a => ['-p', '--path'].includes(a));
if (typeof pathArgument === 'undefined') {
  logger.error('Path argument is required. Use --path to specify the path to solution folder.');
  process.exit(1);
}

const pathIndex = args.indexOf(pathArgument) + 1;
const path = args.at(pathIndex) as string;
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
  const upgradeResult = upgradeTask.runUpgrade(path, typeof verboseArgument !== 'undefined');
  if (upgradeResult === 1) return 1;
  const buildResult = buildTask.runBuild(path, typeof verboseArgument !== 'undefined');
  if (buildResult === 1) return 1;
  const importResult = importTask.runImport(path, env, typeof verboseArgument !== 'undefined');
  if (importResult === 1) return 1;
  return 0;
}

var result = 0;
try {
  result = executeTasks();
  if (result === 0) {
    logger.log('Deploy complete!');
  }
} catch (e: any) {
  logger.error('One or more tasks failed while deploying: ', (e && e.message) || 'unkown error');
  result = 1;
} finally {
  const tock = performance.now();
  logger.log(formatMsToSec('Deploy finished in %is.', tock - tick));
}

process.exit(result);