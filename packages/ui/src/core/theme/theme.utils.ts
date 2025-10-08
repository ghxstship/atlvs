/**
 * Theme Utilities — Helper Functions for Theme System
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

import { getThemeColors } from '../tokens/color.tokens';
import type { ThemeMode, BrandColors, CSSVariableMap } from './theme.types';

/**
 * Detect system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Resolve theme mode (auto -> light/dark)
 */
export function resolveThemeMode(mode: ThemeMode): Exclude<ThemeMode, 'auto'> {
  if (mode === 'auto') {
    return getSystemTheme();
  }
  return mode;
}

/**
 * Generate CSS variables from theme colors
 */
export function generateCSSVariables(
  mode: Exclude<ThemeMode, 'auto'>,
  brandColors?: Partial<BrandColors>
): CSSVariableMap {
  const themeColors = getThemeColors(mode);
  const variables: CSSVariableMap = {};
  
  // Add color tokens
  Object.entries(themeColors).forEach(([key, value]) => {
    variables[`--color-${key}`] = value;
  });
  
  // Add brand color overrides
  if (brandColors?.primary) {
    variables['--color-primary'] = brandColors.primary;
  }
  if (brandColors?.secondary) {
    variables['--color-secondary'] = brandColors.secondary;
  }
  if (brandColors?.accent) {
    variables['--color-accent'] = brandColors.accent;
  }
  
  return variables;
}

/**
 * Apply CSS variables to document root
 */
export function applyCSSVariables(variables: CSSVariableMap): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Apply theme class to document
 */
export function applyThemeClass(mode: Exclude<ThemeMode, 'auto'>): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
  
  // Add new theme class
  root.classList.add(`theme-${mode}`);
  
  // Set data attribute for CSS selectors
  root.setAttribute('data-theme', mode);
}

/**
 * Get theme from storage
 */
export function getStoredTheme(storageKey: string): ThemeMode | null {
  if (typeof localStorage === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(storageKey);
    return stored as ThemeMode | null;
  } catch {
    return null;
  }
}

/**
 * Save theme to storage
 */
export function saveThemeToStorage(mode: ThemeMode, storageKey: string): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.setItem(storageKey, mode);
  } catch {
    // Silently fail if storage is unavailable
  }
}

/**
 * Watch for system theme changes
 */
export function watchSystemTheme(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
  
  // Legacy browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

/**
 * Enable smooth theme transitions
 */
export function enableThemeTransitions(): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease');
  
  // Remove transition after delay
  setTimeout(() => {
    root.style.removeProperty('transition');
  }, 300);
}

/**
 * Disable theme transitions
 */
export function disableThemeTransitions(): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  root.style.removeProperty('transition');
}

/**
 * Check if high contrast is preferred
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get optimal theme based on system preferences
 */
export function getOptimalTheme(): ThemeMode {
  if (prefersHighContrast()) {
    return 'high-contrast';
  }
  return 'auto';
}

/**
 * Validate theme mode
 */
export function isValidThemeMode(mode: string): mode is ThemeMode {
  return ['light', 'dark', 'high-contrast', 'auto'].includes(mode);
}

/**
 * Generate theme meta tags
 */
export function generateThemeMetaTags(mode: Exclude<ThemeMode, 'auto'>): string {
  const isDark = mode === 'dark';
  const themeColor = isDark ? '#0F172A' : '#FFFFFF';
  
  return `
    <meta name="theme-color" content="${themeColor}" />
    <meta name="color-scheme" content="${mode === 'high-contrast' ? 'light dark' : mode}" />
  `;
}

/**
 * Apply theme meta tags
 */
export function applyThemeMetaTags(mode: Exclude<ThemeMode, 'auto'>): void {
  if (typeof document === 'undefined') return;
  
  const isDark = mode === 'dark';
  const themeColor = isDark ? '#0F172A' : '#FFFFFF';
  
  // Update theme-color meta tag
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.setAttribute('name', 'theme-color');
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.setAttribute('content', themeColor);
  
  // Update color-scheme meta tag
  let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (!colorSchemeMeta) {
    colorSchemeMeta = document.createElement('meta');
    colorSchemeMeta.setAttribute('name', 'color-scheme');
    document.head.appendChild(colorSchemeMeta);
  }
  colorSchemeMeta.setAttribute('content', mode === 'high-contrast' ? 'light dark' : mode);
}
