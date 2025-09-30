import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime, isValidDate, parseDate } from '@/packages/ui/src/utils/date-utils';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('Jan 15, 2024');
    });

    it('should handle invalid dates', () => {
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
    });

    it('should format with custom format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time for recent dates', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should format relative time for future dates', () => {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesFromNow)).toBe('in 5 minutes');
    });

    it('should handle edge cases', () => {
      expect(formatRelativeTime(new Date('invalid'))).toBe('Invalid Date');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2024-01-01'))).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate(null as any)).toBe(false);
      expect(isValidDate(undefined as any)).toBe(false);
    });
  });

  describe('parseDate', () => {
    it('should parse valid date strings', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString().startsWith('2024-01-15')).toBe(true);
    });

    it('should return null for invalid date strings', () => {
      expect(parseDate('invalid')).toBeNull();
      expect(parseDate('')).toBeNull();
    });

    it('should handle different date formats', () => {
      expect(parseDate('2024/01/15')).toBeInstanceOf(Date);
      expect(parseDate('01-15-2024')).toBeInstanceOf(Date);
    });
  });
});
