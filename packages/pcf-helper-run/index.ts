#!/usr/bin/env node
import { Command, program } from 'commander';
import * as tasks from '@tywalk/pcf-helper';
import {
  loadPcfHelperConfig,
  resolveProfile,
  runProfileInit,
  Profile,
  ProfileInitOptions,
} from '@tywalk/pcf-helper';
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
  profile?: string;
}

interface PathOptions extends CommonOptions {
  path?: string;
  environment?: string;
  env?: string; // Deprecated: backward compatibility
}

interface InitOptions extends CommonOptions {
  path?: string;
  name: string;
  publisherName?: string;
  publisherPrefix?: string;
  template?: string;
  framework?: string;
  runNpmInstall?: boolean;
}

interface SessionOptions extends CommonOptions {
  url?: string;
  script?: string;
  stylesheet?: string;
  bundle?: string;
  css?: string;
  config?: string;
  watch?: boolean;
  watchRetry?: boolean;
}

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

// Configure the CLI program
program
  .name('pcf-helper-run')
  .description('A simple command-line utility for building and publishing PCF controls to Dataverse.')
  .version(version);

// Helper function to add verbose option to commands
const withVerboseOption = (command: Command) => {
  return command.option('-v, --verbose', 'enable verbose logging');
};

// Global options for commands that need them
const withCommonOptions = (command: Command) => {
  return command
    .option('-v, --verbose', 'enable verbose logging')
    .option('-t, --timeout <milliseconds>', 'timeout in milliseconds', (value: string) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        throw new Error('Timeout must be a positive number');
      }
      return value;
    })
    .option('-P, --profile <name>', 'named profile from pcf-helper.config.json to use for defaults');
};

const withPathOptions = (command: Command) => {
  return withCommonOptions(command)
    .option('-p, --path <path>', 'path to solution folder')
    .option('-e, --environment <environment>', 'environment name')
    .option('--env <environment>', '[DEPRECATED: use -e/--environment] environment name (deprecated)');
};

// Helper function to resolve environment value with deprecation warning
const resolveEnvironment = (options: PathOptions, logger: Logger): string => {
  if (options.env && options.environment) {
    logger.warn('WARN: Both --env (deprecated) and --environment flags provided. Using --environment value.');
    return options.environment;
  } else if (options.env) {
    if (hadDeprecatedEnv) {
      logger.warn('WARN: The -env flag is DEPRECATED. Please use -e or --environment instead.');
    } else {
      logger.warn('WARN: The --env flag is DEPRECATED. Please use -e or --environment instead.');
    }
    return options.env;
  } else {
    return options.environment || '';
  }
};

// Loads a profile (if any) and logs which one is in use.
const loadProfile = (profileName: string | undefined, logger: Logger): Profile | undefined => {
  const { merged } = loadPcfHelperConfig();
  const { name, profile } = resolveProfile(profileName, merged);
  if (name) {
    logger.log(`Using profile "${name}" from pcf-helper config.`);
  }
  return profile;
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
const handleResults = (taskName: string, logger: Logger, tick: number, result: number) => {
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

// upgrade
withPathOptions(program.command('upgrade'))
  .description('upgrade PCF controls')
  .action((options: PathOptions) => {
    const { logger, tick } = setupExecutionContext(options);
    const profile = loadProfile(options.profile, logger);

    const resolvedPath = options.path ?? profile?.path ?? '';
    if (!resolvedPath) {
      logger.error('Path argument is required. Use --path or set `path` in the active profile.');
      process.exit(1);
    }

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' upgrade started.\n');
      result = tasks.runUpgrade(resolvedPath, options.verbose || false);
    } catch (e: unknown) {
      logger.error('[PCF Helper Run] One or more tasks failed while upgrading: ', e instanceof Error ? e.message : 'unknown error');
      result = 1;
    }

    handleResults('upgrade', logger, tick, result);
  });

// build
withPathOptions(program.command('build'))
  .description('build PCF controls')
  .action((options: PathOptions) => {
    const { logger, tick } = setupExecutionContext(options);
    const profile = loadProfile(options.profile, logger);

    const resolvedPath = options.path ?? profile?.path ?? '';
    if (!resolvedPath) {
      logger.error('Path argument is required. Use --path or set `path` in the active profile.');
      process.exit(1);
    }

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' build started.\n');
      result = tasks.runBuild(
        resolvedPath,
        options.verbose || false,
        options.timeout ? Number(options.timeout) : undefined
      );
    } catch (e: unknown) {
      logger.error('[PCF Helper Run] One or more tasks failed while building: ', e instanceof Error ? e.message : 'unknown error');
      result = 1;
    }

    handleResults('build', logger, tick, result);
  });

// import
withPathOptions(program.command('import'))
  .description('import PCF controls')
  .action((options: PathOptions) => {
    const { logger, tick } = setupExecutionContext(options);
    const profile = loadProfile(options.profile, logger);

    const resolvedPath = options.path ?? profile?.path ?? '';
    if (!resolvedPath) {
      logger.error('Path argument is required. Use --path or set `path` in the active profile.');
      process.exit(1);
    }

    const explicitEnv = resolveEnvironment(options, logger);
    const env = explicitEnv !== '' ? explicitEnv : profile?.environment ?? '';
    if (env === '') {
      logger.warn('No environment specified. Defaulting to "local".');
    }

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' import started.\n');
      result = tasks.runImport(
        resolvedPath,
        env,
        options.verbose || false,
        options.timeout ? Number(options.timeout) : undefined
      );
    } catch (e: unknown) {
      logger.error('[PCF Helper Run] One or more tasks failed while importing: ', e instanceof Error ? e.message : 'unknown error');
      result = 1;
    }

    handleResults('import', logger, tick, result);
  });

// deploy
withPathOptions(program.command('deploy'))
  .description('deploy PCF controls (runs upgrade, build, and import)')
  .action((options: PathOptions) => {
    const { logger, tick } = setupExecutionContext(options);
    const profile = loadProfile(options.profile, logger);

    const resolvedPath = options.path ?? profile?.path ?? '';
    if (!resolvedPath) {
      logger.error('Path argument is required. Use --path or set `path` in the active profile.');
      process.exit(1);
    }

    const explicitEnv = resolveEnvironment(options, logger);
    const env = explicitEnv !== '' ? explicitEnv : profile?.environment ?? '';
    if (env === '') {
      logger.warn('No environment specified. Defaulting to "local".');
    }

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' deploy started.\n');

      const upgradeResult = tasks.runUpgrade(resolvedPath, options.verbose || false);
      if (upgradeResult === 1) {
        result = 1;
      } else {
        const buildResult = tasks.runBuild(
          resolvedPath,
          options.verbose || false,
          options.timeout ? Number(options.timeout) : undefined
        );
        if (buildResult === 1) {
          result = 1;
        } else {
          const importResult = tasks.runImport(
            resolvedPath,
            env,
            options.verbose || false,
            options.timeout ? Number(options.timeout) : undefined
          );
          if (importResult === 1) {
            result = 1;
          }
        }
      }
    } catch (e: unknown) {
      logger.error('[PCF Helper Run] One or more tasks failed while deploying: ', e instanceof Error ? e.message : 'unknown error');
      result = 1;
    }

    handleResults('deploy', logger, tick, result);
  });

// init
withVerboseOption(program.command('init'))
  .description('initialize a new PCF project')
  .requiredOption('-n, --name <name>', 'name of the control')
  .option('-p, --path <path>', 'path to PCF folder')
  .option('--publisher-name <publisherName>', 'publisher name')
  .option('--publisher-prefix <publisherPrefix>', 'publisher prefix')
  .option('-t, --template <template>', 'template for the component (field|dataset)')
  .option('-f, --framework <framework>', 'rendering framework for control (none|react)')
  .option('--run-npm-install', 'run npm install after initialization', true)
  .option('-P, --profile <name>', 'named profile from pcf-helper.config.json to use for defaults')
  .action((options: InitOptions) => {
    const { logger, tick } = setupExecutionContext(options);
    const profile = loadProfile(options.profile, logger);

    let result = 0;
    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' init started.\n');
      result = tasks.runInit(
        options.path ?? profile?.path ?? '',
        options.name,
        options.publisherName ?? profile?.publisherName ?? '',
        options.publisherPrefix ?? profile?.publisherPrefix ?? '',
        options.template ?? profile?.template ?? 'field',
        options.framework ?? profile?.framework ?? 'react',
        options.runNpmInstall !== false,
        options.verbose || false
      );
    } catch (e: unknown) {
      logger.error('[PCF Helper Run] One or more tasks failed while initializing: ', e instanceof Error ? e.message : 'unknown error');
      result = 1;
    }

    handleResults('init', logger, tick, result);
  });

// session
withCommonOptions(program.command('session'))
  .description('run development session')
  .option('-u, --url <url>', 'remote environment URL')
  .option('-i, --intercept-script <script>', 'remote script to intercept')
  .option('-s, --intercept-stylesheet <stylesheet>', 'remote stylesheet to intercept')
  .option('-b, --local-bundle <path>', 'local bundle path')
  .option('-c, --local-css <path>', 'local CSS path')
  .option('-f, --config <path>', 'config file path', 'session.config.json')
  .option('-w, --watch', 'start pcf-scripts watch process')
  .option('--watch-retry <enabled>', 'automatically retry watch process on failure (true|false)', parseWatchRetry)
  .action(async (options: SessionOptions, command: Command) => {
    const { logger, tick } = setupExecutionContext(options);

    try {
      logger.log('[PCF Helper Run] ' + formatTime(new Date()) + ' session started.\n');
      const config = tasks.loadConfig(options.config, options.profile);
      const configWithWatchRetry = config as Partial<{ watchRetry: boolean }>;
      const startWatch = options.watch ?? config.startWatch ?? false;
      const watchRetryFlagWasSet = command.getOptionValueSource('watchRetry') === 'cli';
      if (watchRetryFlagWasSet && !startWatch) {
        logger.error('Error: --watch-retry can only be used when --watch is enabled.');
        process.exit(1);
      }
      const watchRetry = options.watchRetry ?? configWithWatchRetry.watchRetry ?? true;

      await (tasks.runSession as (...args: unknown[]) => Promise<void>)(
        options.url ?? config.remoteEnvironmentUrl,
        options.script ?? config.remoteScriptToIntercept,
        options.stylesheet ?? config.remoteStylesheetToIntercept,
        options.bundle ?? config.localBundlePath,
        options.css ?? config.localCssPath,
        startWatch,
        watchRetry
      );

      const tock = performance.now();
      logger.log(formatMsToSec('Session started successfully in %is.', tock - tick));
    } catch (e: unknown) {
      logger.error('[PCF Helper Run] One or more tasks failed during session or session startup: ', e instanceof Error ? e.message : 'unknown error');
    }
  });

// profile subcommand
const profileCmd = program.command('profile').description('inspect pcf-helper profiles from pcf-helper.config.json');

profileCmd
  .command('list')
  .description('list all available profile names')
  .action(() => {
    const { merged, sources } = loadPcfHelperConfig();
    const names = Object.keys(merged.profiles ?? {});
    const isDefault = (n: string) => (merged.defaultProfile === n ? ' (default)' : '');

    if (sources.length === 0) {
      console.log('No pcf-helper config files found.');
      console.log('Looked at:');
      console.log('  - global: ~/.pcf-helper/config.json');
      console.log('  - project: ./pcf-helper.config.json');
      return;
    }

    console.log('Loaded config from:');
    for (const s of sources) console.log(`  - ${s}`);

    if (names.length === 0) {
      console.log('\nNo profiles defined.');
      return;
    }

    console.log('\nProfiles:');
    for (const n of names) console.log(`  - ${n}${isDefault(n)}`);
  });

profileCmd
  .command('show <name>')
  .description('print the resolved contents of a profile')
  .action((name: string) => {
    const { merged } = loadPcfHelperConfig();
    const profile = merged.profiles?.[name];
    if (!profile) {
      const available = Object.keys(merged.profiles ?? {});
      console.error(`Profile "${name}" not found. Available: ${available.join(', ') || '(none)'}`);
      process.exit(1);
    }
    console.log(JSON.stringify(profile, null, 2));
  });

profileCmd
  .command('current')
  .description('print the profile that would be used by default')
  .action(() => {
    const { merged } = loadPcfHelperConfig();
    if (!merged.defaultProfile) {
      console.log('No defaultProfile set.');
      return;
    }
    console.log(merged.defaultProfile);
  });

profileCmd
  .command('paths')
  .description('print the global and project config paths')
  .action(() => {
    const { projectPath, globalPath, sources } = loadPcfHelperConfig();
    console.log(`global:  ${globalPath}`);
    console.log(`project: ${projectPath}`);
    console.log(`loaded:  ${sources.length ? sources.join(', ') : '(none)'}`);
  });

profileCmd
  .command('init <name>')
  .description('create a new profile in pcf-helper.config.json (project or global)')
  .option('-e, --environment <env>', 'Dataverse environment name')
  .option('--publisher-name <name>', 'publisher display name')
  .option('--publisher-prefix <prefix>', 'publisher prefix (2-8 chars)')
  .option('-p, --path <path>', 'path to PCF solution folder')
  .option('--template <template>', 'control template (field|dataset)')
  .option('--framework <framework>', 'rendering framework (none|react)')
  .option('--session-url <url>', 'session: remote environment URL')
  .option('--session-script <path>', 'session: remote script to intercept')
  .option('--session-bundle <path>', 'session: local bundle path')
  .option('-g, --global', 'write to ~/.pcf-helper/config.json instead of project-level')
  .option('-d, --set-default', 'set this profile as the defaultProfile')
  .option('-f, --force', 'overwrite an existing profile of the same name')
  .option('--no-interactive', 'skip prompts for missing fields')
  .action(async (name: string, flags: Record<string, unknown>) => {
    const options: ProfileInitOptions = {
      name,
      environment: flags.environment as string | undefined,
      publisherName: flags.publisherName as string | undefined,
      publisherPrefix: flags.publisherPrefix as string | undefined,
      path: flags.path as string | undefined,
      template: flags.template as string | undefined,
      framework: flags.framework as string | undefined,
      sessionUrl: flags.sessionUrl as string | undefined,
      sessionScript: flags.sessionScript as string | undefined,
      sessionBundle: flags.sessionBundle as string | undefined,
      global: !!flags.global,
      setDefault: !!flags.setDefault,
      force: !!flags.force,
      nonInteractive: flags.interactive === false,
    };
    try {
      await runProfileInit(options);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`Error: ${message}`);
      process.exit(1);
    }
  });

program.parseAsync();
