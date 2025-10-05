/**
 * GHXSTSHIP Unified Design Token System
 * Enterprise-Grade Design Tokens for Future-Proof UI Architecture
 * 
 * This is the single source of truth for all design system values.
 * All components, styles, and themes derive from these tokens.
 */

import { createComponentTokens as createEnhancedComponentTokens } from './enhanced-component-tokens';

// ==========================================
// CORE DESIGN TOKENS
// ==========================================

export const DESIGN_TOKENS = {
  // Color System - Semantic and Brand Colors
  colors: {
    // Base Colors (HSL format for better manipulation)
    base: {
      white: 'hsl(0 0% 100%)',
      black: 'hsl(0 0% 0%)',
      transparent: 'transparent',
    },

    // Gray Scale (Neutral Colors)
    gray: {
      50: 'hsl(210 40% 98%)',
      100: 'hsl(210 40% 96%)',
      200: 'hsl(214 32% 91%)',
      300: 'hsl(213 27% 84%)',
      400: 'hsl(215 20% 65%)',
      500: 'hsl(215 16% 47%)',
      600: 'hsl(215 19% 35%)',
      700: 'hsl(215 25% 27%)',
      800: 'hsl(217 33% 17%)',
      900: 'hsl(222 47% 11%)',
      950: 'hsl(229 84% 5%)',
    },

    // Brand Colors
    brand: {
      primary: {
        50: 'hsl(195 100% 95%)',
        100: 'hsl(195 100% 85%)',
        200: 'hsl(195 100% 75%)',
        300: 'hsl(195 100% 65%)',
        400: 'hsl(195 100% 55%)',
        500: 'hsl(195 100% 50%)', // Miami Blue
        600: 'hsl(195 100% 45%)',
        700: 'hsl(195 100% 40%)',
        800: 'hsl(195 100% 35%)',
        900: 'hsl(195 100% 30%)',
      },
      accent: {
        50: 'hsl(320 100% 95%)',
        100: 'hsl(320 100% 85%)',
        200: 'hsl(320 100% 75%)',
        300: 'hsl(320 100% 65%)',
        400: 'hsl(320 100% 55%)',
        500: 'hsl(320 100% 50%)', // Neon Pink
        600: 'hsl(320 100% 45%)',
        700: 'hsl(320 100% 40%)',
        800: 'hsl(320 100% 35%)',
        900: 'hsl(320 100% 30%)',
      },
    },

    // Semantic Colors
    semantic: {
      success: {
        50: 'hsl(142 76% 95%)',
        100: 'hsl(142 76% 85%)',
        500: 'hsl(142 76% 36%)',
        600: 'hsl(142 76% 32%)',
        900: 'hsl(142 76% 20%)',
      },
      warning: {
        50: 'hsl(38 92% 95%)',
        100: 'hsl(38 92% 85%)',
        500: 'hsl(38 92% 50%)',
        600: 'hsl(38 92% 45%)',
        900: 'hsl(38 92% 30%)',
      },
      error: {
        50: 'hsl(0 84% 95%)',
        100: 'hsl(0 84% 85%)',
        500: 'hsl(0 84% 60%)',
        600: 'hsl(0 84% 55%)',
        900: 'hsl(0 84% 40%)',
      },
      info: {
        50: 'hsl(199 89% 95%)',
        100: 'hsl(199 89% 85%)',
        500: 'hsl(199 89% 48%)',
        600: 'hsl(199 89% 43%)',
        900: 'hsl(199 89% 30%)',
      },
    },
  },

  // Typography System
  typography: {
    // Font Families
    fontFamily: {
      title: ['ANTON', 'system-ui', 'sans-serif'],
      body: ['Share Tech', 'system-ui', 'sans-serif'],
      mono: ['Share Tech Mono', 'Consolas', 'Monaco', 'monospace'],
    },

    // Font Sizes (using fluid typography)
    fontSize: {
      xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
      sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
      base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
      lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
      xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
      '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
      '3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem)',
      '4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',
      '5xl': 'clamp(3rem, 2.5rem + 2.5vw, 4rem)',
      '6xl': 'clamp(3.75rem, 3rem + 3.75vw, 5rem)',
    },

    // Line Heights
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },

    // Letter Spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },

    // Font Weights
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

  // Spacing System (8px base grid)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    44: '11rem',     // 176px
    48: '12rem',     // 192px
    52: '13rem',     // 208px
    56: '14rem',     // 224px
    60: '15rem',     // 240px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem',     // 384px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Border Width
  borderWidth: {
    none: '0',
    hairline: '1px',
    thin: '0.5px',
    sm: '1px',
    md: '2px',
    lg: '3px',
  },

  // Shadows (Pop Art + Traditional)
  shadows: {
    // Traditional shadows
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

    // Pop art shadows (brand-aware)
    pop: {
      sm: '2px 2px 0 hsl(0 0% 0%), 4px 4px 0 var(--color-accent)',
      base: '3px 3px 0 hsl(0 0% 0%), 6px 6px 0 var(--color-accent)',
      md: '4px 4px 0 hsl(0 0% 0%), 8px 8px 0 var(--color-accent)',
      lg: '6px 6px 0 hsl(0 0% 0%), 12px 12px 0 var(--color-accent)',
      xl: '8px 8px 0 hsl(0 0% 0%), 16px 16px 0 var(--color-accent)',
    },

    // Glow effects (brand-aware)
    glow: {
      sm: '0 0 5px hsl(var(--color-accent) / 0.5)',
      base: '0 0 10px hsl(var(--color-accent) / 0.5)',
      md: '0 0 15px hsl(var(--color-accent) / 0.5)',
      lg: '0 0 20px hsl(var(--color-accent) / 0.5)',
      xl: '0 0 25px hsl(var(--color-accent) / 0.5)',
    },

    // Semantic shadow mappings (component-aware)
    semantic: {
      // Elevation levels (0-5 scale)
      elevation: {
        0: 'none',
        1: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // Subtle border
        2: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // Card default
        3: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // Card hover
        4: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // Modal/Dropdown
        5: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Tooltip/Popover
      },
      // Component-specific shadows
      component: {
        button: {
          default: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          hover: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
          active: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          focus: '0 0 0 2px hsl(var(--color-ring) / 0.2)',
        },
        input: {
          default: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          focus: '0 0 0 2px hsl(var(--color-ring) / 0.2)',
          error: '0 0 0 2px hsl(var(--color-destructive) / 0.2)',
        },
        card: {
          default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          hover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          active: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
        },
        modal: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        dropdown: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        tooltip: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        navigation: {
          sidebar: '2px 0 4px 0 rgb(0 0 0 / 0.1)',
          topbar: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
        },
      },
    },
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Animation & Motion
  animation: {
    // Duration
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
      slowest: '1000ms',
    },

    // Easing
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
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component Sizes
  sizes: {
    xs: '1.75rem',  // 28px
    sm: '2rem',     // 32px
    md: '2.5rem',   // 40px
    lg: '3rem',     // 48px
    xl: '3.5rem',   // 56px
    '2xl': '4rem',  // 64px
  },
} as const;

// ==========================================
// SEMANTIC TOKEN MAPPINGS
// ==========================================

export const SEMANTIC_TOKENS = {
  // Light Theme Mappings
  light: {
    background: DESIGN_TOKENS.colors.base.white,
    foreground: DESIGN_TOKENS.colors.gray[900],
    card: DESIGN_TOKENS.colors.base.white,
    cardForeground: DESIGN_TOKENS.colors.gray[900],
    popover: DESIGN_TOKENS.colors.base.white,
    popoverForeground: DESIGN_TOKENS.colors.gray[900],
    primary: DESIGN_TOKENS.colors.brand.primary[500],
    primaryForeground: DESIGN_TOKENS.colors.base.white,
    secondary: DESIGN_TOKENS.colors.gray[100],
    secondaryForeground: DESIGN_TOKENS.colors.gray[900],
    muted: DESIGN_TOKENS.colors.gray[100],
    mutedForeground: DESIGN_TOKENS.colors.gray[500],
    accent: DESIGN_TOKENS.colors.brand.accent[500],
    accentForeground: DESIGN_TOKENS.colors.base.white,
    destructive: DESIGN_TOKENS.colors.semantic.error[500],
    destructiveForeground: DESIGN_TOKENS.colors.base.white,
    success: DESIGN_TOKENS.colors.semantic.success[500],
    successForeground: DESIGN_TOKENS.colors.base.white,
    warning: DESIGN_TOKENS.colors.semantic.warning[500],
    warningForeground: DESIGN_TOKENS.colors.base.white,
    info: DESIGN_TOKENS.colors.semantic.info[500],
    infoForeground: DESIGN_TOKENS.colors.base.white,
    border: DESIGN_TOKENS.colors.gray[200],
    input: DESIGN_TOKENS.colors.gray[200],
    ring: DESIGN_TOKENS.colors.brand.primary[500],
  },

  // Dark Theme Mappings
  dark: {
    background: DESIGN_TOKENS.colors.gray[950],
    foreground: DESIGN_TOKENS.colors.gray[50],
    card: DESIGN_TOKENS.colors.gray[950],
    cardForeground: DESIGN_TOKENS.colors.gray[50],
    popover: DESIGN_TOKENS.colors.gray[950],
    popoverForeground: DESIGN_TOKENS.colors.gray[50],
    primary: DESIGN_TOKENS.colors.brand.primary[400],
    primaryForeground: DESIGN_TOKENS.colors.gray[900],
    secondary: DESIGN_TOKENS.colors.gray[800],
    secondaryForeground: DESIGN_TOKENS.colors.gray[50],
    muted: DESIGN_TOKENS.colors.gray[800],
    mutedForeground: DESIGN_TOKENS.colors.gray[400],
    accent: DESIGN_TOKENS.colors.brand.accent[400],
    accentForeground: DESIGN_TOKENS.colors.gray[900],
    destructive: DESIGN_TOKENS.colors.semantic.error[500],
    destructiveForeground: DESIGN_TOKENS.colors.gray[50],
    success: DESIGN_TOKENS.colors.semantic.success[500],
    successForeground: DESIGN_TOKENS.colors.gray[50],
    warning: DESIGN_TOKENS.colors.semantic.warning[500],
    warningForeground: DESIGN_TOKENS.colors.gray[900],
    info: DESIGN_TOKENS.colors.semantic.info[500],
    infoForeground: DESIGN_TOKENS.colors.gray[50],
    border: DESIGN_TOKENS.colors.gray[800],
    input: DESIGN_TOKENS.colors.gray[800],
    ring: DESIGN_TOKENS.colors.brand.primary[400],
  },
} as const;

// ==========================================
// COMPONENT TOKEN MAPPINGS
// ==========================================

type SemanticPalette = typeof SEMANTIC_TOKENS['light'];


export const COMPONENT_TOKENS = {
  light: createEnhancedComponentTokens(SEMANTIC_TOKENS.light),
  dark: createEnhancedComponentTokens(SEMANTIC_TOKENS.dark),
  'light-high-contrast': createEnhancedComponentTokens({
    ...SEMANTIC_TOKENS.light,
    border: 'hsl(215 20% 35%)',
    mutedForeground: 'hsl(215 16% 35%)',
    foreground: 'hsl(222 47% 5%)',
    background: 'hsl(0 0% 100%)',
  }),
  'dark-high-contrast': createEnhancedComponentTokens({
    ...SEMANTIC_TOKENS.dark,
    border: 'hsl(215 20% 65%)',
    mutedForeground: 'hsl(215 16% 65%)',
    foreground: 'hsl(210 40% 100%)',
    background: 'hsl(229 84% 2%)',
  }),
} as const;
// UTILITY FUNCTIONS
// ==========================================
/**
 * Get a design token value by path
 */
export function getToken(path: string): string {
  const keys = path.split('.');
  let value: any = DESIGN_TOKENS;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Design token not found: ${path}`);
      return '';
    }
  }
  
  return value;
}

/**
 * Generate CSS custom properties from design tokens
 * @deprecated Use the generate-css-tokens.ts script instead
 */
export function generateCSSVariables(theme: 'light' | 'dark' = 'light'): string {
  const semanticTokens = SEMANTIC_TOKENS[theme];
  const componentTokens = COMPONENT_TOKENS[theme];
  
  let css = ':root {\n';
  
  // Add semantic color variables
  Object.entries(semanticTokens).forEach(([key, value]) => {
    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    css += `  --color-${cssVar}: ${value};\n`;
  });

  // Add spacing variables
  Object.entries(DESIGN_TOKENS.spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`;
  });

  // Add typography variables
  Object.entries(DESIGN_TOKENS.typography.fontSize).forEach(([key, value]) => {
    css += `  --font-size-${key}: ${value};\n`;
  });

  // Add border radius variables
  Object.entries(DESIGN_TOKENS.borderRadius).forEach(([key, value]) => {
    css += `  --radius-${key}: ${value};\n`;
  });

  // Add border width variables
  Object.entries(DESIGN_TOKENS.borderWidth).forEach(([key, value]) => {
    css += `  --border-width-${key}: ${value};\n`;
  });

  // Add shadow variables - Fixed line endings
  if (DESIGN_TOKENS.shadows.semantic) {
    // Elevation shadows
    Object.entries(DESIGN_TOKENS.shadows.semantic.elevation).forEach(([level, shadow]) => {
      css += `  --shadow-elevation-${level}: ${shadow};\n`;
    });
    // Component-specific shadows
    Object.entries(DESIGN_TOKENS.shadows.semantic.component).forEach(([component, shadows]) => {
      if (typeof shadows === "string") {
        css += `  --shadow-component-${component}: ${shadows};\n`;
      } else if (typeof shadows === "object") {
        Object.entries(shadows).forEach(([state, shadow]) => {
          if (typeof shadow === 'string') {
            css += `  --shadow-component-${component}-${state}: ${shadow};\n`;
          } else if (typeof shadow === 'object') {
            Object.entries(shadow).forEach(([subState, subShadow]) => {
              css += `  --shadow-component-${component}-${state}-${subState}: ${subShadow};\n`;
            });
          }
        });
      }
    });
  }
  
  Object.entries(DESIGN_TOKENS.shadows).forEach(([key, value]) => {
    if (typeof value === 'string') {
      css += `  --shadow-${key}: ${value};\n`;
    }
  });

  // Add component variables
  function processComponentTokens(obj: any, prefix: string = 'component') {
    Object.entries(obj).forEach(([key, value]) => {
      const cssVar = `${prefix}-${key}`.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (typeof value === 'string') {
        css += `  --${cssVar}: ${value};\n`;
      } else if (typeof value === 'object' && value !== null) {
        processComponentTokens(value, cssVar);
      }
    });
  }
  
  processComponentTokens(componentTokens);
  
  css += '}\n';
  return css;
}

/**
 * Type-safe token access
 */
export type DesignTokens = typeof DESIGN_TOKENS;
export type SemanticTokens = typeof SEMANTIC_TOKENS;
export type ColorTokens = DesignTokens['colors'];
export type SpacingTokens = DesignTokens['spacing'];
export type TypographyTokens = DesignTokens['typography'];
export type BorderWidthTokens = DesignTokens['borderWidth'];
export type ComponentTokens = typeof COMPONENT_TOKENS;
