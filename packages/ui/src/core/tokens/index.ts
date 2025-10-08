/**
 * Design Tokens v2.0 — Unified Export
 * Complete token system for 2030 Apple-Grade UI
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

// Color tokens
export * from './color.tokens';
export { colorThemes, getThemeColors, lightTheme, darkTheme, highContrastTheme } from './color.tokens';

// Spacing tokens
export * from './spacing.tokens';
export { spacing, semanticSpacing, layoutSpacing, spacingTokens, getSpacing, spacingUnits } from './spacing.tokens';

// Typography tokens
export * from './typography.tokens';
export { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, typeStyles, typographyTokens, getFontSize, getTypeStyle } from './typography.tokens';

// Motion tokens
export * from './motion.tokens';
export { duration, easing, motion, transitions, keyframes, motionTokens, getAnimation, prefersReducedMotion, getMotionSafeTransition } from './motion.tokens';

// Shadow tokens
export * from './shadow.tokens';
export { shadow, coloredShadow, focusRing, semanticShadow, shadowTokens, getShadow, combineShadows } from './shadow.tokens';

// Radius tokens
export * from './radius.tokens';
export { radius, semanticRadius, radiusTokens, getRadius } from './radius.tokens';

/**
 * Complete Token System
 * Unified object containing all design tokens
 */
import { colorThemes } from './color.tokens';
import { spacingTokens } from './spacing.tokens';
import { typographyTokens } from './typography.tokens';
import { motionTokens } from './motion.tokens';
import { shadowTokens } from './shadow.tokens';
import { radiusTokens } from './radius.tokens';

export const tokens = {
  colors: colorThemes,
  spacing: spacingTokens,
  typography: typographyTokens,
  motion: motionTokens,
  shadows: shadowTokens,
  radius: radiusTokens,
} as const;

/**
 * Token Types
 */
export type { 
  ColorToken, 
  ThemeMode 
} from './color.tokens';

export type { 
  SpacingToken, 
  SemanticSpacingToken, 
  LayoutSpacingToken 
} from './spacing.tokens';

export type { 
  FontSizeToken, 
  FontWeightToken, 
  LineHeightToken, 
  LetterSpacingToken, 
  TypeStyleToken 
} from './typography.tokens';

export type { 
  DurationToken, 
  EasingToken, 
  MotionPreset, 
  TransitionPreset, 
  KeyframeAnimation 
} from './motion.tokens';

export type { 
  ShadowToken, 
  ColoredShadowToken, 
  SemanticShadowToken 
} from './shadow.tokens';

export type { 
  RadiusToken, 
  SemanticRadiusToken 
} from './radius.tokens';
