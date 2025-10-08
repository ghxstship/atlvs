/**
 * Radius Tokens v2.0 — Border Radius System
 * Apple-grade corner radii for consistent UI
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

/**
 * Border Radius Scale
 */
export const radius = {
  none: '0px',
  xs: '0.125rem',   // 2px
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',   // Fully rounded
} as const;

/**
 * Semantic Border Radius
 * Named radii for specific use cases
 */
export const semanticRadius = {
  // Components
  button: radius.md,
  'button-sm': radius.sm,
  'button-lg': radius.lg,
  
  input: radius.md,
  'input-sm': radius.sm,
  'input-lg': radius.lg,
  
  card: radius.lg,
  'card-sm': radius.md,
  'card-lg': radius.xl,
  
  badge: radius.full,
  'badge-square': radius.sm,
  
  avatar: radius.full,
  'avatar-square': radius.md,
  
  // Containers
  modal: radius.xl,
  drawer: radius.none,
  popover: radius.lg,
  dropdown: radius.md,
  tooltip: radius.md,
  
  // Interactive
  tab: radius.md,
  'tab-top': `${radius.md} ${radius.md} 0 0`,
  'tab-bottom': `0 0 ${radius.md} ${radius.md}`,
  
  chip: radius.full,
  tag: radius.sm,
  
  // Media
  image: radius.lg,
  'image-sm': radius.md,
  'image-lg': radius.xl,
  
  video: radius.lg,
  thumbnail: radius.md,
  
  // Tables
  'table-cell': radius.none,
  'table-header': `${radius.lg} ${radius.lg} 0 0`,
  
  // Forms
  checkbox: radius.sm,
  radio: radius.full,
  switch: radius.full,
  'switch-thumb': radius.full,
} as const;

/**
 * Radius Types
 */
export type RadiusToken = keyof typeof radius;
export type SemanticRadiusToken = keyof typeof semanticRadius;

/**
 * Get radius value
 */
export function getRadius(token: RadiusToken): string {
  return radius[token];
}

/**
 * Export all radius tokens
 */
export const radiusTokens = {
  radius,
  semanticRadius,
} as const;
