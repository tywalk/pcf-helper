#!/usr/bin/env node
import * as task from '../tasks/init-pcf';
import { version } from '../package.json';
import logger from '@tywalk/color-logger';
import { Command } from 'commander';
import { addProfileOption, resolveProfileOnly } from '../util/argumentUtil';

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
  .option('-t, --template <template>', 'template for the component (field|dataset)')
  .option('-f, --framework <framework>', 'rendering framework for control (none|react)')
  .option('--run-npm-install', 'run npm install after initialization', true);

addProfileOption(program).parse();

const options = program.opts();

if (options.verbose) {
  logger.setDebug(true);
}

logger.log('PCF Helper version', version);

const { profile } = resolveProfileOnly(options.profile);

task.runInit(
  options.path ?? profile?.path ?? '',
  options.name,
  options.publisherName ?? profile?.publisherName ?? '',
  options.publisherPrefix ?? profile?.publisherPrefix ?? '',
  options.template ?? profile?.template ?? 'field',
  options.framework ?? profile?.framework ?? 'react',
  options.runNpmInstall !== false,
  options.verbose || false
);
