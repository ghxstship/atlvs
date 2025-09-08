'use client';

import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { ComponentSystem } from './ComponentSystem';

// 2026 Container & Section System
// Normalized headers, footers, sidebars, panels, filters, search bars, forms

// =============================================================================
// LAYOUT CONTAINERS
// =============================================================================

// Enhanced Header Pattern
const headerVariants = cva(
  'sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/95 dark:supports-[backdrop-filter]:bg-neutral-900/60',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 dark:border-neutral-800',
        elevated: 'border-neutral-200 dark:border-neutral-800 shadow-sm',
        transparent: 'border-transparent bg-transparent backdrop-blur-none',
        solid: 'bg-white dark:bg-neutral-900 backdrop-blur-none',
      },
      size: {
        sm: 'h-12',
        md: 'h-16',
        lg: 'h-20',
      },
      padding: {
        none: 'px-0',
        sm: 'px-4',
        md: 'px-6',
        lg: 'px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      padding: 'md',
    },
  }
);

// Enhanced Footer Pattern
const footerVariants = cva(
  'w-full border-t bg-white dark:bg-neutral-900',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 dark:border-neutral-800',
        minimal: 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950',
        elevated: 'border-neutral-200 dark:border-neutral-800 shadow-lg',
      },
      size: {
        sm: 'py-4',
        md: 'py-6',
        lg: 'py-8',
      },
      padding: {
        none: 'px-0',
        sm: 'px-4',
        md: 'px-6',
        lg: 'px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      padding: 'md',
    },
  }
);

// Enhanced Sidebar Pattern
const sidebarVariants = cva(
  'flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-lg',
        minimal: 'bg-neutral-50 dark:bg-neutral-950 border-neutral-100 dark:border-neutral-800',
        floating: 'mx-2 my-2 rounded-lg border shadow-sm',
      },
      width: {
        sm: 'w-48',
        md: 'w-64',
        lg: 'w-80',
        xl: 'w-96',
      },
      collapsible: {
        true: 'transition-all duration-300 ease-in-out',
        false: '',
      },
      collapsed: {
        true: 'w-16',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      width: 'md',
      collapsible: false,
      collapsed: false,
    },
  }
);

// Enhanced Panel Pattern
const panelVariants = cva(
  'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-md',
        outlined: 'border-2',
        ghost: 'border-transparent bg-transparent',
        filled: 'bg-neutral-50 dark:bg-neutral-950 border-neutral-100 dark:border-neutral-800',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      spacing: {
        none: 'space-y-0',
        sm: 'space-y-2',
        md: 'space-y-4',
        lg: 'space-y-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      spacing: 'md',
    },
  }
);

// =============================================================================
// INTERACTIVE CONTAINERS
// =============================================================================

// Enhanced Filter Panel Pattern
const filterPanelVariants = cva(
  'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg',
  {
    variants: {
      variant: {
        default: '',
        compact: 'border-0 bg-neutral-50 dark:bg-neutral-950',
        floating: 'shadow-lg border-neutral-300 dark:border-neutral-600',
        sidebar: 'border-r border-t-0 border-b-0 border-l-0 rounded-none',
      },
      layout: {
        vertical: 'flex flex-col space-y-4',
        horizontal: 'flex flex-row flex-wrap gap-4',
        grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
      collapsible: {
        true: 'transition-all duration-300',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      layout: 'vertical',
      padding: 'md',
      collapsible: false,
    },
  }
);

// Enhanced Search Bar Pattern
const searchBarVariants = cva(
  'relative flex items-center',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg',
        filled: 'bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-lg',
        minimal: 'bg-transparent border-b border-neutral-300 dark:border-neutral-600 rounded-none',
        floating: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        xl: 'h-14 px-6 text-lg',
      },
      width: {
        auto: 'w-auto',
        sm: 'w-64',
        md: 'w-80',
        lg: 'w-96',
        full: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      width: 'md',
    },
  }
);

// =============================================================================
// FORM CONTAINERS
// =============================================================================

// Enhanced Form Pattern
const formVariants = cva(
  'space-y-6',
  {
    variants: {
      variant: {
        default: '',
        card: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6',
        inline: 'flex flex-row items-end gap-4 space-y-0',
        stepped: 'space-y-8',
      },
      layout: {
        vertical: 'flex flex-col',
        horizontal: 'grid grid-cols-1 sm:grid-cols-2 gap-6',
        compact: 'space-y-4',
      },
      validation: {
        live: '[&_.field-error]:animate-in [&_.field-error]:slide-in-from-top-1',
        onSubmit: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      layout: 'vertical',
      validation: 'live',
    },
  }
);

// Enhanced Form Section Pattern
const formSectionVariants = cva(
  'space-y-4',
  {
    variants: {
      variant: {
        default: '',
        card: 'bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4',
        bordered: 'border-l-4 border-brand-500 pl-4',
        collapsible: 'border border-neutral-200 dark:border-neutral-800 rounded-lg',
      },
      spacing: {
        tight: 'space-y-2',
        normal: 'space-y-4',
        loose: 'space-y-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'normal',
    },
  }
);

// Enhanced Form Actions Pattern
const formActionsVariants = cva(
  'flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-800',
  {
    variants: {
      variant: {
        default: 'justify-end',
        spread: 'justify-between',
        center: 'justify-center',
        start: 'justify-start',
      },
      layout: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
        responsive: 'flex-col sm:flex-row sm:justify-end',
      },
      sticky: {
        true: 'sticky bottom-0 bg-white dark:bg-neutral-900 p-4 -mx-4 -mb-4 rounded-b-lg',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      layout: 'horizontal',
      sticky: false,
    },
  }
);

// =============================================================================
// CONTENT CONTAINERS
// =============================================================================

// Enhanced Content Section Pattern
const contentSectionVariants = cva(
  'space-y-4',
  {
    variants: {
      variant: {
        default: '',
        hero: 'text-center py-12 sm:py-16 lg:py-20',
        feature: 'py-8 sm:py-12',
        testimonial: 'bg-neutral-50 dark:bg-neutral-950 py-8 sm:py-12 rounded-lg',
        cta: 'bg-brand-50 dark:bg-brand-950 py-8 sm:py-12 rounded-lg text-center',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12',
      },
      maxWidth: {
        none: 'max-w-none',
        sm: 'max-w-2xl mx-auto',
        md: 'max-w-4xl mx-auto',
        lg: 'max-w-6xl mx-auto',
        xl: 'max-w-7xl mx-auto',
        full: 'max-w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      maxWidth: 'lg',
    },
  }
);

// Enhanced Empty State Pattern
const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center py-12',
  {
    variants: {
      variant: {
        default: 'text-neutral-600 dark:text-neutral-400',
        illustration: 'space-y-4',
        minimal: 'py-8 text-sm',
        error: 'text-error-600 dark:text-error-400',
      },
      size: {
        sm: 'py-8 space-y-2',
        md: 'py-12 space-y-4',
        lg: 'py-16 space-y-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Enhanced Loading State Pattern
const loadingStateVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      variant: {
        spinner: 'space-x-2',
        skeleton: 'w-full',
        dots: 'space-x-1',
        pulse: 'animate-pulse',
      },
      size: {
        sm: 'py-4',
        md: 'py-8',
        lg: 'py-12',
      },
    },
    defaultVariants: {
      variant: 'spinner',
      size: 'md',
    },
  }
);

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

const responsiveContainerVariants = cva(
  'w-full mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      maxWidth: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
      },
      padding: {
        none: 'px-0',
        sm: 'px-4',
        md: 'px-4 sm:px-6',
        lg: 'px-4 sm:px-6 lg:px-8',
      },
    },
    defaultVariants: {
      maxWidth: 'lg',
      padding: 'lg',
    },
  }
);

// =============================================================================
// COMPONENT EXPORTS
// =============================================================================

export const ContainerSystem = {
  // Layout Containers
  header: headerVariants,
  footer: footerVariants,
  sidebar: sidebarVariants,
  panel: panelVariants,
  
  // Interactive Containers
  filterPanel: filterPanelVariants,
  searchBar: searchBarVariants,
  
  // Form Containers
  form: formVariants,
  formSection: formSectionVariants,
  formActions: formActionsVariants,
  
  // Content Containers
  contentSection: contentSectionVariants,
  emptyState: emptyStateVariants,
  loadingState: loadingStateVariants,
  
  // Responsive Utilities
  container: responsiveContainerVariants,
};

// =============================================================================
// CONTAINER COMPOSITION UTILITIES
// =============================================================================

export const createContainer = <T extends Record<string, any>>(
  baseVariants: any,
  customVariants?: T
) => {
  return cva(baseVariants.base, {
    ...baseVariants,
    variants: {
      ...baseVariants.variants,
      ...customVariants,
    },
  });
};

export const withContainer = (
  Component: React.ComponentType<any>,
  containerVariants: any
) => {
  return React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const { className, variant, ...rest } = props;
    return (
      <div ref={ref} className={twMerge(containerVariants({ variant }), className)}>
        <Component {...rest} />
      </div>
    );
  });
};

// =============================================================================
// LAYOUT PATTERNS
// =============================================================================

export const layoutPatterns = {
  // Standard app layout
  app: 'min-h-screen bg-neutral-50 dark:bg-neutral-950',
  
  // Dashboard layout
  dashboard: 'flex h-screen bg-neutral-50 dark:bg-neutral-950',
  
  // Content layout
  content: 'flex-1 flex flex-col overflow-hidden',
  
  // Main content area
  main: 'flex-1 overflow-auto p-6',
  
  // Centered content
  centered: 'flex items-center justify-center min-h-screen p-4',
  
  // Split layout
  split: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
  
  // Three column layout
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  
  // Sidebar layout
  withSidebar: 'flex gap-6',
  
  // Stack layout
  stack: 'space-y-6',
  
  // Inline layout
  inline: 'flex items-center gap-4',
};

// =============================================================================
// ACCESSIBILITY PATTERNS
// =============================================================================

export const a11yContainerPatterns = {
  // Skip links
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-md',
  
  // Focus containers
  focusContainer: 'focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 rounded-lg',
  
  // Landmark regions
  landmark: '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]',
  
  // Screen reader only
  srOnly: 'sr-only',
  
  // High contrast support
  highContrast: 'contrast-more:border-black contrast-more:text-black dark:contrast-more:border-white dark:contrast-more:text-white',
  
  // Reduced motion support
  reducedMotion: 'motion-reduce:animate-none motion-reduce:transition-none',
};

export default ContainerSystem;
