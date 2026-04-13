import {
  getArg,
  getArgValue,
  preprocessArgs,
  resolveEnvironment,
  applyArgumentPreprocessing,
  addCommonOptions,
  addPathAndEnvironmentOptions
} from '../util/argumentUtil';
import { Command } from 'commander';
import logger from '@tywalk/color-logger';

describe('argumentUtil', () => {
  describe('getArg', () => {
    it('should return the argument value if found', () => {
      const args = ['-p', '/path/to/project', '-v'];
      expect(getArg(args, '-p')).toBe('/path/to/project');
    });

    it('should return undefined if argument not found', () => {
      const args = ['-p', '/path/to/project'];
      expect(getArg(args, '-e')).toBeUndefined();
    });

    it('should return undefined if argument is at the end with no value', () => {
      const args = ['-p', '/path/to/project', '-v'];
      expect(getArg(args, '-v')).toBeUndefined();
    });

    it('should return undefined if args array is empty', () => {
      const args: string[] = [];
      expect(getArg(args, '-p')).toBeUndefined();
    });
  });

  describe('getArgValue', () => {
    it('should return value for first matching option', () => {
      const args = ['-n', 'controlName', '--publisher-name', 'PublisherName'];
      expect(getArgValue(args, ['-n', '--name'])).toBe('controlName');
    });

    it('should return undefined if arg not found even when default is provided', () => {
      const args = ['-p', '/path'];
      expect(getArgValue(args, ['-n', '--name'], 'defaultName')).toBeUndefined();
    });

    it('should return undefined if arg not found and no default', () => {
      const args = ['-p', '/path'];
      expect(getArgValue(args, ['-n', '--name'])).toBeUndefined();
    });

    it('should handle multiple option aliases', () => {
      const args = ['--environment', 'prod'];
      expect(getArgValue(args, ['-e', '--environment'])).toBe('prod');
    });

    it('should return undefined if value is beyond array bounds', () => {
      const args = ['-p'];
      expect(getArgValue(args, ['-p'])).toBeUndefined();
    });
  });

  describe('preprocessArgs', () => {
    it('should convert -env to --env and track deprecation', () => {
      const args = ['build', '-env', 'prod'];
      const result = preprocessArgs(args);
      expect(result.args).toContain('--env');
      expect(result.args).not.toContain('-env');
      expect(result.hadDeprecatedEnv).toBe(true);
    });

    it('should not flag deprecation if -env not present', () => {
      const args = ['build', '--environment', 'prod'];
      const result = preprocessArgs(args);
      expect(result.hadDeprecatedEnv).toBe(false);
    });

    it('should handle multiple -env occurrences', () => {
      const args = ['-env', 'prod', '-env', 'dev'];
      const result = preprocessArgs(args);
      const envCount = result.args.filter(a => a === '--env').length;
      expect(envCount).toBe(2);
      expect(result.hadDeprecatedEnv).toBe(true);
    });

    it('should preserve other arguments unchanged', () => {
      const args = ['-p', '/path', '-v', '--template', 'field'];
      const result = preprocessArgs(args);
      expect(result.args).toContain('/path');
      expect(result.args).toContain('-v');
      expect(result.args).toContain('field');
    });
  });

  describe('resolveEnvironment', () => {
    beforeEach(() => {
      jest.spyOn(logger, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return environment value if set', () => {
      const options = { environment: 'prod' };
      const result = resolveEnvironment(options, false);
      expect(result).toBe('prod');
    });

    it('should return deprecated env value and warn if only --env provided', () => {
      const options = { env: 'prod' };
      resolveEnvironment(options, false);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('DEPRECATED'));
    });

    it('should prefer --environment over deprecated --env', () => {
      const options = { env: 'dev', environment: 'prod' };
      const result = resolveEnvironment(options, false);
      expect(result).toBe('prod');
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Both'));
    });

    it('should return empty string if neither env is provided', () => {
      const options = {};
      const result = resolveEnvironment(options, false);
      expect(result).toBe('');
    });

    it('should return deprecated env value with hadDeprecatedEnv flag', () => {
      const options = { env: 'prod' };
      const result = resolveEnvironment(options, true);
      expect(result).toBe('prod');
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('-env'));
    });
  });

  describe('applyArgumentPreprocessing', () => {
    it('should modify process.argv in place', () => {
      const originalArgv = ['node', 'file.js', 'build', '-env', 'prod'];
      const result = applyArgumentPreprocessing(originalArgv);
      
      // Check that argv was modified
      expect(process.argv[3]).toBe('--env');
      expect(result.hadDeprecatedEnv).toBe(true);
    });

    it('should preserve node and script path in process.argv', () => {
      const originalArgv = ['node', 'file.js', '-env', 'prod'];
      applyArgumentPreprocessing(originalArgv);
      
      expect(process.argv[0]).toBe('node');
      expect(process.argv[1]).toBe('file.js');
    });
  });

  describe('addCommonOptions', () => {
    it('should add verbose option to command', () => {
      const cmd = new Command();
      const result = addCommonOptions(cmd);
      
      // Parse to verify option was added
      result.parse(['node', 'file.js', '-V']);
      const opts = result.opts();
      expect(opts.verbose).toBe(true);
    });

    it('should add timeout option with validation', () => {
      const cmd = new Command();
      addCommonOptions(cmd);
      
      expect(() => {
        cmd.parse(['node', 'file.js', '-t', 'not-a-number']);
      }).toThrow();
    });

    it('should reject non-positive timeout values', () => {
      const cmd = new Command();
      addCommonOptions(cmd);
      
      expect(() => {
        cmd.parse(['node', 'file.js', '-t', '0']);
      }).toThrow();
    });

    it('should accept positive timeout values', () => {
      const cmd = new Command();
      const result = addCommonOptions(cmd);
      result.parse(['node', 'file.js', '-t', '5000']);
      const opts = result.opts();
      expect(opts.timeout).toBe('5000');
    });
  });

  describe('addPathAndEnvironmentOptions', () => {
    it('should add path, environment, and common options', () => {
      const cmd = new Command();
      const result = addPathAndEnvironmentOptions(cmd);
      
      result.parse(['node', 'file.js', '--path', '/tmp', '--environment', 'prod', '-V']);
      const opts = result.opts();
      expect(opts.path).toBe('/tmp');
      expect(opts.environment).toBe('prod');
      expect(opts.verbose).toBe(true);
    });

    it('should support deprecated --env option', () => {
      const cmd = new Command();
      const result = addPathAndEnvironmentOptions(cmd);
      
      result.parse(['node', 'file.js', '--path', '/tmp', '--env', 'prod']);
      const opts = result.opts();
      expect(opts.env).toBe('prod');
    });
  });
});
