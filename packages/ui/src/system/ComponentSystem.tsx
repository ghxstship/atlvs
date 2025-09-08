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
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'relative overflow-hidden',
    // Ripple effect base
    'before:absolute before:inset-0 before:rounded-lg before:bg-white/20 before:opacity-0 before:transition-opacity',
    'active:before:opacity-100 active:before:duration-75',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-600 text-white shadow-sm',
          'hover:bg-brand-700 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-brand-500',
          'active:bg-brand-800 active:translate-y-0 active:shadow-sm',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-900 shadow-sm border border-neutral-200',
          'hover:bg-neutral-200 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-neutral-500',
          'active:bg-neutral-300 active:translate-y-0 active:shadow-sm',
          'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700',
          'dark:hover:bg-neutral-700',
        ],
        outline: [
          'border-2 border-brand-600 text-brand-600 bg-transparent',
          'hover:bg-brand-50 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-brand-500',
          'active:bg-brand-100 active:translate-y-0 active:shadow-sm',
          'dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-950',
        ],
        ghost: [
          'text-neutral-700 bg-transparent',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'focus-visible:ring-neutral-500',
          'active:bg-neutral-200',
          'dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
        ],
        destructive: [
          'bg-error-600 text-white shadow-sm',
          'hover:bg-error-700 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-error-500',
          'active:bg-error-800 active:translate-y-0 active:shadow-sm',
        ],
        success: [
          'bg-success-600 text-white shadow-sm',
          'hover:bg-success-700 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-success-500',
          'active:bg-success-800 active:translate-y-0 active:shadow-sm',
        ],
        warning: [
          'bg-warning-600 text-white shadow-sm',
          'hover:bg-warning-700 hover:shadow-md hover:-translate-y-0.5',
          'focus-visible:ring-warning-500',
          'active:bg-warning-800 active:translate-y-0 active:shadow-sm',
        ],
      },
      size: {
        xs: 'h-6 px-2 text-xs font-medium',
        sm: 'h-8 px-3 text-sm font-medium',
        md: 'h-10 px-4 text-sm font-medium',
        lg: 'h-12 px-6 text-base font-medium',
        xl: 'h-14 px-8 text-lg font-medium',
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
    'flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200',
    'placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
    'dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100',
    'dark:placeholder:text-neutral-400 dark:disabled:bg-neutral-900',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-neutral-300 focus:border-brand-500 focus:ring-brand-500/20',
          'dark:border-neutral-600 dark:focus:border-brand-400',
        ],
        error: [
          'border-error-300 focus:border-error-500 focus:ring-error-500/20',
          'dark:border-error-600 dark:focus:border-error-400',
        ],
        success: [
          'border-success-300 focus:border-success-500 focus:ring-success-500/20',
          'dark:border-success-600 dark:focus:border-success-400',
        ],
        warning: [
          'border-warning-300 focus:border-warning-500 focus:ring-warning-500/20',
          'dark:border-warning-600 dark:focus:border-warning-400',
        ],
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
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
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-neutral-100 text-neutral-800 border border-neutral-200',
          'dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700',
        ],
        primary: [
          'bg-brand-100 text-brand-800 border border-brand-200',
          'dark:bg-brand-900 dark:text-brand-200 dark:border-brand-800',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-600 border border-neutral-200',
          'dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700',
        ],
        success: [
          'bg-success-100 text-success-800 border border-success-200',
          'dark:bg-success-900 dark:text-success-200 dark:border-success-800',
        ],
        warning: [
          'bg-warning-100 text-warning-800 border border-warning-200',
          'dark:bg-warning-900 dark:text-warning-200 dark:border-warning-800',
        ],
        error: [
          'bg-error-100 text-error-800 border border-error-200',
          'dark:bg-error-900 dark:text-error-200 dark:border-error-800',
        ],
        outline: [
          'bg-transparent text-neutral-700 border border-neutral-300',
          'dark:text-neutral-300 dark:border-neutral-600',
        ],
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-105 active:scale-95',
        false: '',
      },
      removable: {
        true: 'pr-1',
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
    'rounded-lg border bg-white shadow-sm transition-all duration-200',
    'dark:bg-neutral-800 dark:border-neutral-700',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-neutral-200',
          'dark:border-neutral-700',
        ],
        elevated: [
          'border-neutral-200 shadow-md',
          'hover:shadow-lg hover:-translate-y-1',
          'dark:border-neutral-700',
        ],
        interactive: [
          'border-neutral-200 cursor-pointer',
          'hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
          'dark:border-neutral-700 dark:hover:border-brand-600',
        ],
        outline: [
          'border-2 border-brand-200 bg-brand-50/50',
          'dark:border-brand-800 dark:bg-brand-950/50',
        ],
        ghost: [
          'border-transparent bg-transparent shadow-none',
          'hover:bg-neutral-50 hover:border-neutral-200',
          'dark:hover:bg-neutral-800 dark:hover:border-neutral-700',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
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
    'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-neutral-100',
    'dark:bg-neutral-800',
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
        ring: 'ring-2 ring-white ring-offset-2 dark:ring-neutral-800',
        'ring-brand': 'ring-2 ring-brand-500 ring-offset-2',
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
    'animate-pulse rounded bg-neutral-200 dark:bg-neutral-700',
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
  error: 'border-error-300 bg-error-50 text-error-900 dark:border-error-600 dark:bg-error-950 dark:text-error-100',
  success: 'border-success-300 bg-success-50 text-success-900 dark:border-success-600 dark:bg-success-950 dark:text-success-100',
  warning: 'border-warning-300 bg-warning-50 text-warning-900 dark:border-warning-600 dark:bg-warning-950 dark:text-warning-100',
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
  hoverGlow: 'hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-200',
};

// =============================================================================
// RESPONSIVE VARIANTS
// =============================================================================

export const responsiveVariants = {
  // Spacing
  spacingResponsive: {
    sm: 'space-y-2 sm:space-y-4',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8',
  },
  
  // Padding
  paddingResponsive: {
    sm: 'p-4 sm:p-6',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-12',
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
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
  srOnly: 'sr-only',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-md',
  highContrast: 'contrast-more:border-black contrast-more:text-black dark:contrast-more:border-white dark:contrast-more:text-white',
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
