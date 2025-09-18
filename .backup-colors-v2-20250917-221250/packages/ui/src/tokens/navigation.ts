/**
 * Navigation Design Tokens
 * 2026/2027 Standards Compliant Token System
 */

export const navigationTokens = {
  // Color System
  colors: {
    background: {
      primary: 'hsl(var(--nav-bg-primary))',
      secondary: 'hsl(var(--nav-bg-secondary))',
      tertiary: 'hsl(var(--nav-bg-tertiary))',
      overlay: 'hsl(var(--nav-bg-overlay))',
      glass: 'hsl(var(--nav-bg-glass))',
    },
    foreground: {
      primary: 'hsl(var(--nav-fg-primary))',
      secondary: 'hsl(var(--nav-fg-secondary))',
      muted: 'hsl(var(--nav-fg-muted))',
      inverse: 'hsl(var(--nav-fg-inverse))',
    },
    accent: {
      primary: 'hsl(var(--nav-accent-primary))',
      secondary: 'hsl(var(--nav-accent-secondary))',
      hover: 'hsl(var(--nav-accent-hover))',
      active: 'hsl(var(--nav-accent-active))',
      focus: 'hsl(var(--nav-accent-focus))',
    },
    border: {
      default: 'hsl(var(--nav-border-default))',
      subtle: 'hsl(var(--nav-border-subtle))',
      strong: 'hsl(var(--nav-border-strong))',
      focus: 'hsl(var(--nav-border-focus))',
    },
    state: {
      success: 'hsl(var(--nav-state-success))',
      warning: 'hsl(var(--nav-state-warning))',
      error: 'hsl(var(--nav-state-error))',
      info: 'hsl(var(--nav-state-info))',
    },
  },

  // Spacing System
  spacing: {
    xs: 'var(--nav-spacing-xs)', // 0.25rem
    sm: 'var(--nav-spacing-sm)', // 0.5rem
    md: 'var(--nav-spacing-md)', // 1rem
    lg: 'var(--nav-spacing-lg)', // 1.5rem
    xl: 'var(--nav-spacing-xl)', // 2rem
    '2xl': 'var(--nav-spacing-2xl)', // 3rem
  },

  // Typography
  typography: {
    fontFamily: {
      primary: 'var(--nav-font-primary)',
      secondary: 'var(--nav-font-secondary)',
      mono: 'var(--nav-font-mono)',
    },
    fontSize: {
      xs: 'var(--nav-text-xs)', // 0.75rem
      sm: 'var(--nav-text-sm)', // 0.875rem
      base: 'var(--nav-text-base)', // 1rem
      lg: 'var(--nav-text-lg)', // 1.125rem
      xl: 'var(--nav-text-xl)', // 1.25rem
    },
    fontWeight: {
      normal: 'var(--nav-weight-normal)', // 400
      medium: 'var(--nav-weight-medium)', // 500
      semibold: 'var(--nav-weight-semibold)', // 600
      bold: 'var(--nav-weight-bold)', // 700
    },
    lineHeight: {
      tight: 'var(--nav-leading-tight)', // 1.25
      normal: 'var(--nav-leading-normal)', // 1.5
      relaxed: 'var(--nav-leading-relaxed)', // 1.75
    },
  },

  // Animation System
  animation: {
    duration: {
      fast: 'var(--nav-duration-fast)', // 150ms
      normal: 'var(--nav-duration-normal)', // 200ms
      slow: 'var(--nav-duration-slow)', // 300ms
      slower: 'var(--nav-duration-slower)', // 500ms
    },
    easing: {
      linear: 'var(--nav-easing-linear)',
      easeIn: 'var(--nav-easing-ease-in)',
      easeOut: 'var(--nav-easing-ease-out)',
      easeInOut: 'var(--nav-easing-ease-in-out)',
      spring: 'var(--nav-easing-spring)',
    },
    scale: {
      enter: 'var(--nav-scale-enter)', // 0.95
      exit: 'var(--nav-scale-exit)', // 0.98
      hover: 'var(--nav-scale-hover)', // 1.02
      active: 'var(--nav-scale-active)', // 0.98
    },
  },

  // Layout System
  layout: {
    width: {
      sidebar: {
        collapsed: 'var(--nav-width-collapsed)', // 4rem
        expanded: 'var(--nav-width-expanded)', // 16rem
        wide: 'var(--nav-width-wide)', // 20rem
      },
      mobile: {
        overlay: 'var(--nav-width-mobile)', // 80vw
        max: 'var(--nav-width-mobile-max)', // 20rem
      },
    },
    height: {
      header: 'var(--nav-height-header)', // 4rem
      item: 'var(--nav-height-item)', // 2.5rem
      compact: 'var(--nav-height-compact)', // 2rem
    },
    zIndex: {
      sidebar: 'var(--nav-z-sidebar)', // 40
      overlay: 'var(--nav-z-overlay)', // 50
      dropdown: 'var(--nav-z-dropdown)', // 60
      tooltip: 'var(--nav-z-tooltip)', // 70
    },
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: 'var(--nav-radius-sm)', // 0.25rem
    md: 'var(--nav-radius-md)', // 0.375rem
    lg: 'var(--nav-radius-lg)', // 0.5rem
    xl: 'var(--nav-radius-xl)', // 0.75rem
    full: '9999px',
  },

  // Shadow System
  shadow: {
    sm: 'var(--nav-shadow-sm)',
    md: 'var(--nav-shadow-md)',
    lg: 'var(--nav-shadow-lg)',
    xl: 'var(--nav-shadow-xl)',
    inner: 'var(--nav-shadow-inner)',
    focus: 'var(--nav-shadow-focus)',
  },

  // Backdrop System
  backdrop: {
    blur: {
      sm: 'var(--nav-backdrop-blur-sm)', // 4px
      md: 'var(--nav-backdrop-blur-md)', // 8px
      lg: 'var(--nav-backdrop-blur-lg)', // 16px
    },
    opacity: {
      light: 'var(--nav-backdrop-opacity-light)', // 0.1
      medium: 'var(--nav-backdrop-opacity-medium)', // 0.5
      heavy: 'var(--nav-backdrop-opacity-heavy)', // 0.8
    },
  },
} as const;

// CSS Custom Properties for Tailwind Integration
export const navigationCSSVariables = `
  /* Navigation Color System */
  --nav-bg-primary: 255 255 255;
  --nav-bg-secondary: 248 250 252;
  --nav-bg-tertiary: 241 245 249;
  --nav-bg-overlay: 0 0 0 / 0.5;
  --nav-bg-glass: 255 255 255 / 0.95;

  --nav-fg-primary: 15 23 42;
  --nav-fg-secondary: 51 65 85;
  --nav-fg-muted: 100 116 139;
  --nav-fg-inverse: 255 255 255;

  --nav-accent-primary: 59 130 246;
  --nav-accent-secondary: 147 197 253;
  --nav-accent-hover: 37 99 235;
  --nav-accent-active: 29 78 216;
  --nav-accent-focus: 59 130 246;

  --nav-border-default: 226 232 240;
  --nav-border-subtle: 241 245 249;
  --nav-border-strong: 203 213 225;
  --nav-border-focus: 59 130 246;

  --nav-state-success: 34 197 94;
  --nav-state-warning: 245 158 11;
  --nav-state-error: 239 68 68;
  --nav-state-info: 59 130 246;

  /* Navigation Spacing */
  --nav-spacing-xs: 0.25rem;
  --nav-spacing-sm: 0.5rem;
  --nav-spacing-md: 1rem;
  --nav-spacing-lg: 1.5rem;
  --nav-spacing-xl: 2rem;
  --nav-spacing-2xl: 3rem;

  /* Navigation Typography */
  --nav-font-primary: var(--font-body), system-ui, sans-serif;
  --nav-font-secondary: var(--font-title), system-ui, sans-serif;
  --nav-font-mono: var(--font-mono), monospace;

  --nav-text-xs: 0.75rem;
  --nav-text-sm: 0.875rem;
  --nav-text-base: 1rem;
  --nav-text-lg: 1.125rem;
  --nav-text-xl: 1.25rem;

  --nav-weight-normal: 400;
  --nav-weight-medium: 500;
  --nav-weight-semibold: 600;
  --nav-weight-bold: 700;

  --nav-leading-tight: 1.25;
  --nav-leading-normal: 1.5;
  --nav-leading-relaxed: 1.75;

  /* Navigation Animation */
  --nav-duration-fast: 150ms;
  --nav-duration-normal: 200ms;
  --nav-duration-slow: 300ms;
  --nav-duration-slower: 500ms;

  --nav-easing-linear: linear;
  --nav-easing-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --nav-easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --nav-easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --nav-easing-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  --nav-scale-enter: 0.95;
  --nav-scale-exit: 0.98;
  --nav-scale-hover: 1.02;
  --nav-scale-active: 0.98;

  /* Navigation Layout */
  --nav-width-collapsed: 4rem;
  --nav-width-expanded: 16rem;
  --nav-width-wide: 20rem;
  --nav-width-mobile: 80vw;
  --nav-width-mobile-max: 20rem;

  --nav-height-header: 4rem;
  --nav-height-item: 2.5rem;
  --nav-height-compact: 2rem;

  --nav-z-sidebar: 40;
  --nav-z-overlay: 50;
  --nav-z-dropdown: 60;
  --nav-z-tooltip: 70;

  /* Navigation Border Radius */
  --nav-radius-sm: 0.25rem;
  --nav-radius-md: 0.375rem;
  --nav-radius-lg: 0.5rem;
  --nav-radius-xl: 0.75rem;

  /* Navigation Shadows */
  --nav-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --nav-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --nav-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --nav-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --nav-shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --nav-shadow-focus: 0 0 0 3px rgb(59 130 246 / 0.1);

  /* Navigation Backdrop */
  --nav-backdrop-blur-sm: 4px;
  --nav-backdrop-blur-md: 8px;
  --nav-backdrop-blur-lg: 16px;

  --nav-backdrop-opacity-light: 0.1;
  --nav-backdrop-opacity-medium: 0.5;
  --nav-backdrop-opacity-heavy: 0.8;

  /* Dark Mode Overrides */
  @media (prefers-color-scheme: dark) {
    --nav-bg-primary: 15 23 42;
    --nav-bg-secondary: 30 41 59;
    --nav-bg-tertiary: 51 65 85;
    --nav-bg-glass: 15 23 42 / 0.95;

    --nav-fg-primary: 248 250 252;
    --nav-fg-secondary: 203 213 225;
    --nav-fg-muted: 148 163 184;
    --nav-fg-inverse: 15 23 42;

    --nav-border-default: 51 65 85;
    --nav-border-subtle: 30 41 59;
    --nav-border-strong: 71 85 105;
  }
`;

// Type-safe token access
export type NavigationTokens = typeof navigationTokens;
export type NavigationColorTokens = keyof typeof navigationTokens.colors;
export type NavigationSpacingTokens = keyof typeof navigationTokens.spacing;
export type NavigationTypographyTokens = keyof typeof navigationTokens.typography;
