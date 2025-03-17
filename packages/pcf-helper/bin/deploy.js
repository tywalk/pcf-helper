#!/usr/bin/env node
const upgradeTask = require('../tasks/upgrade-pcf');
const buildTask = require('../tasks/build-pcf');
const importTask = require('../tasks/import-pcf');
const { formatMsToSec } = require('../util/performanceUtil');
const version = require('../package.json').version;
const logger = require('@tywalk/color-logger').default;
const [, , ...args] = process.argv;

const commandArgument = args.at(0)?.toLowerCase();
if (['-v', '--version'].includes(commandArgument)) {
  console.log('v%s', version);
  return;
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
const path = args.at(pathIndex);
if (typeof path === 'undefined') {
  logger.error('Path argument is required. Use --path to specify the path to solution folder.');
  process.exit(1);
}

const tick = performance.now();

const envArgument = args.find(a => ['-env', '--environment'].includes(a));
let envIndex = args.indexOf(envArgument) + 1;
let env = '';
if (envIndex > 0) {
  env = args.at(envIndex);
}

function executeTasks() {
  const upgradeResult = upgradeTask.run(path);
  if (upgradeResult === 1) return 1;
  const buildResult = buildTask.run(path);
  if (buildResult === 1) return 1;
  const importResult = importTask.run(path, env);
  if (importResult === 1) return 1;
  return 0;
}

var result = 0;
try {
  result = executeTasks();
  if (result === 0) {
    logger.log('Deploy complete!');
  }
} catch (e) {
  logger.error('One or more tasks failed while deploying: ', (e && e.message) || 'unkown error');
  result = 1;
} finally {
  const tock = performance.now();
  logger.log(formatMsToSec('Deploy finished in %is.', tock - tick));
}

return result;