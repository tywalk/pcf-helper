#!/usr/bin/env node
import * as task from '../tasks/session-pcf';
import { version } from '../package.json';
import { Command } from 'commander';
import { handleResults, setupExecutionContext } from '../util/commandUtil';

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
  .option('-w, --watch', 'start pcf-scripts watch process')
  .parse()
  .action((options: task.SessionOptions) => {
    const { logger, tick } = setupExecutionContext(options);

    logger.log('PCF Helper version', version);

    const config = task.loadConfig(options.config);

    // Priority: CLI args > config file > environment variables
    const startWatch = options.watch ?? config.startWatch ?? false;

    task.runSession(
      options.url ?? config.remoteEnvironmentUrl,
      options.script ?? config.remoteScriptToIntercept,
      options.stylesheet ?? config.remoteStylesheetToIntercept,
      options.bundle ?? config.localBundlePath,
      options.css ?? config.localCssPath,
      startWatch
    );

    handleResults('session', logger, tick, 0);
  });
