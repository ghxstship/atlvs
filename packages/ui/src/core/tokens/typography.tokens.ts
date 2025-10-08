/**
 * Typography Tokens v2.0 — Fluid Type Scale
 * Apple-grade typography with fluid scaling
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

/**
 * Font Families
 */
export const fontFamily = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  display: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
} as const;

/**
 * Font Sizes
 * Fluid scale that adapts to screen size
 */
export const fontSize = {
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
  '7xl': '4.5rem',    // 72px
  '8xl': '6rem',      // 96px
  '9xl': '8rem',      // 128px
} as const;

/**
 * Font Weights
 */
export const fontWeight = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

/**
 * Line Heights
 */
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

/**
 * Letter Spacing
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/**
 * Semantic Typography Styles
 * Pre-defined type styles for common use cases
 */
export const typeStyles = {
  // Display styles (marketing, hero sections)
  'display-2xl': {
    fontSize: fontSize['8xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
    fontFamily: fontFamily.display,
  },
  'display-xl': {
    fontSize: fontSize['7xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
    fontFamily: fontFamily.display,
  },
  'display-lg': {
    fontSize: fontSize['6xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamily.display,
  },
  'display-md': {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
    fontFamily: fontFamily.display,
  },
  'display-sm': {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.display,
  },
  
  // Heading styles
  'heading-1': {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.sans,
  },
  'heading-2': {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    fontFamily: fontFamily.sans,
  },
  'heading-3': {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    fontFamily: fontFamily.sans,
  },
  'heading-4': {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  'heading-5': {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  'heading-6': {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  
  // Body styles
  'body-lg': {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    fontFamily: fontFamily.sans,
  },
  'body-md': {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  'body-sm': {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  'body-xs': {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  
  // Special styles
  'label-lg': {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamily.sans,
  },
  'label-md': {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  'label-sm': {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  
  'caption': {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  
  'overline': {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase' as const,
    fontFamily: fontFamily.sans,
  },
  
  'code': {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.mono,
  },
  
  'kbd': {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
    fontFamily: fontFamily.mono,
  },
} as const;

/**
 * Responsive Typography
 * Type scales that adapt to viewport
 */
export const responsiveTypeStyles = {
  hero: {
    mobile: typeStyles['display-sm'],
    tablet: typeStyles['display-md'],
    desktop: typeStyles['display-lg'],
  },
  pageTitle: {
    mobile: typeStyles['heading-3'],
    tablet: typeStyles['heading-2'],
    desktop: typeStyles['heading-1'],
  },
  sectionTitle: {
    mobile: typeStyles['heading-4'],
    tablet: typeStyles['heading-3'],
    desktop: typeStyles['heading-2'],
  },
} as const;

/**
 * Typography Types
 */
export type FontSizeToken = keyof typeof fontSize;
export type FontWeightToken = keyof typeof fontWeight;
export type LineHeightToken = keyof typeof lineHeight;
export type LetterSpacingToken = keyof typeof letterSpacing;
export type TypeStyleToken = keyof typeof typeStyles;

/**
 * Get font size value
 */
export function getFontSize(token: FontSizeToken): string {
  return fontSize[token];
}

/**
 * Get type style
 */
export function getTypeStyle(token: TypeStyleToken) {
  return typeStyles[token];
}

/**
 * Export all typography tokens
 */
export const typographyTokens = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  typeStyles,
} as const;
