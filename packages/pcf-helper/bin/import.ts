#!/usr/bin/env node
import * as task from '../tasks/import-pcf';
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
const path = args.at(pathIndex);
if (typeof path === 'undefined') {
  logger.error('Path argument is required. Use --path to specify the path to solution folder.');
  process.exit(1);
}

const envArgument = args.find(a => ['-env', '--environment'].includes(a)) ?? '';
let envIndex = args.indexOf(envArgument) + 1;
let env = '';
if (envIndex > 0) {
  env = args.at(envIndex) ?? '';
}

task.runImport(path, env);
