#!/usr/bin/env node
const upgradeTask = require('@tywalk/pcf-helper/tasks/upgrade-pcf');
const buildTask = require('@tywalk/pcf-helper/tasks/build-pcf');
const importTask = require('@tywalk/pcf-helper/tasks/import-pcf');
const version = require('./package.json').version;
const { formatMsToSec } = require('./util/performanceUtil');
const [, , ...args] = process.argv;

const commandArgument = args.at(0)?.toLowerCase();
if (['-v', '--version'].includes(commandArgument)) {
  console.log('v%s', version);
  return;
}

console.log('PCF Helper Run version\n', version);

if (typeof commandArgument === 'undefined' || !['upgrade', 'build', 'import', 'deploy'].includes(commandArgument)) {
  console.error('Command [command] (upgrade, build, import, deploy) is required.');
  return 1;
}
const runAll = commandArgument === 'deploy';

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
  return 0;
}

var result = 0;
try {
  result = executeTasks();
  if (result === 0) {
    console.log('[PCF Helper Run] ' + commandArgument + ' complete!');
  }
} catch (e) {
  console.error('[PCF Helper Run] One or more tasks failed while deploying: ', (e && e.message) || 'unkown error');
  result = 1;
} finally {
  const tock = performance.now();
  console.log(formatMsToSec('[PCF Helper Run] ' + commandArgument + ' finished in %is.', tock - tick));
}

return result;
