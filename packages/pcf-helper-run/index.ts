#!/usr/bin/env node
import { Command, program } from 'commander';
import * as tasks from '@tywalk/pcf-helper';
import { Logger } from '@tywalk/color-logger';
import { version } from './package.json';
import { formatMsToSec, formatTime } from './util/performanceUtil';

// Preprocess arguments to handle deprecated flags
const preprocessArgs = (args: string[]): { args: string[], hadDeprecatedEnv: boolean } => {
  const processed = [...args];
  let hadDeprecatedEnv = false;

  // Handle deprecated -env flag (single dash) by converting to --env (double dash)
  for (let i = 0; i < processed.length; i++) {
    if (processed[i] === '-env') {
      hadDeprecatedEnv = true;
      processed[i] = '--env';
    }
  }

  return { args: processed, hadDeprecatedEnv };
};

// Preprocess arguments and track if deprecated flags were used  
const { args: processedArgs, hadDeprecatedEnv } = preprocessArgs(process.argv.slice(2));
process.argv = [...process.argv.slice(0, 2), ...processedArgs];

interface CommonOptions {
  verbose?: boolean;
  timeout?: string;
}

interface PathOptions extends CommonOptions {
  path: string;
  environment?: string;
  env?: string; // Deprecated: backward compatibility
}

interface InitOptions extends CommonOptions {
  path: string;
  name: string;
  publisherName: string;
  publisherPrefix: string;
  runNpmInstall?: boolean;
}

interface SessionOptions extends CommonOptions {
  url: string;
  script: string;
  stylesheet: string;
  bundle: string;
  css: string;
  config?: string;
}

// Configure the CLI program
program
  .name('pcf-helper-run')
  .description('A simple command-line utility for building and publishing PCF controls to Dataverse.')
  .version(version);

// Global options for commands that need them
const addCommonOptions = (command: Command) => {
  return command
    .option('-v, --verbose', 'enable verbose logging')
    .option('-t, --timeout <milliseconds>', 'timeout in milliseconds', (value: string) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        throw new Error('Timeout must be a positive number');
      }
      return value;
    });
};

const addPathOptions = (command: Command) => {
  return addCommonOptions(command)
    .option('-p, --path <path>', 'path to solution folder')
    .option('-e, --environment <environment>', 'environment name')
    .option('--env <environment>', '[DEPRECATED: use -e/--environment] environment name (deprecated)');
};

// Helper function to resolve environment value with deprecation warning
const resolveEnvironment = (options: PathOptions, logger: Logger): string => {
  // Check if deprecated --env flag was used
  if (options.env && options.environment) {
    logger.warn('⚠️  Both --env (deprecated) and --environment flags provided. Using --environment value.');
    return options.environment;
  } else if (options.env) {
    // Show deprecation warning using the proper logger
    if (hadDeprecatedEnv) {
      logger.warn('⚠️  The -env flag is DEPRECATED. Please use -e or --environment instead.');
    } else {
      logger.warn('⚠️  The --env flag is DEPRECATED. Please use -e or --environment instead.');
    }
    return options.env;
  } else {
    return options.environment || '';
  }
};

// Helper function to setup logger and performance tracking
const setupExecutionContext = (options: CommonOptions) => {
  const logger = new Logger('log');

  if (options.verbose) {
    logger.setDebug(true);
    tasks.setLogLevel('debug');
  } else {
    tasks.setLogLevel('info');
  }

  logger.log('PCF Helper Run version\n', version);

  return { logger, tick: performance.now() };
};

// Helper function to execute tasks and handle results
const executeTask = (taskName: string, logger: Logger, tick: number, result: number) => {
  if (taskName !== 'session') {
    if (result === 0) {
      logger.log(`[PCF Helper Run] ${taskName} completed successfully!`);
    } else {
      logger.log(`[PCF Helper Run] ${taskName} completed with errors.`);
    }

    const tock = performance.now();
    logger.log(formatMsToSec(`[PCF Helper Run] ${formatTime(new Date())} ${taskName} finished in %is.`, tock - tick));
  }

  if (taskName !== 'session' || result === 1) {
    process.exit(result);
  }
};

// Define the upgrade command
addPathOptions(program.command('upgrade'))
  .description('upgrade PCF controls')
  .action((options: PathOptions) => {
    const { logger, tick } = setupExecutionContext(options);

    if (!options.path) {
      logger.error('Path argument is required. Use --path to specify the path to solution folder.');
      process.exit(1);
    }

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' upgrade started.\n');
      result = tasks.runUpgrade(options.path, options.verbose || false);
    } catch (e: any) {
      logger.error('[PCF Helper Run] One or more tasks failed while upgrading: ', (e && e.message) || 'unknown error');
      result = 1;
    }

    executeTask('upgrade', logger, tick, result);
  });

// Define the build command  
addPathOptions(program.command('build'))
  .description('build PCF controls')
  .action((options: PathOptions) => {
    const { logger, tick } = setupExecutionContext(options);

    if (!options.path) {
      logger.error('Path argument is required. Use --path to specify the path to solution folder.');
      process.exit(1);
    }

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' build started.\n');
      result = tasks.runBuild(
        options.path,
        options.verbose || false,
        options.timeout ? Number(options.timeout) : undefined
      );
    } catch (e: any) {
      logger.error('[PCF Helper Run] One or more tasks failed while building: ', (e && e.message) || 'unknown error');
      result = 1;
    }

    executeTask('build', logger, tick, result);
  });

// Define the import command
addPathOptions(program.command('import'))
  .description('import PCF controls')
  .action((options: PathOptions) => {
    const { logger, tick } = setupExecutionContext(options);

    if (!options.path) {
      logger.error('Path argument is required. Use --path to specify the path to solution folder.');
      process.exit(1);
    }

    const env = resolveEnvironment(options, logger);
    if (env === '') {
      logger.warn('No environment specified. Defaulting to "local".');
    }

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' import started.\n');
      result = tasks.runImport(
        options.path,
        env,
        options.verbose || false,
        options.timeout ? Number(options.timeout) : undefined
      );
    } catch (e: any) {
      logger.error('[PCF Helper Run] One or more tasks failed while importing: ', (e && e.message) || 'unknown error');
      result = 1;
    }

    executeTask('import', logger, tick, result);
  });

// Define the deploy command (runs upgrade, build, and import)
addPathOptions(program.command('deploy'))
  .description('deploy PCF controls (runs upgrade, build, and import)')
  .action((options: PathOptions) => {
    const { logger, tick } = setupExecutionContext(options);

    if (!options.path) {
      logger.error('Path argument is required. Use --path to specify the path to solution folder.');
      process.exit(1);
    }

    const env = resolveEnvironment(options, logger);
    if (env === '') {
      logger.warn('No environment specified. Defaulting to "local".');
    }

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' deploy started.\n');

      // Run upgrade
      const upgradeResult = tasks.runUpgrade(options.path, options.verbose || false);
      if (upgradeResult === 1) {
        result = 1;
      } else {
        // Run build
        const buildResult = tasks.runBuild(
          options.path,
          options.verbose || false,
          options.timeout ? Number(options.timeout) : undefined
        );
        if (buildResult === 1) {
          result = 1;
        } else {
          // Run import
          const importResult = tasks.runImport(
            options.path,
            env,
            options.verbose || false,
            options.timeout ? Number(options.timeout) : undefined
          );
          if (importResult === 1) {
            result = 1;
          }
        }
      }
    } catch (e: any) {
      logger.error('[PCF Helper Run] One or more tasks failed while deploying: ', (e && e.message) || 'unknown error');
      result = 1;
    }

    executeTask('deploy', logger, tick, result);
  });

// Define the init command
addCommonOptions(program.command('init'))
  .description('initialize a new PCF project')
  .requiredOption('-p, --path <path>', 'path to PCF folder')
  .requiredOption('-n, --name <name>', 'name of the control')
  .requiredOption('--publisher-name <publisherName>', 'publisher name')
  .requiredOption('--publisher-prefix <publisherPrefix>', 'publisher prefix')
  .option('--run-npm-install', 'run npm install after initialization', true)
  .action((options: InitOptions) => {
    const { logger, tick } = setupExecutionContext(options);

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' init started.\n');
      result = tasks.runInit(
        options.path,
        options.name,
        options.publisherName,
        options.publisherPrefix,
        options.runNpmInstall !== false,
        options.verbose || false
      );
    } catch (e: any) {
      logger.error('[PCF Helper Run] One or more tasks failed while initializing: ', (e && e.message) || 'unknown error');
      result = 1;
    }

    executeTask('init', logger, tick, result);
  });

// Define the session command
addCommonOptions(program.command('session'))
  .description('run development session')
  .option('-u, --url <url>', 'remote environment URL')
  .option('-i, --intercept-script <script>', 'remote script to intercept')
  .option('-s, --intercept-stylesheet <stylesheet>', 'remote stylesheet to intercept')
  .option('-b, --local-bundle <path>', 'local bundle path')
  .option('-c, --local-css <path>', 'local CSS path')
  .option('-f, --config <path>', 'config file path', 'session.config.json')
  .action((options: SessionOptions) => {
    const { logger, tick } = setupExecutionContext(options);

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' session started.\n');
      if (!options.url) {
        const config = tasks.loadConfig(options.config || 'session.config.json');
        options.url = config.remoteEnvironmentUrl;
        options.script = config.remoteScriptToIntercept;
        options.stylesheet = config.remoteStylesheetToIntercept;
        options.bundle = config.localBundlePath;
        options.css = config.localCssPath;
      }
      tasks.runSession(
        options.url,
        options.script,
        options.stylesheet,
        options.bundle,
        options.css
      );
    } catch (e: any) {
      logger.error('[PCF Helper Run] One or more tasks failed during session: ', (e && e.message) || 'unknown error');
      result = 1;
    }

    executeTask('session', logger, tick, result);
  });

// Parse the command line arguments
program.parse();
