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
  'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'border-border shadow-surface',
        transparent: 'border-transparent bg-transparent backdrop-blur-none',
        solid: 'bg-background backdrop-blur-none',
      },
      size: {
        sm: 'h-12',
        md: 'h-16',
        lg: 'h-20',
      },
      padding: {
        none: 'px-0',
        sm: 'px-md',
        md: 'px-lg',
        lg: 'px-xl',
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
  'w-full border-t bg-background',
  {
    variants: {
      variant: {
        default: 'border-border',
        minimal: 'border-border bg-muted',
        elevated: 'border-border shadow-floating',
      },
      size: {
        sm: 'py-md',
        md: 'py-lg',
        lg: 'py-xl',
      },
      padding: {
        none: 'px-0',
        sm: 'px-md',
        md: 'px-lg',
        lg: 'px-xl',
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
  'flex flex-col bg-background border-r border-border',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-floating',
        minimal: 'bg-muted border-border',
        floating: 'mx-sm my-sm rounded-lg border border-border shadow-surface',
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
  'bg-card border border-border rounded-lg',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-elevated',
        outlined: 'border-2',
        ghost: 'border-transparent bg-transparent',
        filled: 'bg-muted border-border',
      },
      padding: {
        none: 'p-0',
        sm: 'p-md',
        md: 'p-lg',
        lg: 'p-xl',
      },
      spacing: {
        none: 'space-y-0',
        sm: 'gap-sm',
        md: 'gap-md',
        lg: 'gap-lg',
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
  'bg-card border border-border rounded-lg',
  {
    variants: {
      variant: {
        default: '',
        compact: 'border-0 bg-muted',
        floating: 'shadow-floating border-border',
        sidebar: 'border-r border-border border-t-0 border-b-0 border-l-0 rounded-none',
      },
      layout: {
        vertical: 'flex flex-col gap-md',
        horizontal: 'flex flex-row flex-wrap gap-md',
        grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md',
      },
      padding: {
        none: 'p-0',
        sm: 'p-sm',
        md: 'p-md',
        lg: 'p-lg',
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
        default: 'bg-background border border-border rounded-lg',
        filled: 'bg-muted border border-transparent rounded-lg',
        minimal: 'bg-transparent border-b border-border rounded-none',
        floating: 'bg-background border border-border rounded-lg shadow-floating',
      },
      size: {
        sm: 'h-8 px-sm text-sm',
        md: 'h-10 px-md text-sm',
        lg: 'h-12 px-lg text-base',
        xl: 'h-14 px-lg text-lg',
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
  'gap-lg',
  {
    variants: {
      variant: {
        default: '',
        card: 'bg-card border border-border rounded-lg p-lg',
        inline: 'flex flex-row items-end gap-md space-y-0',
        stepped: 'gap-xl',
      },
      layout: {
        vertical: 'flex flex-col',
        horizontal: 'grid grid-cols-1 sm:grid-cols-2 gap-lg',
        compact: 'gap-md',
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
  'gap-md',
  {
    variants: {
      variant: {
        default: '',
        card: 'bg-muted border border-border rounded-lg p-md',
        bordered: 'border-l-4 border-primary pl-md',
        collapsible: 'border border-border rounded-lg',
      },
      spacing: {
        tight: 'gap-sm',
        normal: 'gap-md',
        loose: 'gap-lg',
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
  'flex gap-sm pt-lg border-t border-border',
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
        true: 'sticky bottom-0 bg-background p-md -mx-md -mb-md rounded-b-lg',
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
  'gap-md',
  {
    variants: {
      variant: {
        default: '',
        hero: 'text-center py-2xl sm:py-3xl lg:py-4xl',
        feature: 'py-xl sm:py-2xl',
        testimonial: 'bg-muted py-xl sm:py-2xl rounded-lg',
        cta: 'bg-accent/5 py-xl sm:py-2xl rounded-lg text-center',
      },
      padding: {
        none: 'p-0',
        sm: 'p-md',
        md: 'p-lg',
        lg: 'p-xl',
        xl: 'p-2xl',
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
  'flex flex-col items-center justify-center text-center py-2xl',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground/70 dark:text-muted-foreground/50',
        illustration: 'gap-md',
        minimal: 'py-xl text-sm',
        error: 'text-destructive-600 dark:text-destructive-400',
      },
      size: {
        sm: 'py-xl gap-sm',
        md: 'py-2xl gap-md',
        lg: 'py-3xl gap-lg',
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
        spinner: 'gap-sm',
        skeleton: 'w-full',
        dots: 'gap-xs',
        pulse: 'animate-pulse',
      },
      size: {
        sm: 'py-md',
        md: 'py-xl',
        lg: 'py-2xl',
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
  'w-full mx-auto px-md sm:px-lg lg:px-xl',
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
        sm: 'px-md',
        md: 'px-md sm:px-lg',
        lg: 'px-md sm:px-lg lg:px-xl',
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
  app: 'min-h-screen bg-muted',
  
  // Dashboard layout
  dashboard: 'flex h-screen bg-muted',
  
  // Content layout
  content: 'flex-1 flex flex-col overflow-hidden',
  
  // Main content area
  main: 'flex-1 overflow-auto p-lg',
  
  // Centered content
  centered: 'flex items-center justify-center min-h-screen p-md',
  
  // Split layout
  split: 'grid grid-cols-1 lg:grid-cols-2 gap-xl',
  
  // Three column layout
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg',
  
  // Sidebar layout
  withSidebar: 'flex gap-lg',
  
  // Stack layout
  stack: 'gap-lg',
  
  // Inline layout
  inline: 'flex items-center gap-md',
};

// =============================================================================
// ACCESSIBILITY PATTERNS
// =============================================================================

export const a11yContainerPatterns = {
  // Skip links
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-md focus:py-sm focus:bg-accent focus:text-accent-foreground focus:rounded-md',
  
  // Focus containers
  focusContainer: 'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg',
  
  // Landmark regions
  landmark: '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]',
  
  // Screen reader only
  srOnly: 'sr-only',
  
  // High contrast support
  highContrast: 'contrast-more:border-foreground contrast-more:text-foreground',
  
  // Reduced motion support
  reducedMotion: 'motion-reduce:animate-none motion-reduce:transition-none',
};

export default ContainerSystem;
