#!/usr/bin/env node
import * as task from '../tasks/upgrade-pcf';
import { version } from '../package.json';
import logger from '@tywalk/color-logger';
import { Command } from 'commander';

const program = new Command();

program
  .name('pcf-helper-upgrade')
  .description('Upgrade PCF controls')
  .version(version, '-v, --version')
  .option('-V, --verbose', 'enable verbose logging')
  .requiredOption('-p, --path <path>', 'path to solution folder')
  .parse();

const options = program.opts();

if (options.verbose) {
  logger.setDebug(true);
}

logger.log('PCF Helper version', version);

task.runUpgrade(options.path, options.verbose || false);
