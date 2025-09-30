/**
 * Theme Validator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateContrastRatio,
  meetsWCAG,
  validateThemeAccessibility,
  validateAllThemes,
} from './theme-validator';
import { SEMANTIC_TOKENS } from '../tokens/unified-design-tokens';

describe('Theme Validator', () => {
  describe('calculateContrastRatio', () => {
    it('should calculate correct contrast ratio for black on white', () => {
      const ratio = calculateContrastRatio(
        'hsl(0 0% 0%)',
        'hsl(0 0% 100%)'
      );
      expect(ratio).toBeGreaterThan(20); // Should be 21:1
    });

    it('should calculate correct contrast ratio for white on black', () => {
      const ratio = calculateContrastRatio(
        'hsl(0 0% 100%)',
        'hsl(0 0% 0%)'
      );
      expect(ratio).toBeGreaterThan(20); // Should be 21:1
    });

    it('should handle same colors (ratio 1:1)', () => {
      const ratio = calculateContrastRatio(
        'hsl(0 0% 50%)',
        'hsl(0 0% 50%)'
      );
      expect(ratio).toBeCloseTo(1, 1);
    });
  });

  describe('meetsWCAG', () => {
    it('should pass AA for 4.5:1 normal text', () => {
      expect(meetsWCAG(4.5, 'AA', 'normal')).toBe(true);
    });

    it('should fail AA for 4.4:1 normal text', () => {
      expect(meetsWCAG(4.4, 'AA', 'normal')).toBe(false);
    });

    it('should pass AA for 3:1 large text', () => {
      expect(meetsWCAG(3, 'AA', 'large')).toBe(true);
    });

    it('should pass AAA for 7:1 normal text', () => {
      expect(meetsWCAG(7, 'AAA', 'normal')).toBe(true);
    });

    it('should fail AAA for 6.9:1 normal text', () => {
      expect(meetsWCAG(6.9, 'AAA', 'normal')).toBe(false);
    });
  });

  describe('validateThemeAccessibility', () => {
    it('should validate light theme for WCAG AA', () => {
      const results = validateThemeAccessibility(SEMANTIC_TOKENS.light, 'AA');
      
      expect(results.summary.total).toBeGreaterThan(0);
      expect(results.summary.passRate).toBeGreaterThan(0);
      
      // Log any failures for debugging
      if (results.failed.length > 0) {
        console.log('Light theme AA failures:', results.failed);
      }
    });

    it('should validate dark theme for WCAG AA', () => {
      const results = validateThemeAccessibility(SEMANTIC_TOKENS.dark, 'AA');
      
      expect(results.summary.total).toBeGreaterThan(0);
      expect(results.summary.passRate).toBeGreaterThan(0);
      
      // Log any failures for debugging
      if (results.failed.length > 0) {
        console.log('Dark theme AA failures:', results.failed);
      }
    });

    it('should have proper result structure', () => {
      const results = validateThemeAccessibility(SEMANTIC_TOKENS.light, 'AA');
      
      expect(results).toHaveProperty('passed');
      expect(results).toHaveProperty('failed');
      expect(results).toHaveProperty('summary');
      expect(results.summary).toHaveProperty('total');
      expect(results.summary).toHaveProperty('passed');
      expect(results.summary).toHaveProperty('failed');
      expect(results.summary).toHaveProperty('passRate');
    });

    it('should calculate correct pass rate', () => {
      const results = validateThemeAccessibility(SEMANTIC_TOKENS.light, 'AA');
      
      const expectedPassRate = 
        (results.summary.passed / results.summary.total) * 100;
      
      expect(results.summary.passRate).toBeCloseTo(expectedPassRate, 1);
    });
  });

  describe('validateAllThemes', () => {
    it('should validate all theme variants', () => {
      const results = validateAllThemes({
        light: SEMANTIC_TOKENS.light,
        dark: SEMANTIC_TOKENS.dark,
      }, 'AA');
      
      expect(results).toHaveProperty('light');
      expect(results).toHaveProperty('dark');
      expect(results.light.summary.total).toBeGreaterThan(0);
      expect(results.dark.summary.total).toBeGreaterThan(0);
    });

    it('should validate for AAA level', () => {
      const results = validateAllThemes({
        light: SEMANTIC_TOKENS.light,
      }, 'AAA');
      
      expect(results.light.summary.total).toBeGreaterThan(0);
      // AAA is stricter, so pass rate may be lower
    });
  });

  describe('Real-world theme validation', () => {
    it('should ensure primary button has sufficient contrast', () => {
      const lightTheme = SEMANTIC_TOKENS.light;
      const ratio = calculateContrastRatio(
        lightTheme.primaryForeground,
        lightTheme.primary
      );
      
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should ensure destructive button has sufficient contrast', () => {
      const lightTheme = SEMANTIC_TOKENS.light;
      const ratio = calculateContrastRatio(
        lightTheme.destructiveForeground,
        lightTheme.destructive
      );
      
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should ensure body text has sufficient contrast', () => {
      const lightTheme = SEMANTIC_TOKENS.light;
      const ratio = calculateContrastRatio(
        lightTheme.foreground,
        lightTheme.background
      );
      
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
