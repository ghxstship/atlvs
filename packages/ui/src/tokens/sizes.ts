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
    xs: 'var(--space-4)',
    sm: 'var(--space-5)',
    md: 'var(--space-6)',
    lg: 'var(--space-8)',
    xl: 'var(--space-10)',
    '2xl': 'var(--space-12)',
  },

  /**
   * COMPONENT SIZES
   * Usage: Buttons, inputs, small components
   */
  component: {
    xs: 'var(--space-8)',
    sm: 'var(--space-12)',
    md: 'var(--space-16)',
    lg: 'var(--space-24)',
    xl: 'var(--space-32)',
    '2xl': 'var(--space-48)',
    '3xl': 'var(--space-64)',
  },

  /**
   * CONTAINER SIZES
   * Usage: Cards, panels, modals
   */
  container: {
    xs: 'var(--container-xs, 12rem)',
    sm: 'var(--container-sm, 16rem)',
    md: 'var(--container-md, 20rem)',
    lg: 'var(--container-lg, 24rem)',
    xl: 'var(--container-xl, 32rem)',
    '2xl': 'var(--container-2xl, 40rem)',
    '3xl': 'var(--container-3xl, 48rem)',
    '4xl': 'var(--container-4xl, 56rem)',
    '5xl': 'var(--container-5xl, 64rem)',
  },

  /**
   * WIDTH PRESETS
   * Usage: Semantic width values
   */
  width: {
    // Layout
    sidebar: 'var(--layout-sidebar, 16rem)',
    sidebarCollapsed: 'var(--layout-sidebar-collapsed, 4rem)',
    content: 'calc(100% - var(--layout-sidebar, 16rem))',
    
    // Fractions
    full: '100%',
    half: '50%',
    third: '33.333%',
    twoThirds: '66.666%',
    quarter: '25%',
    threeQuarters: '75%',
    
    // Screen-based
    screen: '100vw',
    screenSm: 'var(--breakpoint-sm, 40rem)',
    screenMd: 'var(--breakpoint-md, 48rem)',
    screenLg: 'var(--breakpoint-lg, 64rem)',
    screenXl: 'var(--breakpoint-xl, 80rem)',
    screen2xl: 'var(--breakpoint-2xl, 96rem)',
  },

  /**
   * HEIGHT PRESETS
   * Usage: Semantic height values
   */
  height: {
    // Layout
    header: 'var(--layout-header, 4rem)',
    footer: 'var(--layout-footer, 4rem)',
    navbar: 'var(--layout-navbar, 3.5rem)',
    toolbar: 'var(--layout-toolbar, 3rem)',
    
    // Fractions
    full: '100%',
    half: '50%',
    third: '33.333%',
    quarter: '25%',
    
    // Screen-based
    screen: '100vh',
    screenMinus: 'calc(100vh - var(--layout-header, 4rem))',
  },

  /**
   * MIN-WIDTH PRESETS
   * Usage: Minimum width constraints
   */
  minWidth: {
    none: '0px',
    xs: 'var(--container-xs, 12rem)',
    sm: 'var(--container-sm, 16rem)',
    md: 'var(--container-md, 20rem)',
    lg: 'var(--container-lg, 24rem)',
    xl: 'var(--container-xl, 32rem)',
    '2xl': 'var(--container-2xl, 40rem)',
    '3xl': 'var(--container-3xl, 48rem)',
    '4xl': 'var(--container-4xl, 56rem)',
    '5xl': 'var(--container-5xl, 64rem)',
    full: '100%',
  },

  /**
   * MAX-WIDTH PRESETS
   * Usage: Maximum width constraints
   */
  maxWidth: {
    none: 'none',
    xs: 'var(--max-width-xs, 20rem)',
    sm: 'var(--max-width-sm, 24rem)',
    md: 'var(--max-width-md, 28rem)',
    lg: 'var(--max-width-lg, 32rem)',
    xl: 'var(--max-width-xl, 36rem)',
    '2xl': 'var(--max-width-2xl, 42rem)',
    '3xl': 'var(--max-width-3xl, 48rem)',
    '4xl': 'var(--max-width-4xl, 56rem)',
    '5xl': 'var(--max-width-5xl, 64rem)',
    '6xl': 'var(--max-width-6xl, 72rem)',
    '7xl': 'var(--max-width-7xl, 80rem)',
    full: '100%',
    prose: '65ch',
    screen: '100vw',
    screenSm: 'var(--breakpoint-sm, 40rem)',
    screenMd: 'var(--breakpoint-md, 48rem)',
    screenLg: 'var(--breakpoint-lg, 64rem)',
    screenXl: 'var(--breakpoint-xl, 80rem)',
    screen2xl: 'var(--breakpoint-2xl, 96rem)',
  },

  /**
   * MIN-HEIGHT PRESETS
   * Usage: Minimum height constraints
   */
  minHeight: {
    none: '0px',
    xs: 'var(--container-xs, 12rem)',
    sm: 'var(--container-sm, 16rem)',
    md: 'var(--container-md, 20rem)',
    lg: 'var(--container-lg, 24rem)',
    xl: 'var(--container-xl, 32rem)',
    '2xl': 'var(--container-2xl, 40rem)',
    full: '100%',
    screen: '100vh',
  },

  /**
   * MAX-HEIGHT PRESETS
   * Usage: Maximum height constraints
   */
  maxHeight: {
    none: 'none',
    xs: 'var(--container-xs, 12rem)',
    sm: 'var(--container-sm, 16rem)',
    md: 'var(--container-md, 20rem)',
    lg: 'var(--container-lg, 24rem)',
    xl: 'var(--container-xl, 32rem)',
    '2xl': 'var(--container-2xl, 40rem)',
    '3xl': 'var(--container-3xl, 48rem)',
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
  'h-component-xl': 'component.xl',
  'h-container-xs': 'container.xs',
  'h-container-sm': 'container.sm',
  'h-container-md': 'container.md',
  'h-container-lg': 'container.lg',
} as const

export default sizes
