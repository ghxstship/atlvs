/**
 * ATLVS Semantic Size Tokens
 * Zero Tolerance - No hardcoded dimensions
 * 
 * Replace all hardcoded w-{n}, h-{n} values with semantic tokens
 */

export const sizes = {
  /**
   * ICON SIZES
   * Usage: Icons, small UI elements
   */
  icon: {
    xs: '16px',   // w-icon-xs, h-icon-xs
    sm: '20px',   // w-icon-sm, h-icon-sm
    md: '24px',   // w-icon-md, h-icon-md
    lg: '32px',   // w-icon-lg, h-icon-lg
    xl: '40px',   // w-icon-xl, h-icon-xl
    '2xl': '48px', // w-icon-2xl, h-icon-2xl
  },

  /**
   * COMPONENT SIZES
   * Usage: Buttons, inputs, small components
   */
  component: {
    xs: '32px',    // w-icon-lg, h-icon-lg
    sm: '48px',    // w-icon-2xl, h-icon-2xl
    md: '64px',    // w-component-md, h-component-md
    lg: '96px',    // w-component-lg, h-component-lg
    xl: '128px',   // w-component-xl, h-component-xl
    '2xl': '192px', // w-container-xs, h-container-xs
    '3xl': '256px', // w-container-sm, h-container-sm
  },

  /**
   * CONTAINER SIZES
   * Usage: Cards, panels, modals
   */
  container: {
    xs: '192px',   // w-container-xs
    sm: '256px',   // w-container-sm
    md: '320px',   // w-container-md
    lg: '384px',   // w-container-lg
    xl: '512px',   // w-128
    '2xl': '640px', // w-160
    '3xl': '768px', // w-192
    '4xl': '896px', // w-224
    '5xl': '1024px', // w-256
  },

  /**
   * WIDTH PRESETS
   * Usage: Semantic width values
   */
  width: {
    // Layout
    sidebar: '256px',           // w-container-sm
    sidebarCollapsed: '64px',   // w-component-md
    content: 'calc(100% - 256px)',
    
    // Fractions
    full: '100%',
    half: '50%',
    third: '33.333%',
    twoThirds: '66.666%',
    quarter: '25%',
    threeQuarters: '75%',
    
    // Screen-based
    screen: '100vw',
    screenSm: '640px',
    screenMd: '768px',
    screenLg: '1024px',
    screenXl: '1280px',
    screen2xl: '1536px',
  },

  /**
   * HEIGHT PRESETS
   * Usage: Semantic height values
   */
  height: {
    // Layout
    header: '64px',      // h-component-md
    footer: '64px',      // h-component-md
    navbar: '56px',      // h-14
    toolbar: '48px',     // h-icon-2xl
    
    // Fractions
    full: '100%',
    half: '50%',
    third: '33.333%',
    quarter: '25%',
    
    // Screen-based
    screen: '100vh',
    screenMinus: 'calc(100vh - 64px)',
  },

  /**
   * MIN-WIDTH PRESETS
   * Usage: Minimum width constraints
   */
  minWidth: {
    none: '0px',
    xs: '192px',   // min-w-48
    sm: '256px',   // min-w-64
    md: '320px',   // min-w-80
    lg: '384px',   // min-w-96
    xl: '512px',
    '2xl': '640px',
    '3xl': '768px',
    '4xl': '896px',
    '5xl': '1024px',
    full: '100%',
  },

  /**
   * MAX-WIDTH PRESETS
   * Usage: Maximum width constraints
   */
  maxWidth: {
    none: 'none',
    xs: '320px',    // max-w-xs
    sm: '384px',    // max-w-sm
    md: '448px',    // max-w-md
    lg: '512px',    // max-w-lg
    xl: '576px',    // max-w-xl
    '2xl': '672px', // max-w-2xl
    '3xl': '768px', // max-w-3xl
    '4xl': '896px', // max-w-4xl
    '5xl': '1024px', // max-w-5xl
    '6xl': '1152px', // max-w-6xl
    '7xl': '1280px', // max-w-7xl
    full: '100%',
    prose: '65ch',
    screen: '100vw',
    screenSm: '640px',
    screenMd: '768px',
    screenLg: '1024px',
    screenXl: '1280px',
    screen2xl: '1536px',
  },

  /**
   * MIN-HEIGHT PRESETS
   * Usage: Minimum height constraints
   */
  minHeight: {
    none: '0px',
    xs: '192px',
    sm: '256px',
    md: '320px',
    lg: '384px',
    xl: '512px',
    '2xl': '640px',
    full: '100%',
    screen: '100vh',
  },

  /**
   * MAX-HEIGHT PRESETS
   * Usage: Maximum height constraints
   */
  maxHeight: {
    none: 'none',
    xs: '192px',
    sm: '256px',
    md: '320px',
    lg: '384px',
    xl: '512px',
    '2xl': '640px',
    '3xl': '768px',
    full: '100%',
    screen: '100vh',
  },
} as const

/**
 * Type-safe size access
 */
export type IconSize = keyof typeof sizes.icon
export type ComponentSize = keyof typeof sizes.component
export type ContainerSize = keyof typeof sizes.container
export type WidthPreset = keyof typeof sizes.width
export type HeightPreset = keyof typeof sizes.height
export type MinWidthPreset = keyof typeof sizes.minWidth
export type MaxWidthPreset = keyof typeof sizes.maxWidth
export type MinHeightPreset = keyof typeof sizes.minHeight
export type MaxHeightPreset = keyof typeof sizes.maxHeight

/**
 * Helper to get semantic size
 */
export const getSize = (
  category: keyof typeof sizes,
  size: string
): string => {
  return (sizes[category] as any)[size] || size
}

/**
 * Convert legacy Tailwind class to semantic token
 */
export const legacyToSemantic = {
  // Width conversions
  'w-icon-xs': 'icon.xs',
  'w-icon-sm': 'icon.sm',
  'w-icon-md': 'icon.md',
  'w-icon-lg': 'icon.lg',
  'w-icon-xl': 'icon.xl',
  'w-icon-2xl': 'icon.2xl',
  'w-component-md': 'component.md',
  'w-component-lg': 'component.lg',
  'w-component-lg': 'component.lg',
  'w-component-xl': 'component.xl',
  'w-container-xs': 'container.xs',
  'w-container-sm': 'container.sm',
  'w-container-md': 'container.md',
  'w-container-lg': 'container.lg',
  
  // Height conversions
  'h-icon-xs': 'icon.xs',
  'h-icon-sm': 'icon.sm',
  'h-icon-md': 'icon.md',
  'h-icon-lg': 'icon.lg',
  'h-icon-xl': 'icon.xl',
  'h-icon-2xl': 'icon.2xl',
  'h-component-md': 'component.md',
  'h-component-lg': 'component.lg',
  'h-component-lg': 'component.lg',
  'h-component-xl': 'component.xl',
  'h-container-xs': 'container.xs',
  'h-container-sm': 'container.sm',
  'h-container-md': 'container.md',
  'h-container-lg': 'container.lg',
} as const

export default sizes
