#!/usr/bin/env node
import * as task from '../tasks/build-pcf';
import { version } from '../package.json';
import logger from '@tywalk/color-logger';
import { Command } from 'commander';

const program = new Command();

program
  .name('pcf-helper-build')
  .description('Build PCF controls')
  .version(version, '-v, --version')
  .option('-V, --verbose', 'enable verbose logging')
  .option('-t, --timeout <milliseconds>', 'timeout in milliseconds', (value: string) => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      throw new Error('Timeout must be a positive number');
    }
    return value;
  })
  .requiredOption('-p, --path <path>', 'path to solution folder')
  .parse();

const options = program.opts();

if (options.verbose) {
  logger.setDebug(true);
}

logger.log('PCF Helper version', version);

task.runBuild(
  options.path,
  options.verbose || false,
  options.timeout ? Number(options.timeout) : undefined
);
