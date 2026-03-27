#!/usr/bin/env node
import * as task from '../tasks/upgrade-pcf';
import { version } from '../package.json';
import { Command } from 'commander';
import { handleResults, setupExecutionContext } from '../util/commandUtil';

const program = new Command();

program
  .name('pcf-helper-upgrade')
  .description('Upgrade PCF controls')
  .version(version, '-v, --version')
  .option('-V, --verbose', 'enable verbose logging')
  .requiredOption('-p, --path <path>', 'path to solution folder')
  .action((options) => {
    const { logger, tick } = setupExecutionContext(options);

    logger.log('PCF Helper version', version);

    const result = task.runUpgrade(options.path, options.verbose || false);
    handleResults('upgrade', logger, tick, result);
  })
  .parse();
