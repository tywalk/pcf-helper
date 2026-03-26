#!/usr/bin/env node
import * as task from '../tasks/session-pcf';
import { version } from '../package.json';
import logger from '@tywalk/color-logger';
import { Command } from 'commander';

const program = new Command();

program
  .name('pcf-helper-session')
  .description('Run development session')
  .version(version, '-v, --version')
  .option('-V, --verbose', 'enable verbose logging')
  .option('-u, --url <url>', 'remote environment URL')
  .option('-s, --script <script>', 'remote script to intercept')
  .option('-t, --stylesheet <stylesheet>', 'remote stylesheet to intercept')
  .option('-b, --bundle <path>', 'local bundle path')
  .option('-c, --css <path>', 'local CSS path')
  .option('-f, --config <path>', 'config file path', 'session.config.json')
  .parse();

const options = program.opts();
if (options.verbose) {
  logger.setDebug(true);
  logger.debug('Verbose logging enabled');
}

logger.log('PCF Helper version', version);

const config = task.loadConfig(options.config);

task.runSession(
  config.remoteEnvironmentUrl,
  config.remoteScriptToIntercept,
  config.remoteStylesheetToIntercept,
  config.localBundlePath,
  config.localCssPath
);
