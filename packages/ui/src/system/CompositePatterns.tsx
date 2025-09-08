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
        default: 'bg-white dark:bg-neutral-800',
        striped: 'bg-white dark:bg-neutral-800 [&_tbody_tr:nth-child(even)]:bg-neutral-50 dark:[&_tbody_tr:nth-child(even)]:bg-neutral-900',
        bordered: 'border border-neutral-200 dark:border-neutral-700',
      },
      size: {
        sm: '[&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 text-sm',
        md: '[&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3 text-sm',
        lg: '[&_th]:px-6 [&_th]:py-4 [&_td]:px-6 [&_td]:py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const tableHeaderVariants = cva(
  'text-left font-semibold text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900',
  {
    variants: {
      sortable: {
        true: 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
        false: '',
      },
    },
    defaultVariants: {
      sortable: false,
    },
  }
);

const tableCellVariants = cva(
  'border-b border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300',
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
  'divide-y divide-neutral-200 dark:divide-neutral-700',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-neutral-800',
        bordered: 'border border-neutral-200 dark:border-neutral-700 rounded-lg',
        card: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm',
      },
      spacing: {
        none: '[&>*]:py-0',
        sm: '[&>*]:py-2',
        md: '[&>*]:py-3',
        lg: '[&>*]:py-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'md',
    },
  }
);

const listItemVariants = cva(
  'flex items-center justify-between px-4 transition-colors',
  {
    variants: {
      interactive: {
        true: 'hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer',
        false: '',
      },
      selected: {
        true: 'bg-brand-50 dark:bg-brand-950 border-l-4 border-brand-500',
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
  'grid gap-4',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        auto: 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]',
        masonry: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4',
      },
      gap: {
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
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
  'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm',
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
  'relative w-full max-w-lg bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700',
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
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
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
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
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
  'fixed bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-xl',
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
  'relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: [
          'bg-neutral-50 text-neutral-900 border-neutral-200',
          'dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700',
        ],
        info: [
          'bg-brand-50 text-brand-900 border-brand-200',
          'dark:bg-brand-950 dark:text-brand-100 dark:border-brand-800',
        ],
        success: [
          'bg-success-50 text-success-900 border-success-200',
          'dark:bg-success-950 dark:text-success-100 dark:border-success-800',
        ],
        warning: [
          'bg-warning-50 text-warning-900 border-warning-200',
          'dark:bg-warning-950 dark:text-warning-100 dark:border-warning-800',
        ],
        error: [
          'bg-error-50 text-error-900 border-error-200',
          'dark:bg-error-950 dark:text-error-100 dark:border-error-800',
        ],
      },
      dismissible: {
        true: 'pr-10',
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
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all duration-300',
  {
    variants: {
      variant: {
        default: [
          'bg-white text-neutral-900 border-neutral-200',
          'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700',
        ],
        success: [
          'bg-success-50 text-success-900 border-success-200',
          'dark:bg-success-950 dark:text-success-100 dark:border-success-800',
        ],
        warning: [
          'bg-warning-50 text-warning-900 border-warning-200',
          'dark:bg-warning-950 dark:text-warning-100 dark:border-warning-800',
        ],
        error: [
          'bg-error-50 text-error-900 border-error-200',
          'dark:bg-error-950 dark:text-error-100 dark:border-error-800',
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
        horizontal: 'flex-row space-x-1',
        vertical: 'flex-col space-y-1',
        tabs: 'flex-row border-b border-neutral-200 dark:border-neutral-700',
        pills: 'flex-row space-x-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg',
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
  'relative inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: [
          'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md',
          'dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-700',
        ],
        tabs: [
          'text-neutral-600 hover:text-neutral-900 border-b-2 border-transparent hover:border-neutral-300 rounded-none',
          'dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:border-neutral-600',
        ],
        pills: [
          'text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-md',
          'dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-700',
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
        class: 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-950',
      },
      {
        variant: 'tabs',
        active: true,
        class: 'text-brand-600 border-brand-600 dark:text-brand-400 dark:border-brand-400',
      },
      {
        variant: 'pills',
        active: true,
        class: 'text-brand-600 bg-white shadow-sm dark:text-brand-400 dark:bg-neutral-700',
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
  'space-y-2',
  {
    variants: {
      variant: {
        default: '',
        inline: 'flex items-center space-x-4 space-y-0',
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
        default: 'text-neutral-900 dark:text-neutral-100',
        required: 'text-neutral-900 dark:text-neutral-100 after:content-["*"] after:ml-0.5 after:text-error-500',
        optional: 'text-neutral-600 dark:text-neutral-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const formDescriptionVariants = cva(
  'text-sm text-neutral-600 dark:text-neutral-400'
);

const formErrorVariants = cva(
  'text-sm text-error-600 dark:text-error-400'
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
      sm: 'space-y-2 sm:space-y-4',
      md: 'space-y-4 sm:space-y-6',
      lg: 'space-y-6 sm:space-y-8',
    };
    return `flex flex-col ${spacingMap[spacing]}`;
  },
  
  inline: (spacing: 'sm' | 'md' | 'lg' = 'md') => {
    const spacingMap = {
      sm: 'space-x-2 sm:space-x-4',
      md: 'space-x-4 sm:space-x-6',
      lg: 'space-x-6 sm:space-x-8',
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
    return `grid gap-4 ${colsMap[cols] || colsMap[3]}`;
  },
};

export default CompositePatterns;
