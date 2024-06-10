#!/usr/bin/env node
const task  = require('../tasks/build-pcf');
const version = require('../package.json').version;
const [, , ...args] = process.argv;

console.log('PCF Helper version', version);

const pathArgument = args.find(a => ['-p', '--path'].includes(a));
if (typeof pathArgument === 'undefined') {
  console.error('Path argument is required. Use --path to specify the path to solution folder.');
  return 0;
}

const pathIndex = args.indexOf(pathArgument) + 1;
const path = args.at(pathIndex);
if (typeof path === 'undefined') {
  console.error('Path argument is required. Use --path to specify the path to solution folder.');
  return 0;
}

task.run(path);
