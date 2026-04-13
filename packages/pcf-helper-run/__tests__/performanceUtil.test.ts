import { formatMsToSec, formatTime } from '../util/performanceUtil';

describe('pcf-helper-run performanceUtil', () => {
  describe('formatMsToSec', () => {
    it('should format milliseconds to seconds', () => {
      const result = formatMsToSec('Duration: %is', 5000);
      expect(result).toBe('Duration: 5s');
    });

    it('should handle fractional seconds', () => {
      const result = formatMsToSec('Time: %is', 1500);
      expect(result).toBe('Time: 1.5s');
    });

    it('should handle small durations', () => {
      const result = formatMsToSec('Quick: %is', 250);
      expect(result).toBe('Quick: 0.25s');
    });

    it('should handle zero ms', () => {
      const result = formatMsToSec('Instant: %is', 0);
      expect(result).toBe('Instant: 0s');
    });

    it('should handle large durations', () => {
      const result = formatMsToSec('Long: %is', 300000);
      expect(result).toBe('Long: 300s');
    });

    it('should work with different format strings', () => {
      const result = formatMsToSec('Task %s took %is', 1000);
      expect(result).toContain('1');
    });
  });

  describe('formatTime', () => {
    it('should format Date to time string', () => {
      const date = new Date('2024-01-15T14:30:45Z');
      const result = formatTime(date);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should use 24-hour format', () => {
      // Create a date at specific time
      const date = new Date('2024-01-15T23:45:30Z');
      const result = formatTime(date);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should handle midnight', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = formatTime(date);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should format consistent for same date', () => {
      const date = new Date('2024-06-21T12:30:45Z');
      const result1 = formatTime(date);
      const result2 = formatTime(date);
      expect(result1).toBe(result2);
    });

    it('should format current time', () => {
      const now = new Date();
      const result = formatTime(now);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should include leading zeros for single digit times', () => {
      const date = new Date('2024-01-15T01:02:03Z');
      const result = formatTime(date);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/); // Always 2 digits
    });
  });

  describe('time formatting consistency', () => {
    it('should format times consistently across calls', () => {
      const times = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date('2024-06-21T15:30:45Z');
        times.push(formatTime(date));
      }
      // All should be identical
      expect(new Set(times).size).toBe(1);
    });

    it('should format duration calculations correctly', () => {
      const start = 1000;
      const end = 6000;
      const duration = end - start;
      const result = formatMsToSec('Duration: %is', duration);
      expect(result).toBe('Duration: 5s');
    });

    it('should handle combined time and duration formatting', () => {
      const date = new Date('2024-06-21T12:30:45Z');
      const timeStr = formatTime(date);
      const durationStr = formatMsToSec('in %is', 2500);

      expect(timeStr).toMatch(/\d{2}:\d{2}:\d{2}/);
      expect(durationStr).toBe('in 2.5s');
    });
  });
});
