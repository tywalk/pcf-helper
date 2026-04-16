#!/usr/bin/env node
import * as task from '../tasks/session-pcf';
import { version } from '../package.json';
import { Command } from 'commander';
import { handleResults, setupExecutionContext } from '../util/commandUtil';
import { formatMsToSec } from '../util/performanceUtil';

const program = new Command();

const parseWatchRetry = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  throw new Error('watch-retry must be either true or false');
};

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
  .option('-w, --watch', 'start pcf-scripts watch process')
  .option('--watch-retry <enabled>', 'automatically retry watch process on failure (true|false)', parseWatchRetry)
  .action(async (options: task.SessionOptions, command: Command) => {
    const { logger, tick } = setupExecutionContext(options);

    logger.log('PCF Helper version', version);

    const config = task.loadConfig(options.config);

    // Priority: CLI args > config file > environment variables
    const startWatch = options.watch ?? config.startWatch ?? false;
    const watchRetryFlagWasSet = command.getOptionValueSource('watchRetry') === 'cli';
    if (watchRetryFlagWasSet && !startWatch) {
      logger.error('❌ --watch-retry can only be used when --watch is enabled.');
      process.exit(1);
    }
    const watchRetry = options.watchRetry ?? config.watchRetry ?? true;

    await task.runSession(
      options.url ?? config.remoteEnvironmentUrl ?? '',
      options.script ?? config.remoteScriptToIntercept ?? '',
      options.stylesheet ?? config.remoteStylesheetToIntercept ?? '',
      options.bundle ?? config.localBundlePath ?? '',
      options.css ?? config.localCssPath ?? '',
      startWatch,
      watchRetry
    );

    const tock = performance.now();
    logger.log(formatMsToSec('Session started successfully in %is.', tock - tick));
  })
  .parse();
