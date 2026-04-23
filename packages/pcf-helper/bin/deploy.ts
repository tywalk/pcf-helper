#!/usr/bin/env node
import * as upgradeTask from '../tasks/upgrade-pcf';
import * as buildTask from '../tasks/build-pcf';
import * as importTask from '../tasks/import-pcf';
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

interface DeployOptions {
  path?: string;
  verbose?: boolean;
  timeout?: string;
  environment?: string;
  env?: string;
  profile?: string;
}

function executeTasks(path: string, env: string, options: DeployOptions): number {
  const upgradeResult = upgradeTask.runUpgrade(path, options.verbose || false);
  if (upgradeResult === 1) return 1;

  const buildResult = buildTask.runBuild(
    path,
    options.verbose || false,
    options.timeout ? Number(options.timeout) : undefined
  );
  if (buildResult === 1) return 1;

  const importResult = importTask.runImport(
    path,
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
  .action((options: DeployOptions) => {
    const { logger, tick } = setupExecutionContext(options);

    logger.log('PCF Helper version', version);

    const { path, environment } = resolvePathAndEnvironment(options, hadDeprecatedEnv);

    if (!path) {
      logger.error('Path argument is required. Use --path or set `path` in the active profile.');
      process.exit(1);
    }

    let result = 0;
    try {
      result = executeTasks(path, environment, options);
      if (result === 0) {
        logger.log('Deploy complete!');
      }
    } catch (e: unknown) {
      logger.error('One or more tasks failed while deploying: ', e instanceof Error ? e.message : 'unknown error');
      result = 1;
    } finally {
      handleResults('deploy', logger, tick, result);
    }
  })
  .parse();
