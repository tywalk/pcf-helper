#!/usr/bin/env node
import * as task from '../tasks/init-pcf';
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

const name = getArgValue(args, ['-n', '--name']);
if (typeof name === 'undefined') {
  logger.error('Name argument is required. Use --name to specify the name of the PCF control.');
  process.exit(1);
}

const publisherName = getArgValue(args, ['-pn', '--publisher-name']) ?? '';
const publisherPrefix = getArgValue(args, ['-pp', '--publisher-prefix']) ?? '';
const path = getArgValue(args, ['-p', '--path']) ?? '';
const npm = getArgValue(args, ['-npm', '--run-npm-install'], 'true');

task.runInit(path, name, publisherName, publisherPrefix, npm === 'true', verboseArgument !== undefined);
