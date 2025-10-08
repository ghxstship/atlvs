/**
 * Core System — Unified Export
 * Complete foundation for 2030 Apple-Grade UI System
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

// Design Tokens
export {
  // Color tokens
  baseColors,
  lightTheme,
  darkTheme,
  highContrastTheme,
  colorThemes,
  getThemeColors,
  type ColorToken,
  type ThemeMode as ColorThemeMode,
  
  // Spacing tokens
  spacing,
  semanticSpacing,
  layoutSpacing,
  spacingTokens,
  getSpacing,
  spacingUnits,
  type SpacingToken,
  type SemanticSpacingToken,
  type LayoutSpacingToken,
  
  // Typography tokens
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  typeStyles,
  typographyTokens,
  getFontSize,
  getTypeStyle,
  type FontSizeToken,
  type FontWeightToken,
  type LineHeightToken,
  type LetterSpacingToken,
  type TypeStyleToken,
  
  // Motion tokens
  duration,
  easing,
  motion,
  transitions,
  keyframes,
  motionTokens,
  getAnimation,
  getMotionSafeTransition,
  type DurationToken,
  type EasingToken,
  type MotionPreset,
  type TransitionPreset,
  type KeyframeAnimation,
  
  // Shadow tokens
  shadow,
  coloredShadow,
  focusRing,
  semanticShadow,
  shadowTokens,
  getShadow,
  combineShadows,
  type ShadowToken,
  type ColoredShadowToken,
  type SemanticShadowToken,
  
  // Radius tokens
  radius,
  semanticRadius,
  radiusTokens,
  getRadius,
  type RadiusToken,
  type SemanticRadiusToken,
  
  // Complete token system
  tokens,
} from './tokens';

// Theme System
export {
  // Theme Provider
  ThemeProvider,
  useTheme,
  withTheme,
  type ThemeProviderProps,
  
  // Theme Types
  type ThemeMode,
  type BrandTier,
  type BrandColors,
  type ThemeConfig,
  type ThemeContextValue,
  type ThemePreset,
  type CSSVariableMap,
  type ThemeChangeEvent,
  
  // Theme Presets
  themePresets,
  defaultBrandColors,
  enterpriseBrandColors,
  creativeBrandColors,
  partnerBrandColors,
  getThemePreset,
  getBrandColorsByTier,
  listThemePresets,
  getPresetsByTier,
  
  // Theme Utilities
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
  prefersReducedMotion,
  getOptimalTheme,
  isValidThemeMode,
  generateThemeMetaTags,
  applyThemeMetaTags,
} from './theme';
