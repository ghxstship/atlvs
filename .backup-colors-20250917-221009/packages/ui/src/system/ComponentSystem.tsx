'use client';

import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { DESIGN_TOKENS, COMPONENT_SIZES } from './DesignSystem';

// 2026 Component System - Normalized Atomic Components
// Perfect consistency across all UI elements

// =============================================================================
// ATOMIC COMPONENT VARIANTS
// =============================================================================

// Universal Button System
  export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-sm rounded-lg font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'relative overflow-hidden',
    // Ripple effect base
    'before:absolute before:inset-0 before:rounded-lg before:bg-foreground/15 before:opacity-0 before:transition-opacity',
    'active:before:opacity-100 active:before:duration-75',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground shadow-sm',
          'hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-primary',
          'active:bg-primary/95 active:translate-y-0 active:shadow-sm',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground shadow-sm border border-border',
          'hover:bg-secondary/90 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-secondary',
          'active:bg-secondary/95 active:translate-y-0 active:shadow-sm',
        ],
        outline: [
          'border-2 border-primary text-primary bg-transparent',
          'hover:bg-primary/10 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-primary',
          'active:bg-primary/15 active:translate-y-0 active:shadow-sm',
        ],
        ghost: [
          'text-foreground bg-transparent',
          'hover:bg-muted hover:text-foreground',
          'focus-visible:ring-primary',
          'active:bg-muted/70',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground shadow-sm',
          'hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-destructive',
          'active:bg-destructive/95 active:translate-y-0 active:shadow-sm',
        ],
        success: [
          'bg-success text-success-foreground shadow-sm',
          'hover:bg-success/90 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-success',
          'active:bg-success/95 active:translate-y-0 active:shadow-sm',
        ],
        warning: [
          'bg-warning text-warning-foreground shadow-sm',
          'hover:bg-warning/90 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-warning',
          'active:bg-warning/95 active:translate-y-0 active:shadow-sm',
        ],
      },
      size: {
        xs: 'h-6 px-sm text-xs font-medium',
        sm: 'h-8 px-sm text-sm font-medium',
        md: 'h-10 px-md text-sm font-medium',
        lg: 'h-12 px-lg text-base font-medium',
        xl: 'h-14 px-xl text-lg font-medium',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      loading: {
        true: 'cursor-wait',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

// Universal Input System
export const inputVariants = cva(
  [
    'flex w-full rounded-lg border bg-background px-sm py-sm text-sm transition-all duration-200',
    'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-border focus:border-primary focus:ring-primary/20',
        ],
        error: [
          'border-destructive focus:border-destructive focus:ring-destructive/20',
        ],
        success: [
          'border-success focus:border-success focus:ring-success/20',
        ],
        warning: [
          'border-warning focus:border-warning focus:ring-warning/20',
        ],
      },
      size: {
        sm: 'h-8 px-sm text-xs',
        md: 'h-10 px-sm text-sm',
        lg: 'h-12 px-md text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Universal Badge System
export const badgeVariants = cva(
  [
    'inline-flex items-center gap-xs rounded-full px-sm.5 py-0.5 text-xs font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-secondary text-secondary-foreground border border-border',
        ],
        primary: [
          'bg-primary/10 text-primary border border-primary/20',
        ],
        secondary: [
          'bg-muted text-foreground border border-border',
        ],
        success: [
          'bg-success/10 text-success border border-success/20',
        ],
        warning: [
          'bg-warning/10 text-warning border border-warning/20',
        ],
        error: [
          'bg-destructive/10 text-destructive border border-destructive/20',
        ],
        outline: [
          'bg-transparent text-foreground border border-border',
        ],
      },
      size: {
        sm: 'px-sm py-0.5 text-xs',
        md: 'px-sm.5 py-0.5 text-xs',
        lg: 'px-sm py-xs text-sm',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-105 active:scale-95',
        false: '',
      },
      removable: {
        true: 'pr-xs',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
      removable: false,
    },
  }
);

// Universal Card System
export const cardVariants = cva(
  [
    'rounded-lg border bg-card shadow-sm transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-border',
        ],
        elevated: [
          'border-border shadow-md',
          'hover:shadow-lg hover:-translate-y-1',
        ],
        interactive: [
          'border-border cursor-pointer',
          'hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
        ],
        outline: [
          'border-2 border-primary/20 bg-primary/5',
        ],
        ghost: [
          'border-transparent bg-transparent shadow-none',
          'hover:bg-muted hover:border-border',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-md',
        md: 'p-lg',
        lg: 'p-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

// Universal Avatar System
export const avatarVariants = cva(
  [
    'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted',
  ],
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
      variant: {
        default: '',
        ring: 'ring-2 ring-background ring-offset-2',
        'ring-brand': 'ring-2 ring-primary ring-offset-2',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// Universal Skeleton System
export const skeletonVariants = cva(
  [
    'animate-pulse rounded bg-muted',
  ],
  {
    variants: {
      variant: {
        default: '',
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        subtitle: 'h-4 w-1/2',
        button: 'h-10 w-24',
        avatar: 'h-10 w-10 rounded-full',
        card: 'h-32 w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// =============================================================================
// COMPONENT STATE SYSTEM
// =============================================================================

export const stateVariants = {
  loading: 'opacity-50 pointer-events-none cursor-wait',
  disabled: 'opacity-50 pointer-events-none cursor-not-allowed',
  error: 'border-destructive bg-destructive/10 text-destructive-foreground',
  success: 'border-success bg-success/10 text-success-foreground',
  warning: 'border-warning bg-warning/10 text-warning-foreground',
};

// =============================================================================
// ANIMATION SYSTEM
// =============================================================================

export const animationVariants = {
  // Entrance animations
  fadeIn: 'animate-in fade-in duration-200',
  slideInUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideInDown: 'animate-in slide-in-from-top-4 duration-300',
  slideInLeft: 'animate-in slide-in-from-left-4 duration-300',
  slideInRight: 'animate-in slide-in-from-right-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  
  // Exit animations
  fadeOut: 'animate-out fade-out duration-200',
  slideOutUp: 'animate-out slide-out-to-top-4 duration-300',
  slideOutDown: 'animate-out slide-out-to-bottom-4 duration-300',
  slideOutLeft: 'animate-out slide-out-to-left-4 duration-300',
  slideOutRight: 'animate-out slide-out-to-right-4 duration-300',
  scaleOut: 'animate-out zoom-out-95 duration-200',
  
  // Micro-interactions
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping',
  
  // Hover effects
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  hoverLift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
  hoverGlow: 'hover:shadow-lg hover:shadow-primary/25 transition-all duration-200',
};

// =============================================================================
// RESPONSIVE VARIANTS
// =============================================================================

export const responsiveVariants = {
  // Spacing
  spacingResponsive: {
    sm: 'gap-sm sm:gap-md',
    md: 'gap-md sm:gap-lg',
    lg: 'gap-lg sm:gap-xl',
  },
  
  // Padding
  paddingResponsive: {
    sm: 'p-md sm:p-lg',
    md: 'p-lg sm:p-xl',
    lg: 'p-xl sm:p-2xl',
  },
  
  // Text sizes
  textResponsive: {
    title: 'text-2xl sm:text-3xl lg:text-4xl',
    subtitle: 'text-lg sm:text-xl',
    body: 'text-sm sm:text-base',
  },
  
  // Grid columns
  gridResponsive: {
    auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    cards: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    list: 'grid-cols-1 lg:grid-cols-2',
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return twMerge(classes.filter(Boolean).join(' '));
};

export const getVariantClasses = (
  variants: Record<string, any>,
  props: Record<string, any>
) => {
  return Object.entries(props)
    .map(([key, value]) => variants[key]?.[value])
    .filter(Boolean)
    .join(' ');
};

// =============================================================================
// COMPONENT COMPOSITION UTILITIES
// =============================================================================

export const composeVariants = (...variantFunctions: any[]) => {
  return (props: any) => {
    return cn(...variantFunctions.map(fn => fn(props)));
  };
};

export const withDefaults = <T extends Record<string, any>>(
  defaultProps: Partial<T>
) => {
  return (props: T): T => ({
    ...defaultProps,
    ...props,
  });
};

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

export const a11yVariants = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  srOnly: 'sr-only',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-md focus:py-sm focus:bg-primary focus:text-primary-foreground focus:rounded-md',
  highContrast: 'contrast-more:border-foreground contrast-more:text-foreground',
  reducedMotion: 'motion-reduce:animate-none motion-reduce:transition-none',
};

// =============================================================================
// EXPORT SYSTEM
// =============================================================================

export const ComponentSystem = {
  variants: {
    button: buttonVariants,
    input: inputVariants,
    badge: badgeVariants,
    card: cardVariants,
    avatar: avatarVariants,
    skeleton: skeletonVariants,
  },
  states: stateVariants,
  animations: animationVariants,
  responsive: responsiveVariants,
  a11y: a11yVariants,
  utils: {
    cn,
    getVariantClasses,
    composeVariants,
    withDefaults,
  },
};

export default ComponentSystem;
