// Design Token System - GHXSTSHIP Enterprise Design System
// Zero Tolerance Semantic Token Architecture

export interface DesignTokens {
  // Primitive Layer - Raw values, no semantics
  primitives: {
    colors: {
      white: string;
      black: string;
      // Neutral scale for backgrounds, borders, etc.
      neutrals: Record<string, string>;
      // Accent colors as HSL values
      accents: Record<string, string>;
    };
    spacing: Record<string, string>;
    typography: {
      fontFamilies: Record<string, string>;
      fontSizes: Record<string, string>;
      fontWeights: Record<string, string>;
      lineHeights: Record<string, string>;
      letterSpacings: Record<string, string>;
    };
    shadows: Record<string, string>;
    borders: {
      radii: Record<string, string>;
      widths: Record<string, string>;
    };
    motion: {
      durations: Record<string, string>;
      easings: Record<string, string>;
    };
    zIndex: Record<string, string>;
  };

  // Semantic Layer - Meaningful names, theme-aware
  semantic: {
    colors: {
      // Core semantic colors (theme-aware)
      background: { light: string; dark: string };
      foreground: { light: string; dark: string };
      card: { light: string; dark: string };
      popover: { light: string; dark: string };
      primary: { light: string; dark: string };
      secondary: { light: string; dark: string };
      muted: { light: string; dark: string };
      accent: { light: string; dark: string };
      destructive: { light: string; dark: string };
      success: { light: string; dark: string };
      warning: { light: string; dark: string };
      info: { light: string; dark: string };
      border: { light: string; dark: string };
      input: { light: string; dark: string };
      ring: { light: string; dark: string };
    };
    spacing: Record<string, string>; // Maps to primitives.spacing
    typography: {
      title: string;
      body: string;
      mono: string;
      sizes: Record<string, string>;
      weights: Record<string, string>;
      heights: Record<string, string>;
      spacings: Record<string, string>;
    };
    shadows: Record<string, string>; // Semantic elevation levels
    borders: {
      radii: Record<string, string>;
      widths: Record<string, string>;
    };
    motion: {
      fast: string;
      normal: string;
      slow: string;
      easing: string;
    };
    zIndex: Record<string, string>;
  };

  // Component Layer - Specific to component usage
  components: {
    button: {
      background: { default: string; hover: string; active: string };
      foreground: { default: string; hover: string; active: string };
      border: { default: string; hover: string; active: string };
      shadow: { default: string; hover: string; active: string };
    };
    card: {
      background: string;
      foreground: string;
      border: string;
      shadow: string;
    };
    input: {
      background: string;
      foreground: string;
      border: string;
      shadow: string;
      focusRing: string;
    };
    // Extended component tokens for comprehensive UI system
    modal: {
      backdrop: string;
      background: string;
      foreground: string;
      border: string;
      shadow: string;
      header: {
        background: string;
        foreground: string;
        border: string;
      };
      footer: {
        background: string;
        border: string;
      };
    };
    alert: {
      background: { info: string; success: string; warning: string; error: string };
      foreground: { info: string; success: string; warning: string; error: string };
      border: { info: string; success: string; warning: string; error: string };
      icon: { info: string; success: string; warning: string; error: string };
    };
    table: {
      background: string;
      foreground: string;
      border: string;
      header: {
        background: string;
        foreground: string;
        border: string;
      };
      row: {
        background: { default: string; hover: string; selected: string };
        border: string;
      };
      cell: {
        padding: string;
        border: string;
      };
    };
    navigation: {
      background: string;
      foreground: string;
      border: string;
      item: {
        background: { default: string; hover: string; active: string };
        foreground: { default: string; hover: string; active: string };
        border: { default: string; active: string };
      };
      submenu: {
        background: string;
        border: string;
        shadow: string;
      };
    };
    form: {
      label: {
        foreground: string;
        fontSize: string;
        fontWeight: string;
      };
      help: {
        foreground: string;
        fontSize: string;
      };
      error: {
        foreground: string;
        fontSize: string;
        border: string;
      };
      fieldset: {
        border: string;
        legend: {
          foreground: string;
          fontSize: string;
          fontWeight: string;
        };
      };
    };
    dropdown: {
      background: string;
      foreground: string;
      border: string;
      shadow: string;
      item: {
        background: { default: string; hover: string; active: string };
        foreground: { default: string; hover: string; active: string };
      };
      separator: string;
    };
    tooltip: {
      background: string;
      foreground: string;
      border: string;
      shadow: string;
      arrow: string;
    };
    badge: {
      background: { default: string; secondary: string; destructive: string; outline: string };
      foreground: { default: string; secondary: string; destructive: string; outline: string };
      border?: { outline: string };
    };
    tabs: {
      background: string;
      border: string;
      tab: {
        background: { default: string; hover: string; active: string };
        foreground: { default: string; hover: string; active: string };
        border: { default: string; active: string };
      };
      content: {
        background: string;
        border: string;
      };
    };
    sidebar: {
      background: string;
      foreground: string;
      border: string;
      width: { collapsed: string; expanded: string };
      item: {
        background: { default: string; hover: string; active: string };
        foreground: { default: string; hover: string; active: string };
        border: { default: string; active: string };
        icon: { default: string; active: string };
      };
    };
    // Add other components as needed
  };

  // Contextual variants for brands/departments
  contexts: {
    departments: Record<string, { primary: string; accent: string }>;
    subway: Record<string, { primary: string; accent: string }>;
  };

  // Theme configurations
  themes: {
    light: Record<string, string>;
    dark: Record<string, string>;
    'high-contrast-light': Record<string, string>;
    'high-contrast-dark': Record<string, string>;
  };
}

// Complete token definition
export const designTokens: DesignTokens = {
  primitives: {
    colors: {
      white: 'hsl(0 0% 100%)',
      black: 'hsl(0 0% 0%)',
      neutrals: {
        '50': 'hsl(210 40% 98%)',
        '100': 'hsl(210 40% 96%)',
        '200': 'hsl(214 32% 91%)',
        '300': 'hsl(213 27% 84%)',
        '400': 'hsl(215 20% 65%)',
        '500': 'hsl(215 16% 47%)',
        '600': 'hsl(215 19% 35%)',
        '700': 'hsl(215 25% 27%)',
        '800': 'hsl(217 33% 17%)',
        '900': 'hsl(222 47% 11%)',
        '950': 'hsl(229 84% 5%)',
      },
      accents: {
        primary: 'hsl(158 64% 52%)',
        secondary: 'hsl(210 40% 96%)',
        accent: 'hsl(158 64% 52%)',
        destructive: 'hsl(0 84% 60%)',
        success: 'hsl(142 76% 36%)',
        warning: 'hsl(43 96% 56%)',
        info: 'hsl(217 91% 60%)',
      },
    },
    spacing: {
      '0': '0',
      'px': '1px',
      '0.5': '0.125rem',
      '1': '0.25rem',
      '1.5': '0.375rem',
      '2': '0.5rem',
      '2.5': '0.625rem',
      '3': '0.75rem',
      '3.5': '0.875rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '7': '1.75rem',
      '8': '2rem',
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
      '32': '8rem',
      '40': '10rem',
      '48': '12rem',
      '56': '14rem',
      '64': '16rem',
    },
    typography: {
      fontFamilies: {
        title: "'ANTON', system-ui, sans-serif",
        body: "'Share Tech', system-ui, sans-serif",
        mono: "'Share Tech Mono', 'Consolas', monospace",
        display: "'ANTON', system-ui, sans-serif",
      },
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      fontWeights: {
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
      lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacings: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    shadows: {
      none: '0 0 #0000',
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      outline: '0 0 0 3px rgb(59 130 246 / 0.5)',
      soft: '0 2px 15px 0 rgb(0 0 0 / 0.08)',
      elevated: '0 4px 25px 0 rgb(0 0 0 / 0.15)',
      'pop-sm': '3px 3px 0 hsl(0 0% 0%), 6px 6px 0 hsl(var(--color-accent))',
      'pop-base': '4px 4px 0 hsl(0 0% 0%), 8px 8px 0 hsl(var(--color-accent))',
      'pop-md': '6px 6px 0 hsl(0 0% 0%), 12px 12px 0 hsl(var(--color-accent))',
    },
    borders: {
      radii: {
        none: '0',
        xs: '0.125rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      widths: {
        '0': '0',
        '1': '1px',
        '2': '2px',
        '4': '4px',
        '8': '8px',
      },
    },
    motion: {
      durations: {
        instant: '0ms',
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easings: {
        linear: 'linear',
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
    zIndex: {
      '0': '0',
      '10': '10',
      '20': '20',
      '30': '30',
      '40': '40',
      '50': '50',
      '60': '60',
      '70': '70',
      '80': '80',
      '90': '90',
      '100': '100',
      dropdown: '1000',
      sticky: '1020',
      fixed: '1030',
      'modal-backdrop': '1040',
      modal: '1050',
      popover: '1060',
      tooltip: '1070',
      toast: '1080',
    },
  },

  semantic: {
    colors: {
      background: { light: 'hsl(0 0% 100%)', dark: 'hsl(229 84% 5%)' },
      foreground: { light: 'hsl(222 47% 11%)', dark: 'hsl(210 40% 98%)' },
      card: { light: 'hsl(0 0% 100%)', dark: 'hsl(229 84% 5%)' },
      popover: { light: 'hsl(0 0% 100%)', dark: 'hsl(229 84% 5%)' },
      primary: { light: 'hsl(158 64% 52%)', dark: 'hsl(158 64% 48%)' },
      secondary: { light: 'hsl(210 40% 96%)', dark: 'hsl(217 33% 17%)' },
      muted: { light: 'hsl(210 40% 96%)', dark: 'hsl(217 33% 17%)' },
      accent: { light: 'hsl(158 64% 52%)', dark: 'hsl(158 64% 48%)' },
      destructive: { light: 'hsl(0 84% 60%)', dark: 'hsl(0 84% 60%)' },
      success: { light: 'hsl(142 76% 36%)', dark: 'hsl(142 76% 36%)' },
      warning: { light: 'hsl(43 96% 56%)', dark: 'hsl(43 96% 56%)' },
      info: { light: 'hsl(217 91% 60%)', dark: 'hsl(217 91% 60%)' },
      border: { light: 'hsl(214 32% 91%)', dark: 'hsl(0 0% 100% / 0.2)' },
      input: { light: 'hsl(214 32% 91%)', dark: 'hsl(0 0% 100% / 0.2)' },
      ring: { light: 'hsl(158 64% 52%)', dark: 'hsl(158 64% 48%)' },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
      '5xl': '8rem',
    },
    typography: {
      title: 'ANTON, system-ui, sans-serif',
      body: 'Share Tech, system-ui, sans-serif',
      mono: 'Share Tech Mono, Consolas, monospace',
      sizes: {
        display: 'clamp(2.5rem, 8vw, 4rem)',
        h1: 'clamp(2rem, 6vw, 3rem)',
        h2: 'clamp(1.5rem, 4vw, 2.25rem)',
        h3: 'clamp(1.25rem, 3vw, 1.75rem)',
        h4: 'clamp(1rem, 2.5vw, 1.5rem)',
        body: '1rem',
        'body-lg': '1.125rem',
        'body-sm': '0.875rem',
        caption: '0.75rem',
        code: '0.875rem',
      },
      weights: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
      },
      heights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      spacings: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    shadows: {
      none: '0 0 #0000',
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      outline: '0 0 0 3px rgb(59 130 246 / 0.5)',
      soft: '0 2px 15px 0 rgb(0 0 0 / 0.08)',
      elevated: '0 4px 25px 0 rgb(0 0 0 / 0.15)',
      'pop-sm': '3px 3px 0 hsl(0 0% 0%), 6px 6px 0 hsl(var(--color-accent))',
      'pop-base': '4px 4px 0 hsl(0 0% 0%), 8px 8px 0 hsl(var(--color-accent))',
      'pop-md': '6px 6px 0 hsl(0 0% 0%), 12px 12px 0 hsl(var(--color-accent))',
    },
    borders: {
      radii: {
        none: '0',
        xs: '0.125rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      widths: {
        none: '0',
        thin: '1px',
        normal: '2px',
        thick: '4px',
        heavy: '8px',
      },
    },
    motion: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    zIndex: {
      dropdown: '1000',
      sticky: '1020',
      fixed: '1030',
      'modal-backdrop': '1040',
      modal: '1050',
      popover: '1060',
      tooltip: '1070',
      toast: '1080',
    },
  },

  components: {
    button: {
      background: {
        default: 'hsl(var(--color-secondary))',
        hover: 'hsl(var(--color-secondary) / 0.8)',
        active: 'hsl(var(--color-secondary) / 0.95)',
      },
      foreground: {
        default: 'hsl(var(--color-secondary-foreground))',
        hover: 'hsl(var(--color-secondary-foreground))',
        active: 'hsl(var(--color-secondary-foreground))',
      },
      border: {
        default: 'hsl(var(--color-border))',
        hover: 'hsl(var(--color-border))',
        active: 'hsl(var(--color-border))',
      },
      shadow: {
        default: 'var(--shadow-sm)',
        hover: 'var(--shadow-md)',
        active: 'var(--shadow-sm)',
      },
    },
    card: {
      background: 'hsl(var(--color-card))',
      foreground: 'hsl(var(--color-card-foreground))',
      border: 'hsl(var(--color-border))',
      shadow: 'var(--shadow-sm)',
    },
    input: {
      background: 'hsl(var(--color-background))',
      foreground: 'hsl(var(--color-foreground))',
      border: 'hsl(var(--color-input))',
      shadow: 'var(--shadow-sm)',
      focusRing: '0 0 0 2px hsl(var(--color-ring))',
    },
    // Extended component tokens for comprehensive UI system
    modal: {
      backdrop: 'hsl(var(--color-background) / 0.8)',
      background: 'hsl(var(--color-background))',
      foreground: 'hsl(var(--color-foreground))',
      border: 'hsl(var(--color-border))',
      shadow: 'var(--shadow-xl)',
      header: {
        background: 'hsl(var(--color-card))',
        foreground: 'hsl(var(--color-card-foreground))',
        border: 'hsl(var(--color-border))',
      },
      footer: {
        background: 'hsl(var(--color-card))',
        border: 'hsl(var(--color-border))',
      },
    },
    alert: {
      background: {
        info: 'hsl(var(--color-info) / 0.1)',
        success: 'hsl(var(--color-success) / 0.1)',
        warning: 'hsl(var(--color-warning) / 0.1)',
        error: 'hsl(var(--color-destructive) / 0.1)',
      },
      foreground: {
        info: 'hsl(var(--color-info))',
        success: 'hsl(var(--color-success))',
        warning: 'hsl(var(--color-warning))',
        error: 'hsl(var(--color-destructive))',
      },
      border: {
        info: 'hsl(var(--color-info) / 0.5)',
        success: 'hsl(var(--color-success) / 0.5)',
        warning: 'hsl(var(--color-warning) / 0.5)',
        error: 'hsl(var(--color-destructive) / 0.5)',
      },
      icon: {
        info: 'hsl(var(--color-info))',
        success: 'hsl(var(--color-success))',
        warning: 'hsl(var(--color-warning))',
        error: 'hsl(var(--color-destructive))',
      },
    },
    table: {
      background: 'hsl(var(--color-background))',
      foreground: 'hsl(var(--color-foreground))',
      border: 'hsl(var(--color-border))',
      header: {
        background: 'hsl(var(--color-muted))',
        foreground: 'hsl(var(--color-muted-foreground))',
        border: 'hsl(var(--color-border))',
      },
      row: {
        background: {
          default: 'transparent',
          hover: 'hsl(var(--color-muted) / 0.5)',
          selected: 'hsl(var(--color-accent) / 0.1)',
        },
        border: 'hsl(var(--color-border))',
      },
      cell: {
        padding: 'var(--spacing-3) var(--spacing-4)',
        border: 'hsl(var(--color-border))',
      },
    },
    navigation: {
      background: 'hsl(var(--color-card))',
      foreground: 'hsl(var(--color-card-foreground))',
      border: 'hsl(var(--color-border))',
      item: {
        background: {
          default: 'transparent',
          hover: 'hsl(var(--color-accent) / 0.1)',
          active: 'hsl(var(--color-accent) / 0.1)',
        },
        foreground: {
          default: 'hsl(var(--color-foreground))',
          hover: 'hsl(var(--color-accent))',
          active: 'hsl(var(--color-accent))',
        },
        border: {
          default: 'transparent',
          active: 'hsl(var(--color-accent))',
        },
      },
      submenu: {
        background: 'hsl(var(--color-popover))',
        border: 'hsl(var(--color-border))',
        shadow: 'var(--shadow-lg)',
      },
    },
    form: {
      label: {
        foreground: 'hsl(var(--color-foreground))',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
      },
      help: {
        foreground: 'hsl(var(--color-muted-foreground))',
        fontSize: 'var(--font-size-xs)',
      },
      error: {
        foreground: 'hsl(var(--color-destructive))',
        fontSize: 'var(--font-size-sm)',
        border: 'hsl(var(--color-destructive) / 0.5)',
      },
      fieldset: {
        border: 'hsl(var(--color-border))',
        legend: {
          foreground: 'hsl(var(--color-foreground))',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
        },
      },
    },
    dropdown: {
      background: 'hsl(var(--color-popover))',
      foreground: 'hsl(var(--color-popover-foreground))',
      border: 'hsl(var(--color-border))',
      shadow: 'var(--shadow-lg)',
      item: {
        background: {
          default: 'transparent',
          hover: 'hsl(var(--color-accent) / 0.1)',
          active: 'hsl(var(--color-accent) / 0.1)',
        },
        foreground: {
          default: 'hsl(var(--color-popover-foreground))',
          hover: 'hsl(var(--color-accent))',
          active: 'hsl(var(--color-accent))',
        },
      },
      separator: 'hsl(var(--color-border))',
    },
    tooltip: {
      background: 'hsl(var(--color-popover))',
      foreground: 'hsl(var(--color-popover-foreground))',
      border: 'hsl(var(--color-border))',
      shadow: 'var(--shadow-md)',
      arrow: 'hsl(var(--color-popover))',
    },
    badge: {
      background: {
        default: 'hsl(var(--color-accent))',
        secondary: 'hsl(var(--color-secondary))',
        destructive: 'hsl(var(--color-destructive))',
        outline: 'transparent',
      },
      foreground: {
        default: 'hsl(var(--color-accent-foreground))',
        secondary: 'hsl(var(--color-secondary-foreground))',
        destructive: 'hsl(var(--color-destructive-foreground))',
        outline: 'hsl(var(--color-foreground))',
      },
      border: {
        outline: 'hsl(var(--color-border))',
      },
    },
    tabs: {
      background: 'hsl(var(--color-background))',
      border: 'hsl(var(--color-border))',
      tab: {
        background: {
          default: 'transparent',
          hover: 'hsl(var(--color-muted) / 0.5)',
          active: 'hsl(var(--color-background))',
        },
        foreground: {
          default: 'hsl(var(--color-muted-foreground))',
          hover: 'hsl(var(--color-foreground))',
          active: 'hsl(var(--color-foreground))',
        },
        border: {
          default: 'transparent',
          active: 'hsl(var(--color-border))',
        },
      },
      content: {
        background: 'hsl(var(--color-background))',
        border: 'hsl(var(--color-border))',
      },
    },
    sidebar: {
      background: 'hsl(var(--color-card))',
      foreground: 'hsl(var(--color-card-foreground))',
      border: 'hsl(var(--color-border))',
      width: {
        collapsed: '4rem',
        expanded: '16rem',
      },
      item: {
        background: {
          default: 'transparent',
          hover: 'hsl(var(--color-accent) / 0.1)',
          active: 'hsl(var(--color-accent) / 0.1)',
        },
        foreground: {
          default: 'hsl(var(--color-foreground))',
          hover: 'hsl(var(--color-accent))',
          active: 'hsl(var(--color-accent))',
        },
        border: {
          default: 'transparent',
          active: 'hsl(var(--color-accent))',
        },
        icon: {
          default: 'hsl(var(--color-muted-foreground))',
          active: 'hsl(var(--color-accent))',
        },
      },
    },
  },

  contexts: {
    departments: {
      xla: { primary: 'hsl(var(--color-primary))', accent: 'hsl(var(--color-accent))' },
      fpl: { primary: 'hsl(var(--color-success))', accent: 'hsl(var(--color-success))' },
      cds: { primary: 'hsl(var(--color-accent))', accent: 'hsl(var(--color-accent))' },
      epr: { primary: 'hsl(var(--color-warning))', accent: 'hsl(var(--color-warning))' },
      mmm: { primary: 'hsl(var(--color-info))', accent: 'hsl(var(--color-info))' },
      sed: { primary: 'hsl(142 76% 36%)', accent: 'hsl(142 76% 36%)' },
      sol: { primary: 'hsl(38 92% 50%)', accent: 'hsl(38 92% 50%)' },
      itc: { primary: 'hsl(220 70% 50%)', accent: 'hsl(220 70% 50%)' },
      xtp: { primary: 'hsl(271 81% 56%)', accent: 'hsl(271 81% 56%)' },
      bgs: { primary: 'hsl(var(--color-destructive))', accent: 'hsl(var(--color-destructive))' },
      pss: { primary: 'hsl(0 0% 45%)', accent: 'hsl(0 0% 45%)' },
      gsx: { primary: 'hsl(142 71% 45%)', accent: 'hsl(142 71% 45%)' },
      hfb: { primary: 'hsl(25 95% 53%)', accent: 'hsl(25 95% 53%)' },
      ent: { primary: 'hsl(280 100% 70%)', accent: 'hsl(280 100% 70%)' },
      tdx: { primary: 'hsl(200 100% 50%)', accent: 'hsl(200 100% 50%)' },
    },
    subway: {
      red: { primary: 'hsl(var(--color-destructive))', accent: 'hsl(var(--color-destructive))' },
      blue: { primary: 'hsl(var(--color-primary))', accent: 'hsl(var(--color-primary))' },
      green: { primary: 'hsl(var(--color-success))', accent: 'hsl(var(--color-success))' },
      orange: { primary: 'hsl(var(--color-warning))', accent: 'hsl(var(--color-warning))' },
      purple: { primary: 'hsl(var(--color-accent))', accent: 'hsl(var(--color-accent))' },
      yellow: { primary: 'hsl(var(--color-warning))', accent: 'hsl(var(--color-warning))' },
      grey: { primary: 'hsl(var(--color-muted))', accent: 'hsl(var(--color-foreground))' },
    },
  },

  themes: {
    light: {
      '--color-background': 'hsl(0 0% 100%)',
      '--color-foreground': 'hsl(222 47% 11%)',
      '--color-card': 'hsl(0 0% 100%)',
      '--color-card-foreground': 'hsl(222 47% 11%)',
      '--color-popover': 'hsl(0 0% 100%)',
      '--color-popover-foreground': 'hsl(222 47% 11%)',
      '--color-primary': 'hsl(158 64% 52%)',
      '--color-primary-foreground': 'hsl(0 0% 100%)',
      '--color-secondary': 'hsl(210 40% 96%)',
      '--color-secondary-foreground': 'hsl(222 47% 11%)',
      '--color-muted': 'hsl(210 40% 96%)',
      '--color-muted-foreground': 'hsl(215 16% 47%)',
      '--color-accent': 'hsl(158 64% 52%)',
      '--color-accent-foreground': 'hsl(0 0% 100%)',
      '--color-destructive': 'hsl(0 84% 60%)',
      '--color-destructive-foreground': 'hsl(0 0% 100%)',
      '--color-success': 'hsl(142 76% 36%)',
      '--color-success-foreground': 'hsl(0 0% 100%)',
      '--color-warning': 'hsl(43 96% 56%)',
      '--color-warning-foreground': 'hsl(0 0% 100%)',
      '--color-info': 'hsl(217 91% 60%)',
      '--color-info-foreground': 'hsl(0 0% 100%)',
      '--color-border': 'hsl(214 32% 91%)',
      '--color-input': 'hsl(214 32% 91%)',
      '--color-ring': 'hsl(158 64% 52%)',
    },
    dark: {
      '--color-background': 'hsl(229 84% 5%)',
      '--color-foreground': 'hsl(210 40% 98%)',
      '--color-card': 'hsl(229 84% 5%)',
      '--color-card-foreground': 'hsl(210 40% 98%)',
      '--color-popover': 'hsl(229 84% 5%)',
      '--color-popover-foreground': 'hsl(210 40% 98%)',
      '--color-primary': 'hsl(158 64% 48%)',
      '--color-primary-foreground': 'hsl(222 47% 11%)',
      '--color-secondary': 'hsl(217 33% 17%)',
      '--color-secondary-foreground': 'hsl(210 40% 98%)',
      '--color-muted': 'hsl(217 33% 17%)',
      '--color-muted-foreground': 'hsl(215 20% 65%)',
      '--color-accent': 'hsl(158 64% 48%)',
      '--color-accent-foreground': 'hsl(222 47% 11%)',
      '--color-border': 'hsl(0 0% 100% / 0.2)',
      '--color-input': 'hsl(0 0% 100% / 0.2)',
      '--color-ring': 'hsl(158 64% 48%)',
    },
    'high-contrast-light': {
      '--color-background': 'hsl(0 0% 100%)',
      '--color-foreground': 'hsl(222 47% 5%)',
      '--color-card': 'hsl(0 0% 100%)',
      '--color-card-foreground': 'hsl(222 47% 5%)',
      '--color-popover': 'hsl(0 0% 100%)',
      '--color-popover-foreground': 'hsl(222 47% 5%)',
      '--color-primary': 'hsl(158 64% 52%)',
      '--color-primary-foreground': 'hsl(0 0% 0%)',
      '--color-secondary': 'hsl(0 0% 95%)',
      '--color-secondary-foreground': 'hsl(222 47% 5%)',
      '--color-muted': 'hsl(0 0% 95%)',
      '--color-muted-foreground': 'hsl(222 47% 5%)',
      '--color-accent': 'hsl(158 64% 52%)',
      '--color-accent-foreground': 'hsl(0 0% 0%)',
      '--color-destructive': 'hsl(0 84% 60%)',
      '--color-destructive-foreground': 'hsl(0 0% 0%)',
      '--color-success': 'hsl(142 76% 36%)',
      '--color-success-foreground': 'hsl(0 0% 0%)',
      '--color-warning': 'hsl(43 96% 56%)',
      '--color-warning-foreground': 'hsl(0 0% 0%)',
      '--color-info': 'hsl(217 91% 60%)',
      '--color-info-foreground': 'hsl(0 0% 0%)',
      '--color-border': 'hsl(215 20% 35%)',
      '--color-input': 'hsl(215 20% 35%)',
      '--color-ring': 'hsl(158 64% 52%)',
    },
    'high-contrast-dark': {
      '--color-background': 'hsl(0 0% 0%)',
      '--color-foreground': 'hsl(0 0% 100%)',
      '--color-card': 'hsl(0 0% 0%)',
      '--color-card-foreground': 'hsl(0 0% 100%)',
      '--color-popover': 'hsl(0 0% 0%)',
      '--color-popover-foreground': 'hsl(0 0% 100%)',
      '--color-primary': 'hsl(158 64% 48%)',
      '--color-primary-foreground': 'hsl(0 0% 0%)',
      '--color-secondary': 'hsl(0 0% 10%)',
      '--color-secondary-foreground': 'hsl(0 0% 100%)',
      '--color-muted': 'hsl(0 0% 10%)',
      '--color-muted-foreground': 'hsl(0 0% 100%)',
      '--color-accent': 'hsl(158 64% 48%)',
      '--color-accent-foreground': 'hsl(0 0% 0%)',
      '--color-border': 'hsl(0 0% 100%)',
      '--color-input': 'hsl(0 0% 100%)',
      '--color-ring': 'hsl(158 64% 48%)',
    },
  },
};

// Utility functions for token access
export function getPrimitiveToken(path: string): string {
  const keys = path.split('.');
  let current: any = designTokens.primitives;
  for (const key of keys) {
    current = current?.[key];
  }
  return current || path;
}

export function getSemanticToken(path: string, theme: 'light' | 'dark' = 'light'): string {
  const keys = path.split('.');
  let current: any = designTokens.semantic;
  for (const key of keys) {
    current = current?.[key];
  }
  // Handle theme-aware tokens
  if (typeof current === 'object' && current.light && current.dark) {
    return current[theme];
  }
  return current || path;
}

export function getComponentToken(path: string): string {
  const keys = path.split('.');
  let current: any = designTokens.components;
  for (const key of keys) {
    current = current?.[key];
  }
  return current || path;
}

export function getThemeTokens(theme: keyof typeof designTokens.themes): Record<string, string> {
  return designTokens.themes[theme];
}

// Export CSS variable names for consistency
export const cssVariables = {
  // Colors
  background: '--color-background',
  foreground: '--color-foreground',
  primary: '--color-primary',
  'primary-foreground': '--color-primary-foreground',
  secondary: '--color-secondary',
  'secondary-foreground': '--color-secondary-foreground',
  accent: '--color-accent',
  'accent-foreground': '--color-accent-foreground',
  muted: '--color-muted',
  'muted-foreground': '--color-muted-foreground',
  destructive: '--color-destructive',
  'destructive-foreground': '--color-destructive-foreground',
  success: '--color-success',
  'success-foreground': '--color-success-foreground',
  warning: '--color-warning',
  'warning-foreground': '--color-warning-foreground',
  info: '--color-info',
  'info-foreground': '--color-info-foreground',
  border: '--color-border',
  input: '--color-input',
  ring: '--color-ring',

  // Spacing
  'space-1': '--spacing-1',
  'space-2': '--spacing-2',
  'space-3': '--spacing-3',
  'space-4': '--spacing-4',
  'space-6': '--spacing-6',
  'space-8': '--spacing-8',
  'space-12': '--spacing-12',
  'space-16': '--spacing-16',
  'space-20': '--spacing-20',
  'space-24': '--spacing-24',

  // Typography
  'font-title': '--font-family-title',
  'font-body': '--font-family-body',
  'font-mono': '--font-family-mono',
  'font-size-xs': '--font-size-xs',
  'font-size-sm': '--font-size-sm',
  'font-size-base': '--font-size-base',
  'font-size-lg': '--font-size-lg',
  'font-size-xl': '--font-size-xl',
  'font-size-2xl': '--font-size-2xl',
  'font-size-3xl': '--font-size-3xl',
  'font-size-4xl': '--font-size-4xl',
  'font-size-5xl': '--font-size-5xl',
  'font-weight-normal': '--font-weight-normal',
  'font-weight-medium': '--font-weight-medium',
  'font-weight-semibold': '--font-weight-semibold',
  'font-weight-bold': '--font-weight-bold',

  // Shadows
  'shadow-sm': '--shadow-sm',
  'shadow-base': '--shadow-base',
  'shadow-md': '--shadow-md',
  'shadow-lg': '--shadow-lg',
  'shadow-xl': '--shadow-xl',
  'shadow-2xl': '--shadow-2xl',
  'shadow-inner': '--shadow-inner',
  'shadow-outline': '--shadow-outline',

  // Border radius
  'radius-sm': '--radius-sm',
  'radius-base': '--radius-base',
  'radius-md': '--radius-md',
  'radius-lg': '--radius-lg',
  'radius-xl': '--radius-xl',
  'radius-2xl': '--radius-2xl',
  'radius-full': '--radius-full',

  // Motion
  'duration-fast': '--duration-fast',
  'duration-normal': '--duration-normal',
  'duration-slow': '--duration-slow',
  'easing-standard': '--easing-standard',

  // Z-index
  'z-dropdown': '--z-dropdown',
  'z-sticky': '--z-sticky',
  'z-fixed': '--z-fixed',
  'z-modal-backdrop': '--z-modal-backdrop',
  'z-modal': '--z-modal',
  'z-popover': '--z-popover',
  'z-tooltip': '--z-tooltip',
  'z-toast': '--z-toast',
} as const;
