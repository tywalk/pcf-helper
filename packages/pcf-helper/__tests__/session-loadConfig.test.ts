import { loadConfig } from '../tasks/session-pcf';
import * as fs from 'fs';
import * as path from 'path';
import logger from '@tywalk/color-logger';

jest.mock('fs');
jest.mock('path');
jest.mock('@tywalk/color-logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('session-pcf loadConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REMOTE_ENVIRONMENT_URL;
    delete process.env.REMOTE_SCRIPT_TO_INTERCEPT;
    delete process.env.REMOTE_STYLESHEET_TO_INTERCEPT;
    delete process.env.LOCAL_CSS_PATH;
    delete process.env.LOCAL_BUNDLE_PATH;
    delete process.env.START_WATCH;
    
    mockPath.join.mockImplementation((...args) => args.join('/'));
    jest.spyOn(process, 'cwd').mockReturnValue('/test/cwd');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('config file loading', () => {
    it('should load config from default session.config.json', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com',
        remoteScriptToIntercept: '/static/bundle.js',
        remoteStylesheetToIntercept: '/static/style.css',
        localBundlePath: '/local/bundle.js',
        localCssPath: '/local/style.css'
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.remoteEnvironmentUrl).toBe('https://example.crm.dynamics.com');
      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.readFileSync).toHaveBeenCalled();
    });

    it('should load config from custom config file path', () => {
      const config = {
        remoteEnvironmentUrl: 'https://custom.crm.dynamics.com',
        remoteScriptToIntercept: 'custom-bundle.js',
        localBundlePath: '/custom/bundle.js',
        localCssPath: '/custom/style.css'
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig('custom.config.json');

      expect(result.remoteEnvironmentUrl).toBe('https://custom.crm.dynamics.com');
    });

    it('should return empty object if config file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = loadConfig();

      expect(result).toEqual({});
    });

    it('should log error if config file is invalid JSON', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{ invalid json }');

      const result = loadConfig();

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse config file')
      );
      expect(result).toEqual({});
    });

    it('should log warning if config file not found and no env vars', () => {
      mockFs.existsSync.mockReturnValue(false);

      loadConfig();

      expect(logger.warn).not.toHaveBeenCalled(); // Returns empty, no warning since it checks for env vars
    });

    it('should log config when file is loaded successfully', () => {
      const config = { remoteEnvironmentUrl: 'https://example.crm.dynamics.com' };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      loadConfig();

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Loaded config file')
      );
    });
  });

  describe('environment variable overrides', () => {
    it('should use REMOTE_ENVIRONMENT_URL env var if set', () => {
      process.env.REMOTE_ENVIRONMENT_URL = 'https://env.crm.dynamics.com';
      mockFs.existsSync.mockReturnValue(false);

      const result = loadConfig();

      expect(result.remoteEnvironmentUrl).toBe('https://env.crm.dynamics.com');
    });

    it('should use REMOTE_SCRIPT_TO_INTERCEPT env var if set', () => {
      process.env.REMOTE_ENVIRONMENT_URL = 'https://env.crm.dynamics.com';
      process.env.REMOTE_SCRIPT_TO_INTERCEPT = 'https://example.com/env-bundle.js';
      mockFs.existsSync.mockReturnValue(false);

      const result = loadConfig();

      expect(result.remoteScriptToIntercept).toBe('https://example.com/env-bundle.js');
    });

    it('should use LOCAL_CSS_PATH env var if set', () => {
      process.env.REMOTE_ENVIRONMENT_URL = 'https://env.crm.dynamics.com';
      process.env.LOCAL_CSS_PATH = '/env/style.css';
      mockFs.existsSync.mockReturnValue(false);

      const result = loadConfig();

      expect(result.localCssPath).toBe('/env/style.css');
    });

    it('should use LOCAL_BUNDLE_PATH env var if set', () => {
      process.env.REMOTE_ENVIRONMENT_URL = 'https://env.crm.dynamics.com';
      process.env.LOCAL_BUNDLE_PATH = '/env/bundle.js';
      mockFs.existsSync.mockReturnValue(false);

      const result = loadConfig();

      expect(result.localBundlePath).toBe('/env/bundle.js');
    });

    it('should prefer env var over config file value', () => {
      const config = {
        remoteEnvironmentUrl: 'https://config.crm.dynamics.com'
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      process.env.REMOTE_ENVIRONMENT_URL = 'https://env.crm.dynamics.com';

      const result = loadConfig();

      expect(result.remoteEnvironmentUrl).toBe('https://env.crm.dynamics.com');
    });
  });

  describe('URL normalization and path construction', () => {
    it('should construct full URL from base URL and relative script path', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com',
        remoteScriptToIntercept: 'webresources/bundle.js'
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.remoteScriptToIntercept).toBe('https://example.crm.dynamics.com/webresources/bundle.js');
    });

    it('should handle script path that already starts with /', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com',
        remoteScriptToIntercept: '/webresources/bundle.js'
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.remoteScriptToIntercept).toBe('https://example.crm.dynamics.com/webresources/bundle.js');
    });

    it('should not add duplicate slashes when base URL has trailing slash', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com/',
        remoteScriptToIntercept: '/webresources/bundle.js'
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.remoteScriptToIntercept).toBe('https://example.crm.dynamics.com/webresources/bundle.js');
      expect(result.remoteScriptToIntercept).not.toContain('//webresources');
    });

    it('should keep full URLs unchanged', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com',
        remoteScriptToIntercept: 'https://cdn.example.com/bundle.js'
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.remoteScriptToIntercept).toBe('https://cdn.example.com/bundle.js');
    });

    it('should handle stylesheet path normalization', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com',
        remoteStylesheetToIntercept: 'webresources/style.css'
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.remoteStylesheetToIntercept).toBe('https://example.crm.dynamics.com/webresources/style.css');
    });

    it('should not attempt URL construction if base URL is missing', () => {
      const config = {
        remoteScriptToIntercept: 'webresources/bundle.js'
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      // Should remain as is since no base URL
      expect(result.remoteScriptToIntercept).toBe('webresources/bundle.js');
    });

    it('should not attempt URL construction if script is empty', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com',
        remoteScriptToIntercept: ''
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      // Should remain empty
      expect(result.remoteScriptToIntercept).toBe('');
    });
  });

  describe('watch flag handling', () => {
    it('should set startWatch to true if config has it', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com',
        startWatch: true
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.startWatch).toBe(true);
    });

    it('should set startWatch to false if config has it false', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com',
        startWatch: false
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.startWatch).toBe(false);
    });

    it('should check START_WATCH env var', () => {
      process.env.REMOTE_ENVIRONMENT_URL = 'https://env.crm.dynamics.com';
      process.env.START_WATCH = 'true';
      mockFs.existsSync.mockReturnValue(false);

      const result = loadConfig();

      expect(result.startWatch).toBe(true);
    });

    it('should set startWatch to false if START_WATCH env var is not true', () => {
      process.env.REMOTE_ENVIRONMENT_URL = 'https://env.crm.dynamics.com';
      process.env.START_WATCH = 'false';
      mockFs.existsSync.mockReturnValue(false);

      const result = loadConfig();

      expect(result.startWatch).toBe(false);
    });

    it('should default startWatch to false', () => {
      process.env.REMOTE_ENVIRONMENT_URL = 'https://env.crm.dynamics.com';
      mockFs.existsSync.mockReturnValue(false);

      const result = loadConfig();

      expect(result.startWatch).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle config with only some fields present', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com'
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.remoteEnvironmentUrl).toBe('https://example.crm.dynamics.com');
      expect(result.remoteScriptToIntercept).toBeUndefined();
    });

    it('should handle empty config file', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{}');

      const result = loadConfig();

      expect(result).toEqual({
        remoteEnvironmentUrl: undefined,
        remoteScriptToIntercept: undefined,
        remoteStylesheetToIntercept: undefined,
        localCssPath: undefined,
        localBundlePath: undefined,
        startWatch: false,
      });
    });

    it('should handle config file with extra fields', () => {
      const config = {
        remoteEnvironmentUrl: 'https://example.crm.dynamics.com',
        extraField: 'should be ignored'
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = loadConfig();

      expect(result.remoteEnvironmentUrl).toBe('https://example.crm.dynamics.com');
    });
  });
});
