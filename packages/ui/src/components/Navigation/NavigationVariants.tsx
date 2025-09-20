/**
 * Navigation Component Variants
 * Standardized CVA-based variant system for all navigation components
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { navigationTokens } from '../../tokens/navigation';

// =============================================================================
// SIDEBAR VARIANTS
// =============================================================================

export const sidebarVariants = cva(
  [
    'flex flex-col border-r transition-all duration-[var(--nav-duration-normal)] ease-[var(--nav-easing-ease-in-out)]',
    'relative bg-[hsl(var(--nav-bg-accent))] border-[hsl(var(--nav-border-default))]',
  ],
  {
    variants: {
      state: {
        expanded: 'w-[var(--nav-width-expanded)]',
        collapsed: 'w-[var(--nav-width-collapsed)]',
        wide: 'w-[var(--nav-width-wide)]',
        hidden: 'w-0 border-r-0',
      },
      variant: {
        default: '',
        floating: [
          'mx-sm my-sm rounded-[var(--nav-radius-lg)]',
          'border shadow-[var(--nav-shadow-md)]',
          'bg-[hsl(var(--nav-bg-glass))] backdrop-blur-[var(--nav-backdrop-blur-md)]',
        ],
        overlay: [
          'fixed inset-y-0 left-0 z-[var(--nav-z-overlay)]',
          'shadow-[var(--nav-shadow-xl)]',
        ],
        glass: [
          'bg-[hsl(var(--nav-bg-glass))] backdrop-blur-[var(--nav-backdrop-blur-lg)]',
          'border-[hsl(var(--nav-border-subtle))]',
        ],
      },
      theme: {
        light: '',
        dark: 'dark',
        auto: '',
      },
    },
    defaultVariants: {
      state: 'expanded',
      variant: 'default',
      theme: 'auto',
    },
  }
);

// =============================================================================
// NAVIGATION ITEM VARIANTS
// =============================================================================

export const navigationItemVariants = cva(
  [
    'flex items-center gap-[var(--nav-spacing-sm)] px-[var(--nav-spacing-sm)] py-[var(--nav-spacing-xs)]',
    'mx-[var(--nav-spacing-xs)] rounded-[var(--nav-radius-md)]',
    'text-[var(--nav-text-sm)] font-[var(--nav-weight-medium)]',
    'transition-all duration-[var(--nav-duration-fast)] ease-[var(--nav-easing-ease-out)]',
    'hover:bg-[hsl(var(--nav-accent-secondary)/0.1)] hover:text-[hsl(var(--nav-accent-primary))]',
    'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--nav-accent-focus))] focus:ring-offset-2',
    'group relative cursor-pointer',
  ],
  {
    variants: {
      active: {
        true: [
          'bg-[hsl(var(--nav-accent-primary)/0.1)] text-[hsl(var(--nav-accent-primary))]',
          'border-l-2 border-[hsl(var(--nav-accent-primary))] ml-0 pl-[calc(var(--nav-spacing-sm)-2px)]',
        ],
        false: 'text-[hsl(var(--nav-fg-secondary))]',
      },
      level: {
        0: 'ml-0',
        1: 'ml-[var(--nav-spacing-md)]',
        2: 'ml-[var(--nav-spacing-lg)]',
        3: 'ml-[var(--nav-spacing-xl)]',
      },
      collapsed: {
        true: 'justify-center px-[var(--nav-spacing-xs)]',
        false: '',
      },
      size: {
        compact: 'h-[var(--nav-height-compact)] text-[var(--nav-text-xs)]',
        comfortable: 'h-[var(--nav-height-item)] text-[var(--nav-text-sm)]',
        spacious: 'h-12 text-[var(--nav-text-base)]',
      },
      variant: {
        default: '',
        subtle: 'hover:bg-[hsl(var(--nav-bg-secondary))]',
        ghost: 'hover:bg-transparent hover:text-[hsl(var(--nav-accent-primary))]',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      active: false,
      level: 0,
      collapsed: false,
      size: 'comfortable',
      variant: 'default',
    },
  }
);

// =============================================================================
// BREADCRUMB VARIANTS
// =============================================================================

export const breadcrumbVariants = cva(
  [
    'flex items-center gap-[var(--nav-spacing-xs)]',
    'text-[var(--nav-text-sm)] text-[hsl(var(--nav-fg-muted))]',
  ],
  {
    variants: {
      size: {
        sm: 'text-[var(--nav-text-xs)] gap-xs',
        md: 'text-[var(--nav-text-sm)] gap-[var(--nav-spacing-xs)]',
        lg: 'text-[var(--nav-text-base)] gap-[var(--nav-spacing-sm)]',
      },
      variant: {
        default: '',
        pills: '[&>*]:bg-[hsl(var(--nav-bg-secondary))] [&>*]:px-[var(--nav-spacing-sm)] [&>*]:py-xs [&>*]:rounded-full',
        underlined: '[&>a]:border-b [&>a]:border-transparent hover:[&>a]:border-[hsl(var(--nav-border-default))]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export const breadcrumbItemVariants = cva(
  [
    'transition-colors duration-[var(--nav-duration-fast)]',
    'hover:text-[hsl(var(--nav-fg-primary))]',
  ],
  {
    variants: {
      active: {
        true: 'text-[hsl(var(--nav-fg-primary))] font-[var(--nav-weight-medium)]',
        false: 'text-[hsl(var(--nav-fg-muted))]',
      },
      interactive: {
        true: 'cursor-pointer hover:text-[hsl(var(--nav-accent-primary))]',
        false: 'cursor-default',
      },
    },
    defaultVariants: {
      active: false,
      interactive: true,
    },
  }
);

// =============================================================================
// DROPDOWN VARIANTS
// =============================================================================

export const dropdownVariants = cva(
  [
    'absolute z-[var(--nav-z-dropdown)] min-w-48',
    'bg-[hsl(var(--nav-bg-accent))] border border-[hsl(var(--nav-border-default))]',
    'rounded-[var(--nav-radius-md)] shadow-[var(--nav-shadow-lg)]',
    'py-[var(--nav-spacing-xs)]',
    'animate-in fade-in-0 zoom-in-95 duration-[var(--nav-duration-fast)]',
  ],
  {
    variants: {
      position: {
        'bottom-start': 'top-full left-0 mt-xs',
        'bottom-end': 'top-full right-0 mt-xs',
        'top-start': 'bottom-full left-0 mb-xs',
        'top-end': 'bottom-full right-0 mb-xs',
        'left-start': 'right-full top-0 mr-xs',
        'right-start': 'left-full top-0 ml-xs',
      },
      variant: {
        default: '',
        glass: 'bg-[hsl(var(--nav-bg-glass))] backdrop-blur-[var(--nav-backdrop-blur-md)]',
        minimal: 'border-0 shadow-[var(--nav-shadow-sm)]',
      },
    },
    defaultVariants: {
      position: 'bottom-start',
      variant: 'default',
    },
  }
);

export const dropdownItemVariants = cva(
  [
    'flex items-center gap-[var(--nav-spacing-sm)] px-[var(--nav-spacing-sm)] py-[var(--nav-spacing-xs)]',
    'text-[var(--nav-text-sm)] text-[hsl(var(--nav-fg-secondary))]',
    'cursor-pointer transition-colors duration-[var(--nav-duration-fast)]',
    'hover:bg-[hsl(var(--nav-accent-secondary)/0.1)] hover:text-[hsl(var(--nav-accent-primary))]',
    'focus:outline-none focus:bg-[hsl(var(--nav-accent-secondary)/0.1)] focus:text-[hsl(var(--nav-accent-primary))]',
  ],
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-[hsl(var(--nav-state-error))] hover:bg-[hsl(var(--nav-state-error)/0.1)]',
        success: 'text-[hsl(var(--nav-state-success))] hover:bg-[hsl(var(--nav-state-success)/0.1)]',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-[hsl(var(--nav-fg-muted))]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      disabled: false,
    },
  }
);

// =============================================================================
// SEARCH VARIANTS
// =============================================================================

export const searchVariants = cva(
  [
    'relative flex items-center',
  ],
  {
    variants: {
      size: {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
      },
      variant: {
        default: '',
        ghost: 'bg-transparent border-0',
        filled: 'bg-[hsl(var(--nav-bg-secondary))]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export const searchInputVariants = cva(
  [
    'w-full bg-[hsl(var(--nav-bg-secondary))] border border-[hsl(var(--nav-border-default))]',
    'rounded-[var(--nav-radius-md)] px-[var(--nav-spacing-sm)] py-[var(--nav-spacing-xs)]',
    'text-[var(--nav-text-sm)] text-[hsl(var(--nav-fg-primary))]',
    'placeholder:text-[hsl(var(--nav-fg-muted))]',
    'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--nav-accent-focus))] focus:border-transparent',
    'transition-all duration-[var(--nav-duration-fast)]',
  ],
  {
    variants: {
      size: {
        sm: 'text-[var(--nav-text-xs)] px-sm py-xs',
        md: 'text-[var(--nav-text-sm)] px-[var(--nav-spacing-sm)] py-[var(--nav-spacing-xs)]',
        lg: 'text-[var(--nav-text-base)] px-[var(--nav-spacing-md)] py-[var(--nav-spacing-sm)]',
      },
      variant: {
        default: '',
        ghost: 'bg-transparent border-0 focus:bg-[hsl(var(--nav-bg-secondary))] focus:border-[hsl(var(--nav-border-default))]',
        filled: 'bg-[hsl(var(--nav-bg-accent))] border-[hsl(var(--nav-border-strong))]',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// =============================================================================
// HEADER VARIANTS
// =============================================================================

export const headerVariants = cva(
  [
    'sticky top-0 w-full border-b z-[var(--nav-z-overlay)]',
    'transition-all duration-[var(--nav-duration-normal)] ease-[var(--nav-easing-ease-out)]',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-[hsl(var(--nav-bg-accent))] border-[hsl(var(--nav-border-default))]',
        ],
        glass: [
          'bg-[hsl(var(--nav-bg-glass))] backdrop-blur-[var(--nav-backdrop-blur-lg)]',
          'border-[hsl(var(--nav-border-subtle))]',
          'supports-[backdrop-filter]:bg-[hsl(var(--nav-bg-accent)/0.8)]',
        ],
        floating: [
          'mx-sm mt-sm rounded-[var(--nav-radius-lg)]',
          'bg-[hsl(var(--nav-bg-glass))] backdrop-blur-[var(--nav-backdrop-blur-md)]',
          'border shadow-[var(--nav-shadow-md)]',
        ],
        minimal: [
          'bg-transparent border-transparent',
          'backdrop-blur-[var(--nav-backdrop-blur-sm)]',
        ],
      },
      scrolled: {
        true: [
          'shadow-[var(--nav-shadow-lg)]',
          'bg-[hsl(var(--nav-bg-accent)/0.95)]',
          'backdrop-blur-[var(--nav-backdrop-blur-lg)]',
        ],
        false: '',
      },
      size: {
        compact: 'h-12',
        comfortable: 'h-16',
        spacious: 'h-20',
      },
    },
    defaultVariants: {
      variant: 'glass',
      scrolled: false,
      size: 'comfortable',
    },
  }
);

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

export const animationVariants = cva('', {
  variants: {
    enter: {
      fade: 'animate-in fade-in-0 duration-[var(--nav-duration-fast)]',
      slide: 'animate-in slide-in-from-left-2 duration-[var(--nav-duration-normal)]',
      scale: 'animate-in zoom-in-95 duration-[var(--nav-duration-fast)]',
      spring: 'animate-in zoom-in-95 duration-[var(--nav-duration-slower)] ease-[var(--nav-easing-spring)]',
    },
    exit: {
      fade: 'animate-out fade-out-0 duration-[var(--nav-duration-fast)]',
      slide: 'animate-out slide-out-to-left-2 duration-[var(--nav-duration-normal)]',
      scale: 'animate-out zoom-out-95 duration-[var(--nav-duration-fast)]',
      spring: 'animate-out zoom-out-95 duration-[var(--nav-duration-slower)] ease-[var(--nav-easing-spring)]',
    },
  },
  defaultVariants: {
    enter: 'fade',
    exit: 'fade',
  },
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type SidebarVariants = VariantProps<typeof sidebarVariants>;
export type NavigationItemVariants = VariantProps<typeof navigationItemVariants>;
export type BreadcrumbVariants = VariantProps<typeof breadcrumbVariants>;
export type BreadcrumbItemVariants = VariantProps<typeof breadcrumbItemVariants>;
export type DropdownVariants = VariantProps<typeof dropdownVariants>;
export type DropdownItemVariants = VariantProps<typeof dropdownItemVariants>;
export type SearchVariants = VariantProps<typeof searchVariants>;
export type SearchInputVariants = VariantProps<typeof searchInputVariants>;
export type HeaderVariants = VariantProps<typeof headerVariants>;
export type AnimationVariants = VariantProps<typeof animationVariants>;
