#!/usr/bin/env node
import * as task from '../tasks/import-pcf';
import { version } from '../package.json';
import logger from '@tywalk/color-logger';
import { getArgValue } from '../util/argumentUtil';
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

const path = getArgValue(args, ['-p', '--path']);
if (typeof path === 'undefined') {
  logger.error('Path argument is required. Use --path to specify the path to solution folder.');
  process.exit(1);
}

const env = getArgValue(args, ['-env', '--environment']) ?? '';

task.runImport(path, env);
