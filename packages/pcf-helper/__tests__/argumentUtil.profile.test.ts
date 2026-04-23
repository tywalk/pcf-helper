import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  resolvePathAndEnvironment,
  resolveProfileOnly,
} from '../util/argumentUtil';
import { PcfHelperConfig } from '../util/configUtil';

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

function setFakeFiles(files: Record<string, string>) {
  mockFs.existsSync.mockImplementation((p) => Object.prototype.hasOwnProperty.call(files, p.toString()));
  mockFs.readFileSync.mockImplementation((p, _encoding) => {
    const key = p.toString();
    if (!(key in files)) throw new Error(`ENOENT: ${key}`);
    return files[key];
  });
}

describe('argumentUtil profile resolution', () => {
  const HOME = '/home/tester';
  const CWD = '/workspace/proj';
  const projectCfgPath = path.join(CWD, 'pcf-helper.config.json');

  beforeEach(() => {
    jest.clearAllMocks();
    mockOs.homedir.mockReturnValue(HOME);
    jest.spyOn(process, 'cwd').mockReturnValue(CWD);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('resolvePathAndEnvironment', () => {
    it('CLI flags win over profile values', () => {
      const cfg: PcfHelperConfig = {
        defaultProfile: 'dev',
        profiles: { dev: { path: '/from/profile', environment: 'DevOrg' } },
      };
      setFakeFiles({ [projectCfgPath]: JSON.stringify(cfg) });

      const result = resolvePathAndEnvironment(
        { path: '/from/cli', environment: 'OverrideOrg' },
        false,
      );
      expect(result.path).toBe('/from/cli');
      expect(result.environment).toBe('OverrideOrg');
      expect(result.profileName).toBe('dev');
    });

    it('falls back to profile values when CLI flags are omitted', () => {
      const cfg: PcfHelperConfig = {
        defaultProfile: 'dev',
        profiles: { dev: { path: '/from/profile', environment: 'DevOrg' } },
      };
      setFakeFiles({ [projectCfgPath]: JSON.stringify(cfg) });

      const result = resolvePathAndEnvironment({}, false);
      expect(result.path).toBe('/from/profile');
      expect(result.environment).toBe('DevOrg');
    });

    it('uses an explicitly requested profile over defaultProfile', () => {
      const cfg: PcfHelperConfig = {
        defaultProfile: 'dev',
        profiles: {
          dev: { path: '/dev/path', environment: 'DevOrg' },
          prod: { path: '/prod/path', environment: 'ProdOrg' },
        },
      };
      setFakeFiles({ [projectCfgPath]: JSON.stringify(cfg) });

      const result = resolvePathAndEnvironment({ profile: 'prod' }, false);
      expect(result.path).toBe('/prod/path');
      expect(result.environment).toBe('ProdOrg');
      expect(result.profileName).toBe('prod');
    });

    it('throws a helpful error when requested profile is unknown', () => {
      const cfg: PcfHelperConfig = { profiles: { dev: {} } };
      setFakeFiles({ [projectCfgPath]: JSON.stringify(cfg) });

      expect(() => resolvePathAndEnvironment({ profile: 'nope' }, false)).toThrow(/Profile "nope" not found/);
    });

    it('returns empty strings when no CLI flags, no profile, no config', () => {
      setFakeFiles({});
      const result = resolvePathAndEnvironment({}, false);
      expect(result.path).toBe('');
      expect(result.environment).toBe('');
      expect(result.profileName).toBeUndefined();
    });

    it('deprecated --env still works and shows up in resolved environment', () => {
      setFakeFiles({});
      const result = resolvePathAndEnvironment({ env: 'LegacyOrg' }, true);
      expect(result.environment).toBe('LegacyOrg');
    });
  });

  describe('resolveProfileOnly', () => {
    it('returns the resolved profile when one is configured', () => {
      const cfg: PcfHelperConfig = {
        profiles: {
          init: { publisherName: 'MyPub', publisherPrefix: 'mp' },
        },
      };
      setFakeFiles({ [projectCfgPath]: JSON.stringify(cfg) });

      const result = resolveProfileOnly('init');
      expect(result.profileName).toBe('init');
      expect(result.profile?.publisherName).toBe('MyPub');
    });

    it('returns undefined profile when none requested and no default', () => {
      setFakeFiles({});
      const result = resolveProfileOnly();
      expect(result.profileName).toBeUndefined();
      expect(result.profile).toBeUndefined();
    });
  });
});
