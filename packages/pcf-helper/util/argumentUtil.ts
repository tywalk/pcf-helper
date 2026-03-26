import { Command } from 'commander';
import logger from '@tywalk/color-logger';

export function getArg(args: string[], arg: string): string | undefined {
    const index = args.indexOf(arg);
    if (index !== -1 && index + 1 < args.length) {
        return args[index + 1];
    }
    return undefined;
}

export function getArgValue(args: string[], argOpts: string[], defaultIfExists?: any): string | undefined {
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
 * Adds path and environment options to a Commander.js command
 * @param command - Commander.js command instance
 * @returns The command with path and environment options added
 */
export function addPathAndEnvironmentOptions(command: Command): Command {
  return addCommonOptions(command)
    .requiredOption('-p, --path <path>', 'path to solution folder')
    .option('-e, --environment <environment>', 'environment name')
    .option('--env <environment>', '[DEPRECATED: use -e/--environment] environment name (deprecated)');
}

/**
 * Sets up logging based on verbose option
 * @param verbose - Whether verbose logging is enabled
 */
export function setupLogging(verbose?: boolean): void {
  if (verbose) {
    logger.setDebug(true);
  }
}