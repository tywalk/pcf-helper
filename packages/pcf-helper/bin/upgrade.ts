#!/usr/bin/env node
import * as task from '../tasks/upgrade-pcf';
import { version } from '../package.json';
import { Command } from 'commander';
import { handleResults, setupExecutionContext } from '../util/commandUtil';
import { addProfileOption, resolveProfileOnly } from '../util/argumentUtil';

const program = new Command();

program
  .name('pcf-helper-upgrade')
  .description('Upgrade PCF controls')
  .version(version, '-v, --version')
  .option('-V, --verbose', 'enable verbose logging')
  .option('-p, --path <path>', 'path to solution folder');

addProfileOption(program).action((options) => {
  const { logger, tick } = setupExecutionContext(options);

  logger.log('PCF Helper version', version);

  const { profile } = resolveProfileOnly(options.profile);
  const resolvedPath: string = options.path ?? profile?.path ?? '';

  if (!resolvedPath) {
    logger.error('Path argument is required. Use --path or set `path` in the active profile.');
    process.exit(1);
  }

  const result = task.runUpgrade(resolvedPath, options.verbose || false);
  handleResults('upgrade', logger, tick, result);
});

program.parse();
