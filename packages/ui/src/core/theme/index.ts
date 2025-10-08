/**
 * Theme System — Unified Export
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

// Theme Provider
export { ThemeProvider, useTheme, withTheme } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';

// Theme Types
export type {
  ThemeMode,
  BrandTier,
  BrandColors,
  ThemeConfig,
  ThemeContextValue,
  ThemePreset,
  CSSVariableMap,
  ThemeChangeEvent,
} from './theme.types';

// Theme Presets
export {
  themePresets,
  defaultBrandColors,
  enterpriseBrandColors,
  creativeBrandColors,
  partnerBrandColors,
  getThemePreset,
  getBrandColorsByTier,
  listThemePresets,
  getPresetsByTier,
} from './theme.presets';

// Theme Utilities
export {
  getSystemTheme,
  resolveThemeMode,
  generateCSSVariables,
  applyCSSVariables,
  applyThemeClass,
  getStoredTheme,
  saveThemeToStorage,
  watchSystemTheme,
  enableThemeTransitions,
  disableThemeTransitions,
  prefersHighContrast,
  // prefersReducedMotion exported from tokens/motion.tokens to avoid conflict
  getOptimalTheme,
  isValidThemeMode,
  generateThemeMetaTags,
  applyThemeMetaTags,
} from './theme.utils';
