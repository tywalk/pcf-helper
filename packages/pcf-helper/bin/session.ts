#!/usr/bin/env node
import * as task from '../tasks/session-pcf';
import { version } from '../package.json';
import logger from '@tywalk/color-logger';
import { Command } from 'commander';

const program = new Command();

program
  .option('-v, --version', 'output the version number')
  .option('-vv, --verbose', 'enable verbose logging')
  .parse();

const options = program.opts();

if (options.version) {
  console.log('v%s', version);
  process.exit(0);
}

if (options.verbose) {
  logger.setLevel('debug');
  logger.debug('Verbose logging enabled');
}

logger.log('PCF Helper version', version);

const config = task.loadConfig();

task.runSession(
  config.remoteEnvironmentUrl,
  config.remoteScriptToIntercept,
  config.remoteStylesheetToIntercept,
  config.localBundlePath,
  config.localCssPath
);
