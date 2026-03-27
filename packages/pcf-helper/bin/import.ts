#!/usr/bin/env node
import * as task from '../tasks/import-pcf';
import { version } from '../package.json';
import { Command } from 'commander';
import {
  applyArgumentPreprocessing,
  resolveEnvironment,
  addPathAndEnvironmentOptions
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

    const env = resolveEnvironment(options, hadDeprecatedEnv);

    const result = task.runImport(
      options.path,
      env,
      options.verbose || false,
      options.timeout ? Number(options.timeout) : undefined
    );
    handleResults('import', logger, tick, result);
  })
  .parse();
