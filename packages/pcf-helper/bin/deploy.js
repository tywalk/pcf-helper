#!/usr/bin/env node
const upgradeTask = require('../tasks/upgrade-pcf');
const buildTask = require('../tasks/build-pcf');
const importTask = require('../tasks/import-pcf');
const { formatMsToSec } = require('../util/performanceUtil');
const version = require('../package.json').version;
const [, , ...args] = process.argv;

console.log('PCF Helper version', version);

const pathArgument = args.find(a => ['-p', '--path'].includes(a));
if (typeof pathArgument === 'undefined') {
  console.error('Path argument is required. Use --path to specify the path to solution folder.');
  return 1;
}

const pathIndex = args.indexOf(pathArgument) + 1;
const path = args.at(pathIndex);
if (typeof path === 'undefined') {
  console.error('Path argument is required. Use --path to specify the path to solution folder.');
  return 1;
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
    console.log('Deploy complete!');
  }
} catch (e) {
  console.error('One or more tasks failed while deploying: ', (e && e.message) || 'unkown error');
  result = 1;
} finally {
  const tock = performance.now();
  console.log(formatMsToSec('Deploy finished in %is.', tock - tick));
}

return result;