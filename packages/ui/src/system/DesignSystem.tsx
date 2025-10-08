'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// 2026 Design System Foundation
// Unified spacing, typography, colors, and layout system

export const DESIGN_TOKENS = {
  // Spacing Scale (var(--spacing-2) base unit for perfect alignment)
  spacing: {
    '0': '0',
    'px': '1px',
    '0.5': '0.125rem', // 2px
    '1': '0.25rem',    // var(--spacing-1)
    '1.5': '0.375rem', // 6px
    '2': '0.5rem',     // var(--spacing-2)
    '2.5': '0.625rem', // 10px
    '3': '0.75rem',    // var(--spacing-3)
    '3.5': '0.875rem', // 14px
    '4': '1rem',       // var(--spacing-4)
    '5': '1.25rem',    // var(--spacing-5)
    '6': '1.5rem',     // var(--spacing-6)
    '7': '1.75rem',    // 28px
    '8': '2rem',       // var(--spacing-8)
    '9': '2.25rem',    // 36px
    '10': '2.5rem',    // var(--spacing-10)
    '11': '2.75rem',   // 44px
    '12': '3rem',      // var(--spacing-12)
    '14': '3.5rem',    // 56px
    '16': '4rem',      // var(--spacing-16)
    '20': '5rem',      // 80px
    '24': '6rem',      // 96px
    '28': '7rem',      // 112px
    '32': '8rem',      // 128px
    '36': '9rem',      // 144px
    '40': '10rem',     // 160px
    '44': '11rem',     // 176px
    '48': '12rem',     // 192px
    '52': '13rem',     // 208px
    '56': '14rem',     // 224px
    '60': '15rem',     // 240px
    '64': '16rem',     // 256px
    '72': '18rem',     // 288px
    '80': '20rem',     // 320px
    '96': '24rem',     // 384px
  },

  // Typography Scale (Perfect Fourth - 1.333 ratio)
  typography: {
    fontFamily: {
      display: ['ANTON', 'system-ui', 'sans-serif'],
      body: ['Share Tech', 'system-ui', 'sans-serif'],
      mono: ['Share Tech Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],      // var(--spacing-3)
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      'base': ['1rem', { lineHeight: '1.5rem' }],     // var(--spacing-4)
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // var(--spacing-5)
      '2xl': ['1.5rem', { lineHeight: '2rem' }],      // var(--spacing-6)
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      '5xl': ['3rem', { lineHeight: '1' }],           // var(--spacing-12)
      '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
      '8xl': ['6rem', { lineHeight: '1' }],           // 96px
      '9xl': ['8rem', { lineHeight: '1' }],           // 128px
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  // Color System (Semantic + Brand)
  colors: {
    // Brand Colors
    brand: {
      50: 'var(--primary)',
      100: 'var(--primary)',
      200: 'var(--primary)',
      300: 'var(--primary)',
      400: 'var(--primary)',
      500: 'var(--primary)',
      600: 'var(--primary)',
      700: 'var(--primary)',
      800: 'var(--primary)',
      900: 'var(--primary)',
      950: 'var(--primary)',
    },
    // Semantic Colors
    success: {
      50: 'var(--primary)',
      500: 'var(--primary)',
      600: 'var(--primary)',
      700: 'var(--primary)',
    },
    warning: {
      50: 'var(--background)beb',
      500: 'var(--primary)',
      600: 'var(--primary)',
      700: 'var(--primary)',
    },
    error: {
      50: 'var(--primary)',
      500: 'var(--primary)',
      600: 'var(--primary)',
      700: 'var(--primary)',
    },
    // Neutral Scale
    neutral: {
      0: 'var(--background)',
      50: 'var(--primary)',
      100: 'var(--primary)',
      200: 'var(--primary)',
      300: 'var(--primary)',
      400: 'var(--primary)',
      500: 'var(--primary)',
      600: 'var(--primary)',
      700: 'var(--primary)',
      800: 'var(--primary)',
      900: 'var(--primary)',
      950: 'var(--primary)',
    },
  },

  // Border Radius Scale
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // var(--spacing-1)
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // var(--spacing-2)
    xl: '0.75rem',    // var(--spacing-3)
    '2xl': '1rem',    // var(--spacing-4)
    '3xl': '1.5rem',  // var(--spacing-6)
    full: '9999px',
  },

  // Shadow Scale
  boxShadow: {
    sm: '0 1px 2px 0 hsl(var(--color-foreground) / 0.05)',
    DEFAULT: '0 1px 3px 0 hsl(var(--color-foreground) / 0.1), 0 1px 2px -1px hsl(var(--color-foreground) / 0.1)',
    md: '0 var(--spacing-1) 6px -1px hsl(var(--color-foreground) / 0.1), 0 2px var(--spacing-1) -2px hsl(var(--color-foreground) / 0.1)',
    lg: '0 10px 15px -3px hsl(var(--color-foreground) / 0.1), 0 var(--spacing-1) 6px -4px hsl(var(--color-foreground) / 0.1)',
    xl: '0 var(--spacing-5) 25px -5px hsl(var(--color-foreground) / 0.1), 0 var(--spacing-2) 10px -6px hsl(var(--color-foreground) / 0.1)',
    '2xl': '0 25px 50px -12px hsl(var(--color-foreground) / 0.25)',
    inner: 'inset 0 2px var(--spacing-1) 0 hsl(var(--color-foreground) / 0.05)',
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Breakpoints (Mobile-first)
  breakpoints: {
    sm: '640px',   // Small devices
    md: '768px',   // Medium devices
    lg: '1024px',  // Large devices
    xl: '1280px',  // Extra large devices
    '2xl': '1536px', // Ultra-wide devices
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1020,
    banner: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    skipLink: 1070,
    toast: 1080,
    tooltip: 1090,
  },
} as const;

// Component Size Standards
export const COMPONENT_SIZES = {
  button: {
    xs: { height: '1.5rem', padding: '0 0.5rem', fontSize: 'xs' },
    sm: { height: '2rem', padding: '0 0.75rem', fontSize: 'sm' },
    md: { height: '2.5rem', padding: '0 1rem', fontSize: 'base' },
    lg: { height: '3rem', padding: '0 1.25rem', fontSize: 'lg' },
    xl: { height: '3.5rem', padding: '0 1.5rem', fontSize: 'xl' },
  },
  input: {
    sm: { height: '2rem', padding: '0 0.75rem', fontSize: 'sm' },
    md: { height: '2.5rem', padding: '0 1rem', fontSize: 'base' },
    lg: { height: '3rem', padding: '0 1.25rem', fontSize: 'lg' },
  },
  avatar: {
    xs: '1.5rem',
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
    xl: '4rem',
    '2xl': '5rem',
  },
} as const;

// Layout Grid System
export const GRID_SYSTEM = {
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  columns: 12,
  gutter: {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  },
} as const;

// Design System Context
interface DesignSystemContextType {
  tokens: typeof DESIGN_TOKENS;
  componentSizes: typeof COMPONENT_SIZES;
  gridSystem: typeof GRID_SYSTEM;
}

const DesignSystemContext = createContext<DesignSystemContextType | null>(null);

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
};

interface DesignSystemProviderProps {
  children: ReactNode;
}

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({ children }) => {
  const value = {
    tokens: DESIGN_TOKENS,
    componentSizes: COMPONENT_SIZES,
    gridSystem: GRID_SYSTEM,
  };

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
};

// Utility Functions
export const getSpacing = (size: keyof typeof DESIGN_TOKENS.spacing) => DESIGN_TOKENS.spacing[size];
export const getColor = (color: string) => {
  const [colorName, shade] = color.split('.');
  return shade 
    ? (DESIGN_TOKENS.colors as any)[colorName]?.[shade]
    : (DESIGN_TOKENS.colors as any)[colorName];
};
export const getFontSize = (size: keyof typeof DESIGN_TOKENS.typography.fontSize) => 
  DESIGN_TOKENS.typography.fontSize[size];
export const getShadow = (size: keyof typeof DESIGN_TOKENS.boxShadow) => 
  DESIGN_TOKENS.boxShadow[size];
export const getRadius = (size: keyof typeof DESIGN_TOKENS.borderRadius) => 
  DESIGN_TOKENS.borderRadius[size];

// Component Variants System
export const createVariants = <T extends Record<string, any>>(variants: T) => variants;

// Responsive Utilities
export const responsive = {
  sm: (styles: string) => `@media (min-width: ${DESIGN_TOKENS.breakpoints.sm}) { ${styles} }`,
  md: (styles: string) => `@media (min-width: ${DESIGN_TOKENS.breakpoints.md}) { ${styles} }`,
  lg: (styles: string) => `@media (min-width: ${DESIGN_TOKENS.breakpoints.lg}) { ${styles} }`,
  xl: (styles: string) => `@media (min-width: ${DESIGN_TOKENS.breakpoints.xl}) { ${styles} }`,
  '2xl': (styles: string) => `@media (min-width: ${DESIGN_TOKENS.breakpoints['2xl']}) { ${styles} }`,
};

export default DesignSystemProvider;
