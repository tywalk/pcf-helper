import {
  formatMsToSec,
  formatTime,
  handleTaskCompletion
} from '../util/performanceUtil';
import logger from '@tywalk/color-logger';

jest.mock('@tywalk/color-logger', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
  }
}));

describe('performanceUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatMsToSec', () => {
    it('should format milliseconds to seconds with provided format string', () => {
      const result = formatMsToSec('Task completed in %is', 5000);
      expect(result).toBe('Task completed in 5s');
    });

    it('should handle decimal seconds', () => {
      const result = formatMsToSec('Duration: %is', 1500);
      expect(result).toBe('Duration: 1s'); // %i truncates to integer
    });

    it('should handle very small durations', () => {
      const result = formatMsToSec('Time: %is', 100);
      expect(result).toBe('Time: 0s'); // %i truncates to integer
    });

    it('should handle zero milliseconds', () => {
      const result = formatMsToSec('Time: %is', 0);
      expect(result).toBe('Time: 0s');
    });

    it('should work with util.format multiple placeholders', () => {
      const result = formatMsToSec('%s took %is', 5000);
      expect(result).toContain('5');
    });
  });

  describe('formatTime', () => {
    it('should format Date object to HH:MM:SS format', () => {
      const date = new Date('2024-01-15T14:30:45Z');
      const result = formatTime(date);
      
      // Result should match HH:MM:SS format (24-hour)
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should format current time', () => {
      const now = new Date();
      const result = formatTime(now);
      
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should be consistent for same date', () => {
      const date = new Date('2024-06-21T09:15:30Z');
      const result1 = formatTime(date);
      const result2 = formatTime(date);
      
      expect(result1).toBe(result2);
    });
  });

  describe('handleTaskCompletion', () => {
    it('should log success when task status is 0', () => {
      const task = { status: 0 } as any;
      
      handleTaskCompletion(task, 'build', 1000, false);
      
      expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('build complete'));
    });

    it('should log error when task status is not 0', () => {
      const task = { status: 1, signal: 'SIGTERM' } as any;
      
      handleTaskCompletion(task, 'deploy', 5000, false);
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle SIGTERM timeout case', () => {
      const task = { status: 1, signal: 'SIGTERM', error: new Error('timeout') } as any;
      
      handleTaskCompletion(task, 'import', 300000, false);
      
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('A timeout of 5 minutes was reached'),
        'timeout'
      );
    });

    it('should handle task error with message', () => {
      const error = new Error('build failed');
      const task = { status: 1, signal: 'SIGABRT', error } as any;
      
      handleTaskCompletion(task, 'build', 1000, false);
      
      expect(logger.error).toHaveBeenCalled();
    });

    it('should log debug info when verbose is true', () => {
      const task = { status: 1, signal: 'SIGTERM', error: new Error('error') } as any;
      
      handleTaskCompletion(task, 'upgrade', 2000, true);
      
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should format duration in debug output (success)', () => {
      const task = { status: 0 } as any;
      
      handleTaskCompletion(task, 'build', 3500, false);
      
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('3s'));
    });

    it('should handle task without error property', () => {
      const task = { status: 1 } as any;
      
      handleTaskCompletion(task, 'init', 1000, false);
      
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('One or more errors'));
    });

    it('should return status code', () => {
      const task = { status: 1 } as any;
      const result = handleTaskCompletion(task, 'build', 1000, false);
      expect(result).toBe(1);
    });

    it('should return 1 if task.status is null', () => {
      const task = { status: null } as any;
      const result = handleTaskCompletion(task, 'build', 1000, false);
      expect(result).toBe(1);
    });

    it('should return success status when status is 0', () => {
      const task = { status: 0 } as any;
      const result = handleTaskCompletion(task, 'build', 1000, false);
      expect(result).toBe(0);
    });
  });
});
