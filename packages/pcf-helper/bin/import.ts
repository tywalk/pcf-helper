#!/usr/bin/env node
import * as task from '../tasks/import-pcf';
import { version } from '../package.json';
import logger from '@tywalk/color-logger';
import { Command } from 'commander';
import { 
  applyArgumentPreprocessing, 
  resolveEnvironment, 
  addPathAndEnvironmentOptions,
  setupLogging 
} from '../util/argumentUtil';

// Apply argument preprocessing for backward compatibility
const { hadDeprecatedEnv } = applyArgumentPreprocessing(process.argv);

const program = new Command();

addPathAndEnvironmentOptions(program)
  .name('pcf-helper-import')
  .description('Import PCF controls to Dataverse')
  .version(version, '-v, --version')
  .parse();

const options = program.opts();

setupLogging(options.verbose);
logger.log('PCF Helper version', version);

const env = resolveEnvironment(options, hadDeprecatedEnv);

task.runImport(
  options.path,
  env,
  options.verbose || false,
  options.timeout ? Number(options.timeout) : undefined
);
