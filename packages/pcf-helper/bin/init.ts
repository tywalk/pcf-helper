#!/usr/bin/env node
import * as task from '../tasks/init-pcf';
import { version } from '../package.json';
import logger from '@tywalk/color-logger';
import { Command } from 'commander';

const program = new Command();

program
  .name('pcf-helper-init')
  .description('Initialize a new PCF project')
  .version(version, '-v, --version')
  .option('-V, --verbose', 'enable verbose logging')
  .requiredOption('-n, --name <name>', 'name of the PCF control')
  .option('--publisher-name <publisherName>', 'publisher name')
  .option('--publisher-prefix <publisherPrefix>', 'publisher prefix')
  .option('-p, --path <path>', 'path to create the PCF project')
  .option('-t, --template <template>', 'template for the component (field|dataset)', 'field')
  .option('-f, --framework <framework>', 'rendering framework for control (none|react)', 'react')
  .option('--run-npm-install', 'run npm install after initialization', true)
  .parse();

const options = program.opts();

if (options.verbose) {
  logger.setDebug(true);
}

logger.log('PCF Helper version', version);

task.runInit(
  options.path || '',
  options.name,
  options.publisherName || '',
  options.publisherPrefix || '',
  options.template || 'field',
  options.framework || 'react',
  options.runNpmInstall !== false,
  options.verbose || false
);
