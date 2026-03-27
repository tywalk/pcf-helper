#!/usr/bin/env node
import * as upgradeTask from '../tasks/upgrade-pcf';
import * as buildTask from '../tasks/build-pcf';
import * as importTask from '../tasks/import-pcf';
import { formatMsToSec } from '../util/performanceUtil';
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

function executeTasks(options: any, env: string): number {
  const upgradeResult = upgradeTask.runUpgrade(options.path, options.verbose || false);
  if (upgradeResult === 1) return 1;

  const buildResult = buildTask.runBuild(
    options.path,
    options.verbose || false,
    options.timeout ? Number(options.timeout) : undefined
  );
  if (buildResult === 1) return 1;

  const importResult = importTask.runImport(
    options.path,
    env,
    options.verbose || false,
    options.timeout ? Number(options.timeout) : undefined
  );
  if (importResult === 1) return 1;

  return 0;
}

const program = new Command();

addPathAndEnvironmentOptions(program)
  .name('pcf-helper-deploy')
  .description('Deploy PCF controls (runs upgrade, build, and import)')
  .version(version, '-v, --version')
  .action((options) => {
    const { logger, tick } = setupExecutionContext(options);

    logger.log('PCF Helper version', version);

    const env = resolveEnvironment(options, hadDeprecatedEnv);

    var result = 0;
    try {
      result = executeTasks(options, env);
      if (result === 0) {
        logger.log('Deploy complete!');
      }
    } catch (e: any) {
      logger.error('One or more tasks failed while deploying: ', (e && e.message) || 'unknown error');
      result = 1;
    } finally {
      handleResults('deploy', logger, tick, result);
    }

    process.exit(result);
  })
  .parse();