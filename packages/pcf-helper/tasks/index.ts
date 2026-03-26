import logger from '@tywalk/color-logger';

export * from './build-pcf';
export * from './import-pcf';
export * from './init-pcf';
export * from './upgrade-pcf';
export * from './session-pcf';

export const setLogLevel = (level: 'debug' | 'info' | 'warn' | 'error') => {
  logger.setLevel(level);
}