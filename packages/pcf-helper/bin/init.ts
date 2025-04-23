#!/usr/bin/env node
import * as task from '../tasks/init-pcf';
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

const nameArgument = args.find(a => ['-n', '--name'].includes(a));
if (typeof nameArgument === 'undefined') {
  logger.error('Name argument is required. Use --name to specify the name of the control.');
  process.exit(1);
}

const nameIndex = args.indexOf(nameArgument) + 1;
const name = args.at(nameIndex);
if (typeof name === 'undefined') {
  logger.error('Path argument is required. Use --path to specify the path to solution folder.');
  process.exit(1);
}

let publisherName = '';
const publisherNameArgument = args.find(a => ['-pn', '--publisher-name'].includes(a));
if (typeof publisherNameArgument !== 'undefined') {
  const publisherNameIndex = args.indexOf(publisherNameArgument) + 1;
  publisherName = args.at(publisherNameIndex) ?? '';
}

let publisherPrefix = '';
const publisherPrefixArgument = args.find(a => ['-pp', '--publisher-prefix'].includes(a));
if (typeof publisherPrefixArgument !== 'undefined') {
  const publisherPrefixIndex = args.indexOf(publisherPrefixArgument) + 1;
  publisherPrefix = args.at(publisherPrefixIndex) ?? '';
}

let path = '';
const pathArgument = args.find(a => ['-p', '--path'].includes(a));
if (typeof pathArgument !== 'undefined') {
  const pathIndex = args.indexOf(pathArgument) + 1;
  path = args.at(pathIndex) ?? '';
}

task.runInit(path, name, publisherName, publisherPrefix, verboseArgument !== undefined);
