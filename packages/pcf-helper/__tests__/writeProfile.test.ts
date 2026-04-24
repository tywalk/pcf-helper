import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  writeProfile,
  PcfHelperConfig,
} from '../util/configUtil';

jest.mock('@tywalk/color-logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('writeProfile', () => {
  let tmpRoot: string;

  beforeEach(() => {
    // Real filesystem temp dir — this lets us exercise actual atomic rename semantics.
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pcf-helper-writeProfile-'));
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  });

  it('creates a new project config file when none exists', () => {
    const cwd = tmpRoot;
    const result = writeProfile(
      'dev',
      { environment: 'DevOrg', publisherName: 'Tyler W', publisherPrefix: 'tyw' },
      { cwd },
    );

    expect(result.createdFile).toBe(true);
    expect(result.replacedProfile).toBe(false);
    expect(result.filePath).toBe(path.join(cwd, 'pcf-helper.config.json'));

    const onDisk = JSON.parse(fs.readFileSync(result.filePath, 'utf8')) as PcfHelperConfig;
    expect(onDisk.profiles?.dev).toEqual({
      environment: 'DevOrg',
      publisherName: 'Tyler W',
      publisherPrefix: 'tyw',
    });
  });

  it('merges a new profile into an existing config without touching other profiles', () => {
    const cwd = tmpRoot;
    const configPath = path.join(cwd, 'pcf-helper.config.json');
    const existing: PcfHelperConfig = {
      defaultProfile: 'dev',
      profiles: {
        dev: { environment: 'DevOrg' },
      },
      session: { remoteEnvironmentUrl: 'https://dev.example.com' },
    };
    fs.writeFileSync(configPath, JSON.stringify(existing, null, 2));

    const result = writeProfile(
      'prod',
      { environment: 'ProdOrg' },
      { cwd },
    );

    expect(result.createdFile).toBe(false);
    expect(result.replacedProfile).toBe(false);

    const onDisk = JSON.parse(fs.readFileSync(result.filePath, 'utf8')) as PcfHelperConfig;
    expect(onDisk.profiles?.dev).toEqual({ environment: 'DevOrg' });
    expect(onDisk.profiles?.prod).toEqual({ environment: 'ProdOrg' });
    expect(onDisk.defaultProfile).toBe('dev');
    expect(onDisk.session).toEqual({ remoteEnvironmentUrl: 'https://dev.example.com' });
  });

  it('refuses to overwrite an existing profile without force', () => {
    const cwd = tmpRoot;
    const configPath = path.join(cwd, 'pcf-helper.config.json');
    const existing: PcfHelperConfig = {
      profiles: { dev: { environment: 'DevOrg' } },
    };
    fs.writeFileSync(configPath, JSON.stringify(existing, null, 2));

    expect(() =>
      writeProfile('dev', { environment: 'NewDevOrg' }, { cwd }),
    ).toThrow(/already exists/);

    // File must be unchanged.
    const onDisk = JSON.parse(fs.readFileSync(configPath, 'utf8')) as PcfHelperConfig;
    expect(onDisk.profiles?.dev).toEqual({ environment: 'DevOrg' });
  });

  it('overwrites an existing profile when force is set', () => {
    const cwd = tmpRoot;
    const configPath = path.join(cwd, 'pcf-helper.config.json');
    const existing: PcfHelperConfig = {
      profiles: { dev: { environment: 'DevOrg' } },
    };
    fs.writeFileSync(configPath, JSON.stringify(existing, null, 2));

    const result = writeProfile(
      'dev',
      { environment: 'NewDevOrg', publisherName: 'Tyler' },
      { cwd, force: true },
    );

    expect(result.replacedProfile).toBe(true);
    const onDisk = JSON.parse(fs.readFileSync(configPath, 'utf8')) as PcfHelperConfig;
    expect(onDisk.profiles?.dev).toEqual({
      environment: 'NewDevOrg',
      publisherName: 'Tyler',
    });
  });

  it('writes defaultProfile when setDefault is passed', () => {
    const cwd = tmpRoot;
    const result = writeProfile(
      'prod',
      { environment: 'ProdOrg' },
      { cwd, setDefault: true },
    );

    const onDisk = JSON.parse(fs.readFileSync(result.filePath, 'utf8')) as PcfHelperConfig;
    expect(onDisk.defaultProfile).toBe('prod');
  });

  it('creates the parent directory for the global config on first use', () => {
    const fakeHome = path.join(tmpRoot, 'fake-home');
    // Mock homedir via jest.spyOn so getGlobalConfigPath returns a path inside tmpRoot.
    const spy = jest.spyOn(os, 'homedir').mockReturnValue(fakeHome);
    try {
      // Parent dir (~/.pcf-helper) intentionally does not exist.
      expect(fs.existsSync(path.join(fakeHome, '.pcf-helper'))).toBe(false);

      const result = writeProfile(
        'dev',
        { environment: 'DevOrg' },
        { global: true },
      );

      expect(result.filePath).toBe(path.join(fakeHome, '.pcf-helper', 'config.json'));
      expect(result.createdFile).toBe(true);
      expect(fs.existsSync(result.filePath)).toBe(true);

      const onDisk = JSON.parse(fs.readFileSync(result.filePath, 'utf8')) as PcfHelperConfig;
      expect(onDisk.profiles?.dev).toEqual({ environment: 'DevOrg' });
    } finally {
      spy.mockRestore();
    }
  });

  it('throws when profile name is empty', () => {
    expect(() => writeProfile('', { environment: 'X' }, { cwd: tmpRoot })).toThrow(/name is required/);
    expect(() => writeProfile('   ', { environment: 'X' }, { cwd: tmpRoot })).toThrow(/name is required/);
  });

  it('leaves no temp file behind on success', () => {
    const cwd = tmpRoot;
    writeProfile('dev', { environment: 'DevOrg' }, { cwd });

    const entries = fs.readdirSync(cwd);
    const tmpFiles = entries.filter((f) => f.startsWith('pcf-helper.config.json.tmp'));
    expect(tmpFiles).toEqual([]);
  });
});
