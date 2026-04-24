import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  buildProfileFromOptions,
  runProfileInit,
  PromptFn,
} from '../util/profileInitUtil';
import { PcfHelperConfig } from '../util/configUtil';

jest.mock('@tywalk/color-logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

/**
 * Build a mock prompt that returns a scripted list of answers in order.
 * If the script runs out we return '' (user skipped).
 */
function mockPrompt(answers: (string | undefined)[]): PromptFn {
  let i = 0;
  return async (_q, currentValue) => {
    const answer = answers[i++];
    if (answer === undefined) return currentValue ?? '';
    return answer;
  };
}

describe('buildProfileFromOptions', () => {
  it('non-interactive mode uses only passed flags, nothing else', async () => {
    const profile = await buildProfileFromOptions(
      {
        name: 'dev',
        environment: 'DevOrg',
        publisherName: 'Tyler W',
        nonInteractive: true,
      },
      mockPrompt([]),
    );
    expect(profile).toEqual({
      environment: 'DevOrg',
      publisherName: 'Tyler W',
    });
  });

  it('interactive mode uses prompt answers, overriding passed defaults', async () => {
    const profile = await buildProfileFromOptions(
      {
        name: 'dev',
        environment: 'DevOrg', // offered as default; user types 'OverrideOrg'
      },
      mockPrompt(['OverrideOrg', 'Tyler', 'tyw', './MySolution', '', '']),
    );
    expect(profile).toEqual({
      environment: 'OverrideOrg',
      publisherName: 'Tyler',
      publisherPrefix: 'tyw',
      path: './MySolution',
    });
    // Empty answers for template/framework must NOT appear in the profile.
    expect(profile.template).toBeUndefined();
    expect(profile.framework).toBeUndefined();
  });

  it('interactive mode: hitting enter keeps the default value', async () => {
    const profile = await buildProfileFromOptions(
      {
        name: 'dev',
        environment: 'DevOrg',
        publisherName: 'Tyler W',
        publisherPrefix: 'tyw',
      },
      // mockPrompt returns currentValue when the scripted answer is undefined.
      mockPrompt([undefined, undefined, undefined, undefined, undefined, undefined]),
    );
    expect(profile).toEqual({
      environment: 'DevOrg',
      publisherName: 'Tyler W',
      publisherPrefix: 'tyw',
    });
  });

  it('session fields only appear when at least one session flag was passed', async () => {
    const without = await buildProfileFromOptions(
      { name: 'dev', nonInteractive: true, environment: 'DevOrg' },
      mockPrompt([]),
    );
    expect(without.session).toBeUndefined();

    const withSession = await buildProfileFromOptions(
      {
        name: 'dev',
        nonInteractive: true,
        environment: 'DevOrg',
        sessionUrl: 'https://dev.example.com',
      },
      mockPrompt([]),
    );
    expect(withSession.session).toEqual({
      remoteEnvironmentUrl: 'https://dev.example.com',
    });
  });
});

describe('runProfileInit', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pcf-helper-runProfileInit-'));
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch {
      // best-effort
    }
  });

  it('writes a non-interactive profile end-to-end', async () => {
    const fakeHome = path.join(tmpRoot, 'fake-home');
    const spy = jest.spyOn(os, 'homedir').mockReturnValue(fakeHome);
    // Also redirect cwd so project-level writes land inside tmpRoot.
    const cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(tmpRoot);

    try {
      const result = await runProfileInit(
        {
          name: 'dev',
          environment: 'DevOrg',
          publisherName: 'Tyler W',
          publisherPrefix: 'tyw',
          path: './MySolution',
          setDefault: true,
          nonInteractive: true,
        },
        mockPrompt([]),
      );

      expect(result.createdFile).toBe(true);
      expect(result.filePath).toBe(path.join(tmpRoot, 'pcf-helper.config.json'));

      const onDisk = JSON.parse(fs.readFileSync(result.filePath, 'utf8')) as PcfHelperConfig;
      expect(onDisk.defaultProfile).toBe('dev');
      expect(onDisk.profiles?.dev).toEqual({
        environment: 'DevOrg',
        publisherName: 'Tyler W',
        publisherPrefix: 'tyw',
        path: './MySolution',
      });
    } finally {
      spy.mockRestore();
      cwdSpy.mockRestore();
    }
  });

  it('propagates the force-required error when name already exists', async () => {
    const cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(tmpRoot);
    try {
      fs.writeFileSync(
        path.join(tmpRoot, 'pcf-helper.config.json'),
        JSON.stringify({ profiles: { dev: { environment: 'DevOrg' } } }, null, 2),
      );

      await expect(
        runProfileInit(
          { name: 'dev', environment: 'NewDevOrg', nonInteractive: true },
          mockPrompt([]),
        ),
      ).rejects.toThrow(/already exists/);
    } finally {
      cwdSpy.mockRestore();
    }
  });

  it('throws helpful error when name is blank', async () => {
    await expect(
      runProfileInit({ name: '', nonInteractive: true }, mockPrompt([])),
    ).rejects.toThrow(/name is required/);
  });
});
