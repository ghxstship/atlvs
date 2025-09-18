'use client';

import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { ComponentSystem } from './ComponentSystem';
import { Stack, Inline, Grid } from './LayoutSystem';

// 2026 Composite Pattern System
// Standardized patterns for cards, tables, lists, grids, modals, drawers, alerts, navigation

// =============================================================================
// DATA DISPLAY PATTERNS
// =============================================================================

// Enhanced Table Pattern
const tableVariants = cva(
  'w-full border-collapse',
  {
    variants: {
      variant: {
        default: 'bg-card',
        striped: 'bg-card [&_tbody_tr:nth-child(even)]:bg-muted',
        bordered: 'border border-border',
      },
      size: {
        sm: '[&_th]:px-sm [&_th]:py-sm [&_td]:px-sm [&_td]:py-sm text-sm',
        md: '[&_th]:px-md [&_th]:py-sm [&_td]:px-md [&_td]:py-sm text-sm',
        lg: '[&_th]:px-lg [&_th]:py-md [&_td]:px-lg [&_td]:py-md text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const tableHeaderVariants = cva(
  'text-left font-semibold text-foreground border-b border-border bg-muted',
  {
    variants: {
      sortable: {
        true: 'cursor-pointer hover:bg-muted transition-colors',
        false: '',
      },
    },
    defaultVariants: {
      sortable: false,
    },
  }
);

const tableCellVariants = cva(
  'border-b border-border text-muted-foreground',
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      align: 'left',
    },
  }
);

// Enhanced List Pattern
const listVariants = cva(
  'divide-y divide-border',
  {
    variants: {
      variant: {
        default: 'bg-card',
        bordered: 'border border-border rounded-lg',
        card: 'bg-card border border-border rounded-lg shadow-surface',
      },
      spacing: {
        none: '[&>*]:py-0',
        sm: '[&>*]:py-sm',
        md: '[&>*]:py-sm',
        lg: '[&>*]:py-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'md',
    },
  }
);

const listItemVariants = cva(
  'flex items-center justify-between px-md transition-colors',
  {
    variants: {
      interactive: {
        true: 'hover:bg-muted cursor-pointer',
        false: '',
      },
      selected: {
        true: 'bg-primary/5 border-l-4 border-primary',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
      selected: false,
    },
  }
);

// Enhanced Grid Pattern
const gridPatternVariants = cva(
  'grid gap-md',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        auto: 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]',
        masonry: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-md gap-md',
      },
      gap: {
        sm: 'gap-sm',
        md: 'gap-md',
        lg: 'gap-lg',
        xl: 'gap-xl',
      },
    },
    defaultVariants: {
      cols: 'auto',
      gap: 'md',
    },
  }
);

// =============================================================================
// OVERLAY PATTERNS
// =============================================================================

// Enhanced Modal Pattern
const modalOverlayVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center p-md bg-foreground/30 backdrop-blur-sm',
  {
    variants: {
      animation: {
        fade: 'animate-in fade-in duration-200',
        scale: 'animate-in fade-in zoom-in-95 duration-200',
        slide: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
      },
    },
    defaultVariants: {
      animation: 'fade',
    },
  }
);

const modalContentVariants = cva(
  'relative w-full max-w-lg bg-card rounded-lg shadow-modal border border-border',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
      },
      padding: {
        none: 'p-0',
        sm: 'p-md',
        md: 'p-lg',
        lg: 'p-xl',
      },
    },
    defaultVariants: {
      size: 'md',
      padding: 'md',
    },
  }
);

// Enhanced Drawer Pattern
const drawerOverlayVariants = cva(
  'fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm',
  {
    variants: {
      animation: {
        fade: 'animate-in fade-in duration-200',
      },
    },
    defaultVariants: {
      animation: 'fade',
    },
  }
);

const drawerContentVariants = cva(
  'fixed bg-card border-border shadow-modal',
  {
    variants: {
      side: {
        top: 'top-0 left-0 right-0 border-b animate-in slide-in-from-top duration-300',
        right: 'top-0 right-0 bottom-0 border-l animate-in slide-in-from-right duration-300',
        bottom: 'bottom-0 left-0 right-0 border-t animate-in slide-in-from-bottom duration-300',
        left: 'top-0 left-0 bottom-0 border-r animate-in slide-in-from-left duration-300',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        full: '',
      },
    },
    compoundVariants: [
      {
        side: ['left', 'right'],
        size: 'sm',
        class: 'w-80',
      },
      {
        side: ['left', 'right'],
        size: 'md',
        class: 'w-96',
      },
      {
        side: ['left', 'right'],
        size: 'lg',
        class: 'w-[32rem]',
      },
      {
        side: ['left', 'right'],
        size: 'full',
        class: 'w-full',
      },
      {
        side: ['top', 'bottom'],
        size: 'sm',
        class: 'h-80',
      },
      {
        side: ['top', 'bottom'],
        size: 'md',
        class: 'h-96',
      },
      {
        side: ['top', 'bottom'],
        size: 'lg',
        class: 'h-[32rem]',
      },
      {
        side: ['top', 'bottom'],
        size: 'full',
        class: 'h-full',
      },
    ],
    defaultVariants: {
      side: 'right',
      size: 'md',
    },
  }
);

// =============================================================================
// FEEDBACK PATTERNS
// =============================================================================

// Enhanced Alert Pattern
const alertVariants = cva(
  'relative w-full rounded-lg border px-md py-sm text-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: [
          'bg-muted text-foreground border-border',
        ],
        info: [
          'bg-primary/10 text-primary border border-primary/20',
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
      },
      dismissible: {
        true: 'pr-2xl',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      dismissible: false,
    },
  }
);

// Enhanced Toast Pattern
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between gap-md overflow-hidden rounded-lg border p-md shadow-floating transition-all duration-300',
  {
    variants: {
      variant: {
        default: [
          'bg-card text-foreground border-border',
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
      },
      position: {
        'top-left': 'animate-in slide-in-from-top-full',
        'top-right': 'animate-in slide-in-from-top-full',
        'bottom-left': 'animate-in slide-in-from-bottom-full',
        'bottom-right': 'animate-in slide-in-from-bottom-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'top-right',
    },
  }
);

// =============================================================================
// NAVIGATION PATTERNS
// =============================================================================

// Enhanced Navigation Pattern
const navVariants = cva(
  'flex items-center',
  {
    variants: {
      variant: {
        horizontal: 'flex-row gap-xs',
        vertical: 'flex-col gap-xs',
        tabs: 'flex-row border-b border-border',
        pills: 'flex-row gap-xs p-xs bg-muted rounded-lg',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'horizontal',
      size: 'md',
    },
  }
);

const navItemVariants = cva(
  'relative inline-flex items-center justify-center px-sm py-sm text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: [
          'text-muted-foreground hover:text-foreground hover:bg-muted rounded-md',
        ],
        tabs: [
          'text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border rounded-none',
        ],
        pills: [
          'text-muted-foreground hover:text-foreground hover:bg-background rounded-md',
        ],
      },
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        active: true,
        class: 'text-primary bg-primary/5',
      },
      {
        variant: 'tabs',
        active: true,
        class: 'text-primary border-primary',
      },
      {
        variant: 'pills',
        active: true,
        class: 'text-primary bg-background shadow-surface',
      },
    ],
    defaultVariants: {
      variant: 'default',
      active: false,
    },
  }
);

// =============================================================================
// FORM PATTERNS
// =============================================================================

// Enhanced Form Field Pattern
const formFieldVariants = cva(
  'gap-sm',
  {
    variants: {
      variant: {
        default: '',
        inline: 'flex items-center gap-md space-y-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const formLabelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        required: 'text-foreground after:content-["*"] after:ml-0.5 after:text-destructive',
        optional: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const formDescriptionVariants = cva(
  'text-sm text-muted-foreground'
);

const formErrorVariants = cva(
  'text-sm text-destructive'
);

// =============================================================================
// COMPONENT EXPORTS
// =============================================================================

export const CompositePatterns = {
  // Data Display
  table: {
    root: tableVariants,
    header: tableHeaderVariants,
    cell: tableCellVariants,
  },
  list: {
    root: listVariants,
    item: listItemVariants,
  },
  grid: {
    root: gridPatternVariants,
  },
  
  // Overlays
  modal: {
    overlay: modalOverlayVariants,
    content: modalContentVariants,
  },
  drawer: {
    overlay: drawerOverlayVariants,
    content: drawerContentVariants,
  },
  
  // Feedback
  alert: alertVariants,
  toast: toastVariants,
  
  // Navigation
  nav: {
    root: navVariants,
    item: navItemVariants,
  },
  
  // Forms
  form: {
    field: formFieldVariants,
    label: formLabelVariants,
    description: formDescriptionVariants,
    error: formErrorVariants,
  },
};

// =============================================================================
// PATTERN COMPOSITION UTILITIES
// =============================================================================

export const createPattern = <T extends Record<string, any>>(
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

export const extendPattern = (
  basePattern: any,
  extensions: string | string[]
) => {
  return (...args: any[]) => {
    const baseClasses = basePattern(...args);
    const extensionClasses = Array.isArray(extensions) 
      ? extensions.join(' ') 
      : extensions;
    return twMerge(baseClasses, extensionClasses);
  };
};

// =============================================================================
// RESPONSIVE PATTERN UTILITIES
// =============================================================================

export const responsivePattern = {
  stack: (spacing: 'sm' | 'md' | 'lg' = 'md') => {
    const spacingMap = {
      sm: 'gap-sm sm:gap-md',
      md: 'gap-md sm:gap-lg',
      lg: 'gap-lg sm:gap-xl',
    };
    return `flex flex-col ${spacingMap[spacing]}`;
  },
  
  inline: (spacing: 'sm' | 'md' | 'lg' = 'md') => {
    const spacingMap = {
      sm: 'gap-sm sm:gap-md',
      md: 'gap-md sm:gap-lg',
      lg: 'gap-lg sm:gap-xl',
    };
    return `flex flex-row items-center ${spacingMap[spacing]}`;
  },
  
  grid: (cols: number = 3) => {
    const colsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };
    return `grid gap-md ${colsMap[cols] || colsMap[3]}`;
  },
};

export default CompositePatterns;
