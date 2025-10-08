/**
 * Spacing Tokens v2.0 — 8px Grid System
 * Apple-grade spacing scale for consistent layouts
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

/**
 * Base spacing unit (8px)
 * All spacing derives from this base unit
 */
export const BASE_UNIT = 8;

/**
 * Spacing Scale
 * Based on 8px grid system
 */
export const spacing = {
  0: '0px',
  1: '0.25rem',    // 4px  - Micro spacing
  2: '0.5rem',     // 8px  - Base unit
  3: '0.75rem',    // 12px - Small spacing
  4: '1rem',       // 16px - Medium spacing
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px - Large spacing
  8: '2rem',       // 32px - XL spacing
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px - XXL spacing
  16: '4rem',      // 64px - Section spacing
  20: '5rem',      // 80px
  24: '6rem',      // 96px - Large sections
  32: '8rem',      // 128px
  40: '10rem',     // 160px
  48: '12rem',     // 192px
  56: '14rem',     // 224px
  64: '16rem',     // 256px
} as const;

/**
 * Semantic Spacing
 * Named spacing for common use cases
 */
export const semanticSpacing = {
  // Component internal spacing
  'component-xs': spacing[1],
  'component-sm': spacing[2],
  'component-md': spacing[3],
  'component-lg': spacing[4],
  'component-xl': spacing[6],
  
  // Container padding
  'container-xs': spacing[4],
  'container-sm': spacing[6],
  'container-md': spacing[8],
  'container-lg': spacing[12],
  'container-xl': spacing[16],
  
  // Section spacing
  'section-xs': spacing[8],
  'section-sm': spacing[12],
  'section-md': spacing[16],
  'section-lg': spacing[24],
  'section-xl': spacing[32],
  
  // Stack spacing (vertical)
  'stack-xs': spacing[2],
  'stack-sm': spacing[3],
  'stack-md': spacing[4],
  'stack-lg': spacing[6],
  'stack-xl': spacing[8],
  
  // Inline spacing (horizontal)
  'inline-xs': spacing[1],
  'inline-sm': spacing[2],
  'inline-md': spacing[3],
  'inline-lg': spacing[4],
  'inline-xl': spacing[6],
  
  // Gap spacing (grid/flex)
  'gap-xs': spacing[2],
  'gap-sm': spacing[3],
  'gap-md': spacing[4],
  'gap-lg': spacing[6],
  'gap-xl': spacing[8],
} as const;

/**
 * Layout Spacing
 * Spacing for major layout components
 */
export const layoutSpacing = {
  // Sidebar
  'sidebar-width': '16rem',           // 256px
  'sidebar-width-collapsed': '4rem',   // 64px
  'sidebar-padding': spacing[4],
  
  // Header
  'header-height': '4rem',             // 64px
  'header-padding': spacing[4],
  
  // Drawer
  'drawer-width-sm': '24rem',          // 384px
  'drawer-width-md': '32rem',          // 512px
  'drawer-width-lg': '48rem',          // 768px
  'drawer-padding': spacing[6],
  
  // Modal
  'modal-width-sm': '28rem',           // 448px
  'modal-width-md': '32rem',           // 512px
  'modal-width-lg': '48rem',           // 768px
  'modal-width-xl': '64rem',           // 1024px
  'modal-padding': spacing[6],
  
  // Content
  'content-width': '72rem',            // 1152px max content width
  'content-padding': spacing[6],
  
  // Page
  'page-padding': spacing[8],
  'page-padding-mobile': spacing[4],
} as const;

/**
 * Responsive Spacing
 * Spacing that adapts to screen size
 */
export const responsiveSpacing = {
  mobile: {
    container: spacing[4],
    section: spacing[8],
    stack: spacing[3],
    inline: spacing[2],
  },
  tablet: {
    container: spacing[6],
    section: spacing[12],
    stack: spacing[4],
    inline: spacing[3],
  },
  desktop: {
    container: spacing[8],
    section: spacing[16],
    stack: spacing[6],
    inline: spacing[4],
  },
} as const;

/**
 * Spacing Type
 */
export type SpacingToken = keyof typeof spacing;
export type SemanticSpacingToken = keyof typeof semanticSpacing;
export type LayoutSpacingToken = keyof typeof layoutSpacing;

/**
 * Get spacing value
 */
export function getSpacing(token: SpacingToken | number): string {
  if (typeof token === 'number') {
    return `${token * BASE_UNIT}px`;
  }
  return spacing[token];
}

/**
 * Calculate spacing from base units
 */
export function spacingUnits(units: number): string {
  return `${units * BASE_UNIT}px`;
}

/**
 * Export all spacing tokens
 */
export const spacingTokens = {
  ...spacing,
  ...semanticSpacing,
  ...layoutSpacing,
} as const;
