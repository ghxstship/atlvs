import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../src/intl';

describe('Internationalization Utilities', () => {
  describe('formatCurrency', () => {
    it('formats USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
      expect(formatCurrency(100, 'USD')).toBe('$100.00');
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    it('formats EUR currency correctly', () => {
      expect(formatCurrency(1234.56, 'EUR')).toMatch(/€1,234\.56|1\.234,56\s€/);
      expect(formatCurrency(100, 'EUR')).toMatch(/€100\.00|100,00\s€/);
    });

    it('formats GBP currency correctly', () => {
      expect(formatCurrency(1234.56, 'GBP')).toMatch(/£1,234\.56|£1,234\.56/);
    });

    it('handles negative values', () => {
      expect(formatCurrency(-1234.56, 'USD')).toBe('-$1,234.56');
    });

    it('handles decimal precision', () => {
      expect(formatCurrency(1234.56789, 'USD')).toBe('$1,234.57');
      expect(formatCurrency(1234.561, 'USD')).toBe('$1,234.56');
    });

    it('uses default USD when no currency specified', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('respects locale parameter', () => {
      expect(formatCurrency(1234.56, 'EUR', 'de-DE')).toBe('1.234,56 €');
      expect(formatCurrency(1234.56, 'USD', 'de-DE')).toBe('1.234,56 $');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2023-12-25T10:30:00Z');

    it('formats date with default locale', () => {
      const result = formatDate(testDate);
      expect(result).toMatch(/\w+ \d{1,2}, \d{4}/); // e.g., "Dec 25, 2023"
    });

    it('formats string date input', () => {
      const result = formatDate('2023-12-25');
      expect(result).toContain('Dec 25, 2023');
    });

    it('respects locale parameter', () => {
      const usResult = formatDate(testDate, 'en-US');
      const deResult = formatDate(testDate, 'de-DE');

      expect(usResult).toBe('Dec 25, 2023');
      expect(deResult).toBe('25. Dez. 2023');
    });

    it('handles different date formats', () => {
      expect(formatDate('2023-01-01')).toContain('Jan 1, 2023');
      expect(formatDate('2023-06-15')).toContain('Jun 15, 2023');
    });

    it('handles edge dates', () => {
      expect(formatDate('2023-01-01')).toContain('Jan 1, 2023');
      expect(formatDate('2023-12-31')).toContain('Dec 31, 2023');
    });
  });
});
