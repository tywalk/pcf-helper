import {
  setupExecutionContext,
  handleResults
} from '../util/commandUtil';
import { Logger } from '@tywalk/color-logger';

jest.mock('@tywalk/color-logger', () => {
  return {
    Logger: jest.fn(() => ({
      setDebug: jest.fn(),
      setLevel: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    }))
  };
});

describe('commandUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setupExecutionContext', () => {
    it('should create a logger instance', () => {
      const options = { verbose: false };
      const context = setupExecutionContext(options);
      
      expect(context).toHaveProperty('logger');
      expect(context).toHaveProperty('tick');
    });

    it('should set debug mode when verbose is true', () => {
      const options = { verbose: true };
      const context = setupExecutionContext(options);
      const logger = context.logger as any;
      
      expect(logger.setDebug).toHaveBeenCalledWith(true);
      expect(logger.setLevel).toHaveBeenCalledWith('debug');
    });

    it('should set info level when verbose is false', () => {
      const options = { verbose: false };
      const context = setupExecutionContext(options);
      const logger = context.logger as any;
      
      expect(logger.setLevel).toHaveBeenCalledWith('info');
    });

    it('should return a tick timestamp', () => {
      const options = { verbose: false };
      const context = setupExecutionContext(options);
      
      expect(typeof context.tick).toBe('number');
      expect(context.tick).toBeGreaterThan(0);
    });

    it('should handle undefined verbose option', () => {
      const options = {};
      const context = setupExecutionContext(options);
      const logger = context.logger as any;
      
      expect(logger.setLevel).toHaveBeenCalledWith('info');
    });

    it('should handle timeout in options', () => {
      const options = { verbose: false, timeout: '5000' };
      const context = setupExecutionContext(options);
      
      expect(context.logger).toBeDefined();
      expect(context.tick).toBeDefined();
    });
  });

  describe('handleResults', () => {
    it('should log success when result is 0 and not session', () => {
      const logger = new Logger('log');
      const logSpy = jest.spyOn(logger, 'log');
      
      handleResults('build', logger, 100, 0);
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('completed successfully'));
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should log error when result is not 0 and not session', () => {
      const logger = new Logger('log');
      const logSpy = jest.spyOn(logger, 'log');
      
      handleResults('build', logger, 100, 1);
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('completed with errors'));
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should not call process.exit for session task with success', () => {
      const logger = new Logger('log');
      
      handleResults('session', logger, 100, 0);
      
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should call process.exit for session task with error', () => {
      const logger = new Logger('log');
      
      handleResults('session', logger, 100, 1);
      
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should format and log timing information', () => {
      const logger = new Logger('log');
      const logSpy = jest.spyOn(logger, 'log');
      
      handleResults('build', logger, 1000, 0);
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('finished in'));
    });

    it('should exit with correct code on failure', () => {
      const logger = new Logger('log');
      
      handleResults('deploy', logger, 500, 1);
      
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle import task name', () => {
      const logger = new Logger('log');
      const logSpy = jest.spyOn(logger, 'log');
      
      handleResults('import', logger, 2000, 0);
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('import'));
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should handle upgrade task name', () => {
      const logger = new Logger('log');
      const logSpy = jest.spyOn(logger, 'log');
      
      handleResults('upgrade', logger, 1500, 0);
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('upgrade'));
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should handle init task name', () => {
      const logger = new Logger('log');
      const logSpy = jest.spyOn(logger, 'log');
      
      handleResults('init', logger, 3000, 0);
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('init'));
      expect(process.exit).toHaveBeenCalledWith(0);
    });
  });
});
