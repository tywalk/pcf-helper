/// <reference types="jest" />
/// <reference types="node" />

import { runInit } from '../tasks/init-pcf';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import logger from '@tywalk/color-logger';

jest.mock('child_process');
jest.mock('fs');
jest.mock('@tywalk/color-logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

const mockSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('init-pcf task', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSpawnSync.mockReturnValue({
      status: 0,
      signal: null
    } as any);
    (mockFs.readdirSync as any).mockReturnValue([]);
    mockFs.existsSync.mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('runInit validation', () => {
    it('should return error code 1 for invalid template', () => {
      const result = runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'invalid-template',
        'react',
        true,
        false
      );

      expect(result).toBe(1);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid template')
      );
    });

    it('should return error code 1 for invalid framework', () => {
      const result = runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'invalid-framework',
        true,
        false
      );

      expect(result).toBe(1);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid framework')
      );
    });

    it('should accept valid templates: field and dataset', () => {
      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);
      (mockFs.readdirSync as any).mockReturnValue([]);

      const resultField = runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      // Should proceed past validation (might fail later on spawn, but not validation)
      expect(logger.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Invalid template')
      );
    });

    it('should accept valid frameworks: none and react', () => {
      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);

      const resultNone = runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'none',
        true,
        false
      );

      expect(logger.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Invalid framework')
      );
    });

    it('should use default path from process.cwd() if not provided', () => {
      const cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue('/default/path');

      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);
      (mockFs.readdirSync as any).mockReturnValue([]);

      runInit(
        '',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      expect(cwdSpy).toHaveBeenCalled();
      cwdSpy.mockRestore();
    });

    it('should pass correct parameters to pac pcf init command', () => {
      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);
      mockFs.readdirSync.mockReturnValue([]);

      runInit(
        '/test/path',
        'MyControl',
        'MyPublisher',
        'mp',
        'dataset',
        'react',
        true,
        false
      );

      expect(mockSpawnSync).toHaveBeenCalledWith(
        'pac pcf init',
        expect.arrayContaining([
          '-ns', 'mp',
          '-n', 'MyControl',
          '-t', 'dataset',
          '-fw', 'react',
          '-o', '/test/path',
          '-npm', 'true'
        ]),
        expect.any(Object)
      );
    });

    it('should pass npm false when npm install is disabled', () => {
      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);
      mockFs.readdirSync.mockReturnValue([]);

      runInit(
        '/test/path',
        'MyControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        false,
        false
      );

      expect(mockSpawnSync).toHaveBeenCalledWith(
        'pac pcf init',
        expect.arrayContaining(['-npm', 'false']),
        expect.any(Object)
      );
    });

    it('should return error if pac pcf init fails', () => {
      mockSpawnSync.mockReturnValue({
        status: 1,
        signal: null,
        error: new Error('init failed')
      } as any);

      const result = runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      // Should exit with error from init task
      expect(result).toBe(1);
    });
  });

  describe('pcfExistsInParent logic', () => {
    it('should detect .pcfproj file at current level', () => {
      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);

      // First call (at root) returns .pcfproj file
      (mockFs.readdirSync as any)
        .mockReturnValueOnce(['.pcfproj'])
        .mockReturnValueOnce(['.pcfproj', 'Solutions']);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.realpathSync.mockReturnValue('/test/path');

      runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      // Should find PCF project at root
      expect(mockFs.readdirSync).toHaveBeenCalled();
    });

    it('should throw error if PCF project not found within 3 levels', () => {
      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);

      // No .pcfproj found at any level
      (mockFs.readdirSync as any).mockReturnValue(['package.json', 'tsconfig.json']);

      const result = runInit(
        '/deep/nested/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      // Should return error
      expect(result).toBe(1);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unable to locate PCF project')
      );
    });

    it('should create Solutions folder path if PCF exists at root', () => {
      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);

      // PCF exists at root
      (mockFs.readdirSync as any)
        .mockReturnValueOnce(['control.pcfproj'])
        .mockReturnValueOnce(['control.pcfproj', 'Solutions']);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.realpathSync.mockReturnValue('/test/path');

      runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      const callArgs = mockSpawnSync.mock.calls.find((call) =>
        call[0]?.includes('solution init')
      );

      expect(callArgs).toBeDefined();
      if (callArgs) {
        const hasSolutionsPath = (callArgs[1] as string[]).some((arg) => arg.includes('Solutions'));
        expect(hasSolutionsPath).toBe(true);
      }
    });
  });

  describe('solution initialization', () => {
    it('should create solution if pcf init succeeds', () => {
      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);
      (mockFs.readdirSync as any).mockReturnValue(['control.pcfproj']);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.realpathSync.mockReturnValue('/test/path');

      runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      const solutionInitCall = mockSpawnSync.mock.calls.find((call) =>
        call[0]?.includes('solution init')
      );
      expect(solutionInitCall).toBeDefined();
    });

    it('should add solution reference to pcf project', () => {
      mockSpawnSync.mockReturnValue({
        status: 0,
        signal: null
      } as any);
      (mockFs.readdirSync as any).mockReturnValue(['control.pcfproj']);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.realpathSync.mockReturnValue('/test/path');

      runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      const hasAddRefCall = mockSpawnSync.mock.calls.some((call) =>
        call[0] === 'pac solution add-reference'
      );
      expect(hasAddRefCall).toBe(true);
    });

    it('should return error if solution init fails', () => {
      mockSpawnSync
        .mockReturnValueOnce({
          status: 0,
          signal: null
        } as any)
        .mockReturnValueOnce({
          status: 1,
          signal: null,
          error: new Error('solution init failed')
        } as any);

      (mockFs.readdirSync as any).mockReturnValue(['.pcfproj']);

      const result = runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      expect(result).toBe(1);
    });
  });

  describe('verbose logging', () => {
    it('should not log error details when verbose is false', () => {
      mockSpawnSync.mockReturnValue({
        status: 1,
        signal: null,
        error: new Error('some error')
      } as any);
      (mockFs.readdirSync as any).mockReturnValue([]);

      runInit(
        '/test/path',
        'myControl',
        'MyPublisher',
        'mp',
        'field',
        'react',
        true,
        false
      );

      expect(logger.debug).not.toHaveBeenCalledWith(expect.stringContaining('stack'));
    });
  });
});
