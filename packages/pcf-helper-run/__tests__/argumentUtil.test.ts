import { getArg, getArgValue } from '../util/argumentUtil';

describe('pcf-helper-run argumentUtil', () => {
  describe('getArg', () => {
    it('should return the argument value if found', () => {
      const args = ['-p', '/path/to/project', '-v'];
      expect(getArg(args, '-p')).toBe('/path/to/project');
    });

    it('should return undefined if argument not found', () => {
      const args = ['-p', '/path/to/project'];
      expect(getArg(args, '-v')).toBeUndefined();
    });

    it('should return undefined if argument is at the end with no value', () => {
      const args = ['-p', '/path/to/project', '-v'];
      expect(getArg(args, '-v')).toBeUndefined();
    });

    it('should handle empty args', () => {
      const args: string[] = [];
      expect(getArg(args, '-p')).toBeUndefined();
    });

    it('should find value after flag', () => {
      const args = ['build', '-p', '/project', 'deploy'];
      expect(getArg(args, '-p')).toBe('/project');
    });

    it('should return undefined for flag at end of array', () => {
      const args = ['build', '-v', '-p'];
      expect(getArg(args, '-p')).toBeUndefined();
    });
  });

  describe('getArgValue', () => {
    it('should return value for matching option', () => {
      const args = ['-n', 'controlName'];
      expect(getArgValue(args, ['-n'])).toBe('controlName');
    });

    it('should return value for long form option', () => {
      const args = ['--name', 'controlName'];
      expect(getArgValue(args, ['--name'])).toBe('controlName');
    });

    it('should find first matching option from list', () => {
      const args = ['--publisher-name', 'MyPub'];
      expect(getArgValue(args, ['-pn', '--publisher-name'])).toBe('MyPub');
    });

    it('should return default if not found', () => {
      const args = ['-p', '/path'];
      expect(getArgValue(args, ['-n', '--name'], 'default')).toBe('default');
    });

    it('should return undefined if not found and no default', () => {
      const args = ['-p', '/path'];
      expect(getArgValue(args, ['-n'])).toBeUndefined();
    });

    it('should prioritize first matching option', () => {
      const args = ['-e', 'env1', '-e', 'env2'];
      expect(getArgValue(args, ['-e'])).toBe('env1');
    });

    it('should handle value at end bounds', () => {
      const args = ['command', '-t', 'value'];
      expect(getArgValue(args, ['-t'])).toBe('value');
    });

    it('should return undefined if flag has no value', () => {
      const args = ['-n'];
      expect(getArgValue(args, ['-n'])).toBeUndefined();
    });

    it('should handle multiple aliases', () => {
      const args = ['--environment', 'prod'];
      expect(getArgValue(args, ['-e', '--environment'])).toBe('prod');
    });

    it('should find short option when long form not present', () => {
      const args = ['-e', 'test'];
      expect(getArgValue(args, ['-e', '--environment'])).toBe('test');
    });
  });

  describe('complex argument patterns', () => {
    it('should parse build command arguments', () => {
      const args = ['build', '-p', '/path/to/project', '-t', '30000', '-v'];
      expect(getArg(args, '-p')).toBe('/path/to/project');
      expect(getArg(args, '-t')).toBe('30000');
    });

    it('should parse deploy command with environment', () => {
      const args = ['deploy', '-p', '/path', '-e', 'prod'];
      expect(getArg(args, '-p')).toBe('/path');
      expect(getArg(args, '-e')).toBe('prod');
    });

    it('should parse init command with multiple options', () => {
      const args = ['init', '-p', '/path', '-n', 'MyControl', '--publisher-name', 'Publisher'];
      expect(getArg(args, '-p')).toBe('/path');
      expect(getArg(args, '-n')).toBe('MyControl');
      expect(getArg(args, '--publisher-name')).toBe('Publisher');
    });

    it('should handle boolean flags (no value)', () => {
      const args = ['build', '-v', '--watch'];
      expect(getArg(args, '-v')).toBeUndefined(); // -v flag has no value
      expect(getArg(args, '--watch')).toBeUndefined();
    });

    it('should parse deprecated -env flag', () => {
      const args = ['import', '-p', '/path', '-env', 'prod'];
      expect(getArg(args, '-env')).toBe('prod');
    });

    it('should handle paths with special characters', () => {
      const args = ['-p', 'C:\\Users\\test\\project', '-n', 'My-Control.v2'];
      expect(getArg(args, '-p')).toBe('C:\\Users\\test\\project');
      expect(getArg(args, '-n')).toBe('My-Control.v2');
    });

    it('should handle URLs as argument values', () => {
      const args = ['-u', 'https://tenant.crm.dynamics.com', '-s', 'https://cdn.example.com/bundle.js'];
      expect(getArg(args, '-u')).toBe('https://tenant.crm.dynamics.com');
      expect(getArg(args, '-s')).toBe('https://cdn.example.com/bundle.js');
    });
  });
});
