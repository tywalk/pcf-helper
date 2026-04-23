import { Command } from 'commander';
import logger from '@tywalk/color-logger';
import {
  LoadedConfig,
  Profile,
  loadPcfHelperConfig,
  resolveProfile,
} from './configUtil';

export function getArg(args: string[], arg: string): string | undefined {
    const index = args.indexOf(arg);
    if (index !== -1 && index + 1 < args.length) {
        return args[index + 1];
    }
    return undefined;
}

export function getArgValue(args: string[], argOpts: string[], defaultIfExists?: string): string | undefined {
  const arg = args.find(a => argOpts.includes(a));
  if (typeof arg === 'undefined') {
    return undefined;
  }
  
  const argIndex = args.indexOf(arg) + 1;
  return args.at(argIndex) ?? defaultIfExists;
}

/**
 * Preprocesses command line arguments to handle deprecated flags
 * @param args - Raw command line arguments
 * @returns Object containing processed args and deprecation flags
 */
export function preprocessArgs(args: string[]): { args: string[], hadDeprecatedEnv: boolean } {
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
}

/**
 * Resolves environment value from options with proper deprecation warnings
 * @param options - Parsed Commander.js options
 * @param hadDeprecatedEnv - Whether the deprecated -env flag was used
 * @returns Resolved environment string
 */
export function resolveEnvironment(options: { env?: string; environment?: string }, hadDeprecatedEnv: boolean): string {
  // Check if deprecated --env flag was used
  if (options.env && options.environment) {
    logger.warn('⚠️  Both --env (deprecated) and --environment flags provided. Using --environment value.');
    return options.environment;
  } else if (options.env) {
    if (hadDeprecatedEnv) {
      logger.warn('⚠️  The -env flag is DEPRECATED. Please use -e or --environment instead.');
    } else {
      logger.warn('⚠️  The --env flag is DEPRECATED. Please use -e or --environment instead.');
    }
    return options.env;
  } else {
    return options.environment || '';
  }
}

/**
 * Applies argument preprocessing for backward compatibility
 * @param originalArgv - The original process.argv
 */
export function applyArgumentPreprocessing(originalArgv: string[]): { hadDeprecatedEnv: boolean } {
  const { args: processedArgs, hadDeprecatedEnv } = preprocessArgs(originalArgv.slice(2));
  process.argv = [...originalArgv.slice(0, 2), ...processedArgs];
  return { hadDeprecatedEnv };
}

/**
 * Adds common CLI options to a Commander.js command
 * @param command - Commander.js command instance
 * @returns The command with common options added
 */
export function addCommonOptions(command: Command): Command {
  return command
    .option('-V, --verbose', 'enable verbose logging')
    .option('-t, --timeout <milliseconds>', 'timeout in milliseconds', (value: string) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        throw new Error('Timeout must be a positive number');
      }
      return value;
    });
}

/**
 * Adds path and environment options to a Commander.js command.
 *
 * Note: `--path` is NOT marked required here even though most commands need
 * it, because profile values can supply it. Callers must validate after
 * `resolvePathEnvironmentOptions` that a path was ultimately resolved.
 */
export function addPathAndEnvironmentOptions(command: Command): Command {
  return addCommonOptions(command)
    .option('-p, --path <path>', 'path to solution folder')
    .option('-e, --environment <environment>', 'environment name')
    .option('--env <environment>', '[DEPRECATED: use -e/--environment] environment name (deprecated)')
    .option('-P, --profile <name>', 'named profile from pcf-helper.config.json to use for defaults');
}

/**
 * Adds the `--profile` option to any command. Use when a command doesn't use
 * `addPathAndEnvironmentOptions` (for example, init and session).
 */
export function addProfileOption(command: Command): Command {
  return command.option('-P, --profile <name>', 'named profile from pcf-helper.config.json to use for defaults');
}

export interface ProfileAwareOptions {
  path?: string;
  environment?: string;
  env?: string;
  profile?: string;
}

export interface ResolvedPathEnv {
  path: string;
  environment: string;
  /** Information about which profile (if any) was used. Useful for logging. */
  profileName?: string;
  /** The loaded config object — handy for callers that need session values. */
  config: LoadedConfig;
}

/**
 * Resolves `--path` and `--environment` using the precedence:
 *   CLI flag > profile value > '' (empty)
 *
 * Deprecated `--env` is still honored; see `resolveEnvironment`.
 *
 * Loads the pcf-helper config from ~/.pcf-helper/config.json and the project
 * working directory. Callers should validate that `path` is non-empty if their
 * command requires it.
 */
export function resolvePathAndEnvironment(
  options: ProfileAwareOptions,
  hadDeprecatedEnv: boolean,
): ResolvedPathEnv {
  const config = loadPcfHelperConfig();
  const { name: profileName, profile } = resolveProfile(options.profile, config.merged);

  const explicitEnv = resolveEnvironment(options, hadDeprecatedEnv);
  const resolvedEnv = explicitEnv !== '' ? explicitEnv : profile?.environment ?? '';
  const resolvedPath = options.path ?? profile?.path ?? '';

  if (profileName) {
    logger.log(`🧭 Using profile "${profileName}" from pcf-helper config.`);
  }

  return {
    path: resolvedPath,
    environment: resolvedEnv,
    profileName,
    config,
  };
}

/**
 * Resolves just a profile (without path/env) for commands like init and
 * session where the option surface differs. Returns the profile object (or
 * undefined if no profile was requested/configured) plus the loaded config.
 */
export function resolveProfileOnly(profileName?: string): {
  profileName?: string;
  profile?: Profile;
  config: LoadedConfig;
} {
  const config = loadPcfHelperConfig();
  const { name, profile } = resolveProfile(profileName, config.merged);
  if (name) {
    logger.log(`🧭 Using profile "${name}" from pcf-helper config.`);
  }
  return { profileName: name, profile, config };
}
