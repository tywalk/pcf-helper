import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  loadPcfHelperConfig,
  resolveProfile,
  mergeSessionConfig,
  getGlobalConfigPath,
  getProjectConfigPath,
  PcfHelperConfig,
} from '../util/configUtil';

jest.mock('fs');
jest.mock('os');
jest.mock('@tywalk/color-logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockOs = os as jest.Mocked<typeof os>;

/**
 * Wires fs.existsSync/readFileSync to a map of path → file contents. Any path
 * not in the map behaves as if the file does not exist.
 */
function setFakeFiles(files: Record<string, string>) {
  mockFs.existsSync.mockImplementation((p) => Object.prototype.hasOwnProperty.call(files, p.toString()));
  mockFs.readFileSync.mockImplementation((p, _encoding) => {
    const key = p.toString();
    if (!(key in files)) throw new Error(`ENOENT: ${key}`);
    return files[key];
  });
}

describe('configUtil', () => {
  const HOME = '/home/tester';
  const CWD = '/workspace/proj';

  beforeEach(() => {
    jest.clearAllMocks();
    mockOs.homedir.mockReturnValue(HOME);
    jest.spyOn(process, 'cwd').mockReturnValue(CWD);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('path helpers', () => {
    it('resolves the global config under the user home directory', () => {
      expect(getGlobalConfigPath()).toBe(path.join(HOME, '.pcf-helper', 'config.json'));
    });

    it('resolves the project config at the provided cwd', () => {
      expect(getProjectConfigPath('/some/cwd')).toBe(path.join('/some/cwd', 'pcf-helper.config.json'));
    });
  });

  describe('loadPcfHelperConfig', () => {
    it('returns empty merged config when neither file exists', () => {
      setFakeFiles({});
      const loaded = loadPcfHelperConfig();
      expect(loaded.sources).toEqual([]);
      expect(loaded.merged.profiles).toEqual({});
      expect(loaded.merged.defaultProfile).toBeUndefined();
    });

    it('loads only from project when global is missing', () => {
      const projectCfg: PcfHelperConfig = {
        defaultProfile: 'dev',
        profiles: { dev: { environment: 'DevOrg' } },
      };
      setFakeFiles({
        [path.join(CWD, 'pcf-helper.config.json')]: JSON.stringify(projectCfg),
      });
      const loaded = loadPcfHelperConfig();
      expect(loaded.sources).toHaveLength(1);
      expect(loaded.merged.defaultProfile).toBe('dev');
      expect(loaded.merged.profiles?.dev?.environment).toBe('DevOrg');
    });

    it('merges profiles by name — project value wins on collision', () => {
      const globalCfg: PcfHelperConfig = {
        profiles: {
          dev: { environment: 'GlobalDev', publisherName: 'GlobalPub' },
          prod: { environment: 'GlobalProd' },
        },
      };
      const projectCfg: PcfHelperConfig = {
        profiles: {
          dev: { environment: 'ProjectDev' }, // overrides
        },
      };
      setFakeFiles({
        [path.join(HOME, '.pcf-helper', 'config.json')]: JSON.stringify(globalCfg),
        [path.join(CWD, 'pcf-helper.config.json')]: JSON.stringify(projectCfg),
      });
      const loaded = loadPcfHelperConfig();
      // Project dev beats global dev (whole-object replacement by design)
      expect(loaded.merged.profiles?.dev?.environment).toBe('ProjectDev');
      // Global-only profile is still present
      expect(loaded.merged.profiles?.prod?.environment).toBe('GlobalProd');
    });

    it('projects defaultProfile wins over global defaultProfile', () => {
      setFakeFiles({
        [path.join(HOME, '.pcf-helper', 'config.json')]: JSON.stringify({ defaultProfile: 'a' }),
        [path.join(CWD, 'pcf-helper.config.json')]: JSON.stringify({ defaultProfile: 'b' }),
      });
      expect(loadPcfHelperConfig().merged.defaultProfile).toBe('b');
    });

    it('treats malformed JSON as empty and does not throw', () => {
      setFakeFiles({
        [path.join(CWD, 'pcf-helper.config.json')]: 'not json {{{',
      });
      const loaded = loadPcfHelperConfig();
      expect(loaded.merged.profiles).toEqual({});
    });

    it('merges top-level session blocks field-by-field', () => {
      setFakeFiles({
        [path.join(HOME, '.pcf-helper', 'config.json')]: JSON.stringify({
          session: { remoteEnvironmentUrl: 'https://global', startWatch: true },
        }),
        [path.join(CWD, 'pcf-helper.config.json')]: JSON.stringify({
          session: { remoteEnvironmentUrl: 'https://project' },
        }),
      });
      const loaded = loadPcfHelperConfig();
      expect(loaded.merged.session?.remoteEnvironmentUrl).toBe('https://project');
      expect(loaded.merged.session?.startWatch).toBe(true);
    });
  });

  describe('resolveProfile', () => {
    const merged: PcfHelperConfig = {
      defaultProfile: 'dev',
      profiles: {
        dev: { environment: 'DevOrg' },
        prod: { environment: 'ProdOrg' },
      },
    };

    it('returns the requested profile by name', () => {
      const { name, profile } = resolveProfile('prod', merged);
      expect(name).toBe('prod');
      expect(profile?.environment).toBe('ProdOrg');
    });

    it('falls back to defaultProfile when no name is given', () => {
      const { name, profile } = resolveProfile(undefined, merged);
      expect(name).toBe('dev');
      expect(profile?.environment).toBe('DevOrg');
    });

    it('returns an empty result when no name and no default', () => {
      const { name, profile } = resolveProfile(undefined, { profiles: {} });
      expect(name).toBeUndefined();
      expect(profile).toBeUndefined();
    });

    it('throws a helpful error when the named profile is missing', () => {
      expect(() => resolveProfile('nope', merged)).toThrow(/Profile "nope" not found/);
    });
  });

  describe('mergeSessionConfig', () => {
    it('layers later values over earlier values', () => {
      const merged = mergeSessionConfig(
        { remoteEnvironmentUrl: 'low', startWatch: false },
        { remoteEnvironmentUrl: 'mid' },
        { startWatch: true },
      );
      expect(merged.remoteEnvironmentUrl).toBe('mid');
      expect(merged.startWatch).toBe(true);
    });

    it('skips undefined layers', () => {
      const merged = mergeSessionConfig(undefined, { remoteEnvironmentUrl: 'only' }, undefined);
      expect(merged.remoteEnvironmentUrl).toBe('only');
    });

    it('ignores undefined fields in a layer (does not wipe lower values)', () => {
      const merged = mergeSessionConfig(
        { remoteEnvironmentUrl: 'keep' },
        { remoteEnvironmentUrl: undefined as unknown as string, startWatch: true },
      );
      expect(merged.remoteEnvironmentUrl).toBe('keep');
      expect(merged.startWatch).toBe(true);
    });
  });
});
