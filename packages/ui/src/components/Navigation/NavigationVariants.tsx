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
    'relative bg-popover border-border',
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
          'bg-popover/80 backdrop-blur-md',
        ],
        overlay: [
          'fixed inset-y-0 left-0 z-[var(--nav-z-overlay)]',
          'shadow-[var(--nav-shadow-xl)]',
        ],
        glass: [
          'bg-popover/80 backdrop-blur-lg',
          'border-border/50',
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
    'hover:bg-accent/10 hover:text-primary',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'group relative cursor-pointer',
  ],
  {
    variants: {
      active: {
        true: [
          'bg-primary/10 text-primary',
          'border-l-2 border-primary ml-0 pl-[calc(var(--nav-spacing-sm)-2px)]',
        ],
        false: 'text-muted-foreground',
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
        spacious: 'h-icon-2xl text-[var(--nav-text-base)]',
      },
      variant: {
        default: '',
        subtle: 'hover:bg-muted',
        ghost: 'hover:bg-transparent hover:text-primary',
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
    'text-[var(--nav-text-sm)] text-muted-foreground/70',
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
        pills: '[&>*]:bg-muted [&>*]:px-[var(--nav-spacing-sm)] [&>*]:py-xs [&>*]:rounded-full',
        underlined: '[&>a]:border-b [&>a]:border-transparent hover:[&>a]:border-border',
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
    'hover:text-foreground',
  ],
  {
    variants: {
      active: {
        true: 'text-foreground font-[var(--nav-weight-medium)]',
        false: 'text-muted-foreground/70',
      },
      interactive: {
        true: 'cursor-pointer hover:text-primary',
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
    'absolute z-[var(--nav-z-dropdown)] min-w-container-xs',
    'bg-popover border border-border',
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
        glass: 'bg-popover/80 backdrop-blur-md',
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
    'text-[var(--nav-text-sm)] text-muted-foreground',
    'cursor-pointer transition-colors duration-[var(--nav-duration-fast)]',
    'hover:bg-accent/10 hover:text-primary',
    'focus:outline-none focus:bg-accent/10 focus:text-primary',
  ],
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-destructive hover:bg-destructive/10',
        success: 'text-success hover:bg-success/10',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/70',
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
        sm: 'h-icon-lg',
        md: 'h-icon-xl',
        lg: 'h-icon-2xl',
      },
      variant: {
        default: '',
        ghost: 'bg-transparent border-0',
        filled: 'bg-muted',
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
    'w-full bg-muted border border-border',
    'rounded-[var(--nav-radius-md)] px-[var(--nav-spacing-sm)] py-[var(--nav-spacing-xs)]',
    'text-[var(--nav-text-sm)] text-foreground',
    'placeholder:text-muted-foreground/70',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
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
        ghost: 'bg-transparent border-0 focus:bg-muted focus:border-border',
        filled: 'bg-popover border-border',
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
          'bg-popover border-border',
        ],
        glass: [
          'bg-popover/80 backdrop-blur-lg',
          'border-border/50',
          'supports-[backdrop-filter]:bg-popover/80',
        ],
        floating: [
          'mx-sm mt-sm rounded-[var(--nav-radius-lg)]',
          'bg-popover/80 backdrop-blur-md',
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
          'bg-popover/95',
          'backdrop-blur-lg',
        ],
        false: '',
      },
      size: {
        compact: 'h-icon-2xl',
        comfortable: 'h-component-md',
        spacious: 'h-component-lg',
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
