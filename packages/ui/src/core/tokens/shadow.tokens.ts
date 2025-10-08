/**
 * Shadow Tokens v2.0 — Elevation System
 * Apple-grade shadows for depth and hierarchy
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

/**
 * Shadow Levels
 * Elevation system from 0 (flat) to 24 (floating)
 */
export const shadow = {
  none: 'none',
  
  // Subtle shadows (level 1-4)
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  
  // Prominent shadows (level 5-8)
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Modal/overlay shadows
  modal: '0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12), 0 11px 15px -7px rgba(0, 0, 0, 0.2)',
  drawer: '0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'inner-md': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
} as const;

/**
 * Colored Shadows
 * Shadows with brand colors for focused states
 */
export const coloredShadow = {
  // Primary (blue)
  'primary-xs': '0 0 0 1px rgba(59, 130, 246, 0.5)',
  'primary-sm': '0 0 0 2px rgba(59, 130, 246, 0.5)',
  'primary-md': '0 0 0 3px rgba(59, 130, 246, 0.3)',
  'primary-lg': '0 0 0 4px rgba(59, 130, 246, 0.2)',
  
  // Success (green)
  'success-xs': '0 0 0 1px rgba(34, 197, 94, 0.5)',
  'success-sm': '0 0 0 2px rgba(34, 197, 94, 0.5)',
  'success-md': '0 0 0 3px rgba(34, 197, 94, 0.3)',
  
  // Warning (yellow)
  'warning-xs': '0 0 0 1px rgba(234, 179, 8, 0.5)',
  'warning-sm': '0 0 0 2px rgba(234, 179, 8, 0.5)',
  'warning-md': '0 0 0 3px rgba(234, 179, 8, 0.3)',
  
  // Error (red)
  'error-xs': '0 0 0 1px rgba(239, 68, 68, 0.5)',
  'error-sm': '0 0 0 2px rgba(239, 68, 68, 0.5)',
  'error-md': '0 0 0 3px rgba(239, 68, 68, 0.3)',
} as const;

/**
 * Focus Rings
 * Accessibility-focused outline shadows
 */
export const focusRing = {
  default: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  'default-offset': '0 0 0 2px white, 0 0 0 5px rgba(59, 130, 246, 0.5)',
  error: '0 0 0 3px rgba(239, 68, 68, 0.5)',
  success: '0 0 0 3px rgba(34, 197, 94, 0.5)',
} as const;

/**
 * Semantic Shadows
 * Shadows for specific use cases
 */
export const semanticShadow = {
  // Cards
  card: shadow.sm,
  'card-hover': shadow.md,
  'card-active': shadow.xs,
  
  // Buttons
  button: shadow.xs,
  'button-hover': shadow.sm,
  'button-active': shadow.none,
  
  // Dropdowns
  dropdown: shadow.lg,
  menu: shadow.lg,
  popover: shadow.lg,
  
  // Overlays
  modal: shadow.modal,
  drawer: shadow.drawer,
  dialog: shadow.xl,
  
  // Tooltips
  tooltip: shadow.md,
  
  // Inputs
  input: shadow.none,
  'input-focus': focusRing.default,
  'input-error': focusRing.error,
  
  // Tables
  'table-header': shadow.sm,
  'table-row-hover': shadow.xs,
} as const;

/**
 * Dark Theme Shadows
 * Adjusted shadows for dark backgrounds
 */
export const darkShadow = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  modal: '0 24px 38px 3px rgba(0, 0, 0, 0.3), 0 9px 46px 8px rgba(0, 0, 0, 0.24), 0 11px 15px -7px rgba(0, 0, 0, 0.4)',
  drawer: '0 16px 24px 2px rgba(0, 0, 0, 0.3), 0 6px 30px 5px rgba(0, 0, 0, 0.24), 0 8px 10px -5px rgba(0, 0, 0, 0.4)',
} as const;

/**
 * Shadow Types
 */
export type ShadowToken = keyof typeof shadow;
export type ColoredShadowToken = keyof typeof coloredShadow;
export type SemanticShadowToken = keyof typeof semanticShadow;

/**
 * Get shadow by theme
 */
export function getShadow(token: ShadowToken, isDark: boolean = false): string {
  if (isDark && token in darkShadow) {
    return darkShadow[token as keyof typeof darkShadow];
  }
  return shadow[token];
}

/**
 * Combine multiple shadows
 */
export function combineShadows(...shadows: string[]): string {
  return shadows.filter(Boolean).join(', ');
}

/**
 * Export all shadow tokens
 */
export const shadowTokens = {
  shadow,
  coloredShadow,
  focusRing,
  semanticShadow,
  darkShadow,
} as const;
