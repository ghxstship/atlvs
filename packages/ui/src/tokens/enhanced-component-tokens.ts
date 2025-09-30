import { DESIGN_TOKENS } from './unified-design-tokens';

// Enhanced Component Tokens with Interactive States
export function createComponentTokens(palette: Record<string, string>) {
  return {
    // Button Component Tokens
    button: {
      // Primary variant
      primary: {
        background: palette.primary,
        foreground: palette.primaryForeground,
        border: palette.primary,
        hover: {
          background: DESIGN_TOKENS.colors.brand.primary[600],
          border: DESIGN_TOKENS.colors.brand.primary[600],
        },
        active: {
          background: DESIGN_TOKENS.colors.brand.primary[500],
          border: DESIGN_TOKENS.colors.brand.primary[500],
        },
        focus: {
          ring: palette.ring,
          ringOffset: DESIGN_TOKENS.colors.base.white,
        },
        disabled: {
          background: palette.muted,
          foreground: palette.mutedForeground,
          border: palette.border,
        },
      },
      // Secondary variant
      secondary: {
        background: palette.secondary,
        foreground: palette.secondaryForeground,
        border: palette.border,
        hover: {
          background: DESIGN_TOKENS.colors.gray[100],
          border: DESIGN_TOKENS.colors.gray[300],
        },
        active: {
          background: DESIGN_TOKENS.colors.gray[200],
          border: DESIGN_TOKENS.colors.gray[400],
        },
        focus: {
          ring: palette.ring,
          ringOffset: DESIGN_TOKENS.colors.base.white,
        },
        disabled: {
          background: palette.muted,
          foreground: palette.mutedForeground,
          border: palette.border,
        },
      },
      // Destructive variant
      destructive: {
        background: palette.destructive,
        foreground: palette.destructiveForeground,
        border: palette.destructive,
        hover: {
          background: DESIGN_TOKENS.colors.semantic.error[600],
          border: DESIGN_TOKENS.colors.semantic.error[600],
        },
        active: {
          background: DESIGN_TOKENS.colors.semantic.error[500],
          border: DESIGN_TOKENS.colors.semantic.error[500],
        },
        focus: {
          ring: palette.ring,
          ringOffset: DESIGN_TOKENS.colors.base.white,
        },
        disabled: {
          background: palette.muted,
          foreground: palette.mutedForeground,
          border: palette.border,
        },
      },
    },

    // Input Component Tokens
    input: {
      background: palette.background,
      foreground: palette.foreground,
      border: palette.input,
      placeholder: palette.mutedForeground,
      hover: {
        border: DESIGN_TOKENS.colors.gray[400],
      },
      focus: {
        border: palette.ring,
        ring: palette.ring,
        ringOffset: DESIGN_TOKENS.colors.base.white,
      },
      error: {
        border: palette.destructive,
        ring: palette.destructive,
      },
      disabled: {
        background: palette.muted,
        foreground: palette.mutedForeground,
        border: palette.border,
        placeholder: palette.mutedForeground,
      },
    },

    // Card Component Tokens
    card: {
      background: palette.card,
      foreground: palette.cardForeground,
      border: palette.border,
      shadow: 'var(--shadow-semantic-elevation-2)', // Use semantic elevation
      hover: {
        shadow: 'var(--shadow-semantic-elevation-3)', // Use semantic elevation
        border: DESIGN_TOKENS.colors.gray[200],
      },
      focus: {
        ring: palette.ring,
        ringOffset: DESIGN_TOKENS.colors.base.white,
      },
    },

    // Modal/Dialog Component Tokens
    modal: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      background: palette.card,
      foreground: palette.cardForeground,
      border: palette.border,
      shadow: 'var(--shadow-semantic-elevation-4)', // Use semantic elevation
      header: {
        borderBottom: palette.border,
      },
      footer: {
        borderTop: palette.border,
      },
    },

    // Dropdown/Select Component Tokens
    dropdown: {
      trigger: {
        background: palette.background,
        foreground: palette.foreground,
        border: palette.input,
        hover: {
          background: palette.accent,
          border: DESIGN_TOKENS.colors.gray[400],
        },
        focus: {
          border: palette.ring,
          ring: palette.ring,
        },
        open: {
          border: palette.ring,
        },
      },
      content: {
        background: palette.popover,
        foreground: palette.popoverForeground,
        border: palette.border,
        shadow: 'var(--shadow-semantic-elevation-4)', // Use semantic elevation
      },
      item: {
        hover: {
          background: palette.accent,
          foreground: palette.accentForeground,
        },
        focus: {
          background: palette.accent,
          foreground: palette.accentForeground,
        },
        disabled: {
          foreground: palette.mutedForeground,
        },
      },
    },

    // Accordion Component Tokens
    accordion: {
      background: palette.background,
      border: palette.border,
      item: {
        borderBottom: palette.border,
        hover: {
          background: palette.accent,
        },
        focus: {
          ring: palette.ring,
        },
        open: {
          background: palette.muted,
        },
      },
      trigger: {
        background: 'transparent',
        foreground: palette.foreground,
        hover: {
          foreground: palette.primary,
        },
        focus: {
          ring: palette.ring,
        },
      },
      content: {
        background: palette.background,
        foreground: palette.foreground,
        borderTop: palette.border,
      },
    },

    // Avatar Component Tokens
    avatar: {
      background: palette.muted,
      foreground: palette.mutedForeground,
      border: palette.border,
      sizes: {
        xs: DESIGN_TOKENS.spacing[6], // 24px
        sm: DESIGN_TOKENS.spacing[8], // 32px
        md: DESIGN_TOKENS.spacing[10], // 40px
        lg: DESIGN_TOKENS.spacing[12], // 48px
        xl: DESIGN_TOKENS.spacing[16], // 64px
      },
    },

    // Calendar Component Tokens
    calendar: {
      background: palette.card,
      foreground: palette.cardForeground,
      border: palette.border,
      shadow: 'var(--shadow-semantic-elevation-2)',
      header: {
        background: palette.muted,
        foreground: palette.mutedForeground,
        borderBottom: palette.border,
      },
      nav: {
        button: {
          hover: {
            background: palette.accent,
          },
          focus: {
            ring: palette.ring,
          },
        },
      },
      day: {
        default: {
          background: 'transparent',
          foreground: palette.foreground,
        },
        hover: {
          background: palette.accent,
          foreground: palette.accentForeground,
        },
        selected: {
          background: palette.primary,
          foreground: palette.primaryForeground,
        },
        today: {
          background: palette.accent,
          foreground: palette.accentForeground,
        },
        disabled: {
          background: 'transparent',
          foreground: palette.mutedForeground,
        },
        outside: {
          background: 'transparent',
          foreground: palette.mutedForeground,
        },
      },
    },

    // Checkbox Component Tokens
    checkbox: {
      background: palette.background,
      border: palette.input,
      checked: {
        background: palette.primary,
        border: palette.primary,
        foreground: palette.primaryForeground,
      },
      focus: {
        ring: palette.ring,
        ringOffset: DESIGN_TOKENS.colors.base.white,
      },
      disabled: {
        opacity: '0.5',
        cursor: 'not-allowed',
      },
      indeterminate: {
        background: palette.primary,
        border: palette.primary,
      },
    },

    // Dialog/Modal Component Tokens (Enhanced)
    dialog: {
      overlay: 'rgba(0, 0, 0, 0.5)',
      content: {
        background: palette.card,
        foreground: palette.cardForeground,
        border: palette.border,
        shadow: 'var(--shadow-semantic-elevation-4)',
      },
      header: {
        borderBottom: palette.border,
      },
      footer: {
        borderTop: palette.border,
      },
      close: {
        hover: {
          background: palette.accent,
        },
        focus: {
          ring: palette.ring,
        },
      },
    },

    // Drawer Component Tokens
    drawer: {
      overlay: 'rgba(0, 0, 0, 0.5)',
      content: {
        background: palette.card,
        foreground: palette.cardForeground,
        border: palette.border,
        shadow: 'var(--shadow-semantic-elevation-4)',
      },
      header: {
        borderBottom: palette.border,
      },
      footer: {
        borderTop: palette.border,
      },
      close: {
        hover: {
          background: palette.accent,
        },
        focus: {
          ring: palette.ring,
        },
      },
    },

    // Empty State Component Tokens
    empty: {
      icon: {
        color: palette.mutedForeground,
        size: DESIGN_TOKENS.spacing[12], // 48px
      },
      title: {
        foreground: palette.foreground,
        fontSize: DESIGN_TOKENS.typography.fontSize.xl,
      },
      description: {
        foreground: palette.mutedForeground,
        fontSize: DESIGN_TOKENS.typography.fontSize.sm,
      },
      action: {
        marginTop: DESIGN_TOKENS.spacing[6],
      },
    },

    // Loading/Spinner Component Tokens
    loading: {
      background: palette.muted,
      foreground: palette.primary,
      overlay: 'rgba(255, 255, 255, 0.8)',
      dark: {
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
      sizes: {
        xs: DESIGN_TOKENS.spacing[4], // 16px
        sm: DESIGN_TOKENS.spacing[6], // 24px
        md: DESIGN_TOKENS.spacing[8], // 32px
        lg: DESIGN_TOKENS.spacing[12], // 48px
        xl: DESIGN_TOKENS.spacing[16], // 64px
      },
    },

    // Pagination Component Tokens
    pagination: {
      item: {
        background: 'transparent',
        foreground: palette.foreground,
        border: palette.border,
        hover: {
          background: palette.accent,
          foreground: palette.accentForeground,
        },
        active: {
          background: palette.primary,
          foreground: palette.primaryForeground,
          border: palette.primary,
        },
        disabled: {
          background: 'transparent',
          foreground: palette.mutedForeground,
          border: palette.border,
        },
        focus: {
          ring: palette.ring,
        },
      },
      ellipsis: {
        foreground: palette.mutedForeground,
      },
      nav: {
        hover: {
          background: palette.accent,
        },
        focus: {
          ring: palette.ring,
        },
        disabled: {
          opacity: '0.5',
        },
      },
    },

    // Popover Component Tokens
    popover: {
      content: {
        background: palette.popover,
        foreground: palette.popoverForeground,
        border: palette.border,
        shadow: 'var(--shadow-semantic-elevation-3)',
      },
      arrow: {
        fill: palette.popover,
        stroke: palette.border,
      },
    },

    // Progress Component Tokens
    progress: {
      background: palette.muted,
      foreground: palette.primary,
      indicator: palette.primary,
      sizes: {
        sm: DESIGN_TOKENS.spacing[1], // 4px
        md: DESIGN_TOKENS.spacing[2], // 8px
        lg: DESIGN_TOKENS.spacing[3], // 12px
      },
    },

    // Radio Component Tokens
    radio: {
      background: palette.background,
      border: palette.input,
      checked: {
        background: palette.primary,
        border: palette.primary,
        foreground: palette.primaryForeground,
      },
      focus: {
        ring: palette.ring,
        ringOffset: DESIGN_TOKENS.colors.base.white,
      },
      disabled: {
        opacity: '0.5',
        cursor: 'not-allowed',
      },
    },

    // Select Component Tokens
    select: {
      trigger: {
        background: palette.background,
        foreground: palette.foreground,
        border: palette.input,
        placeholder: palette.mutedForeground,
        hover: {
          border: DESIGN_TOKENS.colors.gray[400],
        },
        focus: {
          border: palette.ring,
          ring: palette.ring,
          ringOffset: DESIGN_TOKENS.colors.base.white,
        },
        disabled: {
          background: palette.muted,
          foreground: palette.mutedForeground,
          border: palette.border,
        },
        open: {
          border: palette.ring,
        },
      },
      content: {
        background: palette.popover,
        foreground: palette.popoverForeground,
        border: palette.border,
        shadow: 'var(--shadow-semantic-elevation-3)',
      },
      item: {
        hover: {
          background: palette.accent,
          foreground: palette.accentForeground,
        },
        focus: {
          background: palette.accent,
          foreground: palette.accentForeground,
        },
        disabled: {
          foreground: palette.mutedForeground,
        },
        selected: {
          background: palette.primary,
          foreground: palette.primaryForeground,
        },
      },
      separator: {
        background: palette.border,
      },
    },

    // Skeleton Component Tokens
    skeleton: {
      background: palette.muted,
      foreground: 'hsl(var(--color-muted) / 0.8)',
      animation: {
        duration: '2s',
        timing: 'ease-in-out',
      },
    },

    // Slider Component Tokens
    slider: {
      track: {
        background: palette.muted,
      },
      range: {
        background: palette.primary,
      },
      thumb: {
        background: palette.primary,
        border: DESIGN_TOKENS.colors.base.white,
        shadow: 'var(--shadow-semantic-elevation-1)',
        hover: {
          shadow: 'var(--shadow-semantic-elevation-2)',
        },
        focus: {
          ring: palette.ring,
          ringOffset: DESIGN_TOKENS.colors.base.white,
        },
        disabled: {
          opacity: '0.5',
        },
      },
    },

    // Switch Component Tokens
    switch: {
      background: palette.muted,
      foreground: palette.mutedForeground,
      checked: {
        background: palette.primary,
        foreground: palette.primaryForeground,
      },
      thumb: {
        background: DESIGN_TOKENS.colors.base.white,
        checked: DESIGN_TOKENS.colors.base.white,
      },
      focus: {
        ring: palette.ring,
        ringOffset: DESIGN_TOKENS.colors.base.white,
      },
      disabled: {
        opacity: '0.5',
      },
    },

    // Table Component Tokens
    table: {
      background: palette.background,
      foreground: palette.foreground,
      border: palette.border,
      header: {
        background: palette.muted,
        foreground: palette.foreground,
        borderBottom: palette.border,
        fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
      },
      row: {
        hover: {
          background: palette.accent,
        },
        selected: {
          background: palette.accent,
        },
        striped: {
          background: palette.muted,
        },
      },
      cell: {
        border: palette.border,
        padding: DESIGN_TOKENS.spacing[3],
      },
      footer: {
        background: palette.muted,
        foreground: palette.foreground,
        borderTop: palette.border,
      },
    },

    // Tabs Component Tokens (Enhanced)
    tabs: {
      list: {
        background: 'transparent',
        borderBottom: palette.border,
      },
      trigger: {
        background: 'transparent',
        foreground: palette.mutedForeground,
        borderBottom: `2px solid transparent`,
        paddingX: DESIGN_TOKENS.spacing[3],
        paddingY: DESIGN_TOKENS.spacing[2],
        hover: {
          foreground: palette.foreground,
          background: palette.accent,
        },
        active: {
          foreground: palette.primary,
          borderBottom: `2px solid ${palette.primary}`,
          background: 'transparent',
        },
        focus: {
          ring: palette.ring,
          ringOffset: DESIGN_TOKENS.colors.base.white,
        },
        disabled: {
          opacity: '0.5',
          cursor: 'not-allowed',
        },
      },
      content: {
        padding: DESIGN_TOKENS.spacing[4],
        background: palette.background,
        foreground: palette.foreground,
      },
    },

    // Toast/Notification Component Tokens
    toast: {
      background: palette.card,
      foreground: palette.cardForeground,
      border: palette.border,
      shadow: 'var(--shadow-semantic-elevation-3)',
      success: {
        background: DESIGN_TOKENS.colors.semantic.success[50],
        foreground: DESIGN_TOKENS.colors.semantic.success[900],
        border: DESIGN_TOKENS.colors.semantic.success[100],
      },
      error: {
        background: DESIGN_TOKENS.colors.semantic.error[50],
        foreground: DESIGN_TOKENS.colors.semantic.error[900],
        border: DESIGN_TOKENS.colors.semantic.error[100],
      },
      warning: {
        background: DESIGN_TOKENS.colors.semantic.warning[50],
        foreground: DESIGN_TOKENS.colors.semantic.warning[900],
        border: DESIGN_TOKENS.colors.semantic.warning[100],
      },
      info: {
        background: DESIGN_TOKENS.colors.semantic.info[50],
        foreground: DESIGN_TOKENS.colors.semantic.info[900],
        border: DESIGN_TOKENS.colors.semantic.info[100],
      },
      close: {
        hover: {
          background: palette.accent,
        },
        focus: {
          ring: palette.ring,
        },
      },
    },

    // Tooltip Component Tokens (Enhanced)
    tooltip: {
      content: {
        background: palette.popover,
        foreground: palette.popoverForeground,
        border: palette.border,
        shadow: 'var(--shadow-semantic-elevation-3)',
        borderRadius: DESIGN_TOKENS.borderRadius.md,
        padding: DESIGN_TOKENS.spacing[2],
        fontSize: DESIGN_TOKENS.typography.fontSize.sm,
        maxWidth: '20rem',
      },
      arrow: {
        fill: palette.popover,
        stroke: palette.border,
      },
      variants: {
        default: {
          background: palette.popover,
          foreground: palette.popoverForeground,
        },
        success: {
          background: DESIGN_TOKENS.colors.semantic.success[500],
          foreground: DESIGN_TOKENS.colors.base.white,
        },
        error: {
          background: DESIGN_TOKENS.colors.semantic.error[500],
          foreground: DESIGN_TOKENS.colors.base.white,
        },
        warning: {
          background: DESIGN_TOKENS.colors.semantic.warning[500],
          foreground: DESIGN_TOKENS.colors.base.white,
        },
        info: {
          background: DESIGN_TOKENS.colors.semantic.info[500],
          foreground: DESIGN_TOKENS.colors.base.white,
        },
      },
    },
  };
}
