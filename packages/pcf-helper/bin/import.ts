#!/usr/bin/env node
import * as task from '../tasks/import-pcf';
import { version } from '../package.json';
import { Command } from 'commander';
import {
  applyArgumentPreprocessing,
  addPathAndEnvironmentOptions,
  resolvePathAndEnvironment,
} from '../util/argumentUtil';
import { handleResults, setupExecutionContext } from '../util/commandUtil';

// Apply argument preprocessing for backward compatibility
const { hadDeprecatedEnv } = applyArgumentPreprocessing(process.argv);

const program = new Command();

addPathAndEnvironmentOptions(program)
  .name('pcf-helper-import')
  .description('Import PCF controls to Dataverse')
  .version(version, '-v, --version')
  .action((options) => {

    const { logger, tick } = setupExecutionContext(options);

    logger.log('PCF Helper version', version);

    const { path, environment } = resolvePathAndEnvironment(options, hadDeprecatedEnv);

    if (!path) {
      logger.error('Path argument is required. Use --path or set `path` in the active profile.');
      process.exit(1);
    }

    const result = task.runImport(
      path,
      environment,
      options.verbose || false,
      options.timeout ? Number(options.timeout) : undefined
    );
    handleResults('import', logger, tick, result);
  })
  .parse();
