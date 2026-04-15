import { Logger } from '@tywalk/color-logger';
import { formatMsToSec, formatTime } from './performanceUtil';

type SpawnCommand = {
  command: string;
  args: string[];
};

export const resolveSpawnCommand = (command: string, args: string[]): SpawnCommand => {
  if (command !== 'npm') {
    return { command, args };
  }

  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath) {
    return {
      command: process.execPath,
      args: [npmExecPath, ...args]
    };
  }

  return {
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args
  };
};

export const setupExecutionContext = (options: CommonOptions) => {
  const logger = new Logger('log');

  if (options.verbose) {
    logger.setDebug(true);
    logger.setLevel('debug');
  } else {
    logger.setLevel('info');
  }

  return { logger, tick: performance.now() };
};

// Helper function to execute tasks and handle results
export const handleResults = (taskName: string, logger: Logger, tick: number, result: number) => {
  if (taskName !== 'session') {
    if (result === 0) {
      logger.log(`[PCF Helper] ${taskName} completed successfully!`);
    } else {
      logger.log(`[PCF Helper] ${taskName} completed with errors.`);
    }

    const tock = performance.now();
    logger.log(formatMsToSec(`[PCF Helper] ${formatTime(new Date())} ${taskName} finished in %is.`, tock - tick));
  }

  if (taskName !== 'session' || result === 1) {
    process.exit(result);
  }
};