'use client';

import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { ComponentSystem } from './ComponentSystem';
import { CompositePatterns } from './CompositePatterns';
import { ContainerSystem } from './ContainerSystem';

// 2026 Workflow System - Full-Page Layout & End-to-End Flow Optimization
// Ensures consistency, efficiency, and seamless user experiences

// =============================================================================
// PAGE LAYOUT PATTERNS
// =============================================================================

// Enhanced Page Layout System
const pageLayoutVariants = cva(
  'min-h-screen bg-muted',
  {
    variants: {
      type: {
        // Standard application layout
        app: 'flex flex-col',
        
        // Dashboard with sidebar
        dashboard: 'flex h-screen overflow-hidden',
        
        // Marketing/landing page
        marketing: 'flex flex-col',
        
        // Authentication pages
        auth: 'flex items-center justify-center p-md',
        
        // Documentation/content
        docs: 'flex flex-col lg:flex-row',
        
        // Settings/configuration
        settings: 'flex flex-col lg:flex-row gap-xl p-lg',
        
        // Full-screen application
        fullscreen: 'h-screen w-screen overflow-hidden',
      },
      navigation: {
        top: '[&>header]:sticky [&>header]:top-0 [&>header]:z-40',
        side: '[&>aside]:sticky [&>aside]:top-0 [&>aside]:h-screen',
        both: '[&>header]:sticky [&>header]:top-0 [&>header]:z-40 [&>aside]:sticky [&>aside]:top-0 [&>aside]:h-screen',
        none: '',
      },
      spacing: {
        none: 'gap-0',
        sm: 'gap-md',
        md: 'gap-lg',
        lg: 'gap-xl',
      },
    },
    defaultVariants: {
      type: 'app',
      navigation: 'top',
      spacing: 'md',
    },
  }
);

// Enhanced Content Area System
const contentAreaVariants = cva(
  'flex-1 overflow-auto',
  {
    variants: {
      layout: {
        // Single column content
        single: 'max-w-4xl mx-auto px-lg py-xl',
        
        // Two column layout
        split: 'grid grid-cols-1 lg:grid-cols-2 gap-xl px-lg py-xl',
        
        // Three column layout
        triple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg px-lg py-xl',
        
        // Full width content
        full: 'px-lg py-xl',
        
        // Centered content with max width
        centered: 'max-w-7xl mx-auto px-lg py-xl',
        
        // Sidebar + content
        sidebar: 'flex gap-xl px-lg py-xl',
        
        // Card-based layout
        cards: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg px-lg py-xl',
      },
      padding: {
        none: 'p-0',
        sm: 'p-md',
        md: 'px-lg py-xl',
        lg: 'px-xl py-2xl',
      },
      spacing: {
        tight: 'gap-md',
        normal: 'gap-lg',
        loose: 'gap-xl',
        xl: 'gap-2xl',
      },
    },
    defaultVariants: {
      layout: 'centered',
      padding: 'md',
      spacing: 'normal',
    },
  }
);

// =============================================================================
// WORKFLOW PATTERNS
// =============================================================================

// Enhanced Workflow Container
const workflowVariants = cva(
  'gap-lg',
  {
    variants: {
      type: {
        // Linear step-by-step process
        linear: 'gap-xl',
        
        // Tabbed workflow
        tabbed: 'space-y-0',
        
        // Wizard/stepper workflow
        wizard: 'gap-lg',
        
        // Dashboard workflow
        dashboard: 'grid grid-cols-1 lg:grid-cols-3 gap-lg',
        
        // Form-based workflow
        form: 'max-w-2xl mx-auto gap-lg',
        
        // List/table workflow
        list: 'gap-md',
        
        // Card-based workflow
        cards: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg',
      },
      state: {
        loading: 'opacity-50 pointer-events-none',
        error: 'border-l-4 border-destructive pl-md',
        success: 'border-l-4 border-success pl-md',
        warning: 'border-l-4 border-warning pl-md',
        default: '',
      },
      progress: {
        none: '',
        linear: 'relative before:absolute before:top-0 before:left-0 before:h-1 before:bg-accent before:transition-all',
        circular: 'relative',
        stepped: 'relative',
      },
    },
    defaultVariants: {
      type: 'linear',
      state: 'default',
      progress: 'none',
    },
  }
);

// Enhanced Step System
const stepVariants = cva(
  'relative',
  {
    variants: {
      variant: {
        default: 'p-lg bg-card border border-border rounded-lg',
        minimal: 'p-md',
        card: 'p-lg bg-card border border-border rounded-lg shadow-surface',
        highlighted: 'p-lg bg-accent/5 border border-primary rounded-lg',
      },
      state: {
        pending: 'opacity-60',
        active: 'ring-2 ring-primary ring-offset-2',
        completed: 'bg-success/10 border-success/20',
        error: 'bg-destructive/10 border-destructive/20',
        skipped: 'opacity-40 bg-muted',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      state: 'pending',
      interactive: false,
    },
  }
);

// =============================================================================
// NAVIGATION WORKFLOWS
// =============================================================================

// Enhanced Breadcrumb System
const breadcrumbVariants = cva(
  'flex items-center gap-sm text-sm text-muted-foreground',
  {
    variants: {
      variant: {
        default: '',
        minimal: 'text-xs',
        prominent: 'text-base font-medium',
      },
      separator: {
        slash: '[&>*:not(:last-child)]:after:content-["/"] [&>*:not(:last-child)]:after:mx-sm [&>*:not(:last-child)]:after:text-muted-foreground',
        chevron: '[&>*:not(:last-child)]:after:content-["›"] [&>*:not(:last-child)]:after:mx-sm [&>*:not(:last-child)]:after:text-muted-foreground',
        arrow: '[&>*:not(:last-child)]:after:content-["→"] [&>*:not(:last-child)]:after:mx-sm [&>*:not(:last-child)]:after:text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
      separator: 'chevron',
    },
  }
);

// Enhanced Progress Indicator
const progressVariants = cva(
  'flex items-center',
  {
    variants: {
      variant: {
        linear: 'w-full bg-muted rounded-full h-2',
        stepped: 'gap-md',
        circular: 'relative w-component-md h-component-md',
        minimal: 'text-sm text-muted-foreground',
      },
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      variant: 'linear',
      size: 'md',
    },
  }
);

// =============================================================================
// ACTION WORKFLOWS
// =============================================================================

// Enhanced Action Bar System
const actionBarVariants = cva(
  'flex items-center justify-between p-md bg-background border-t border-border',
  {
    variants: {
      variant: {
        default: '',
        floating: 'mx-md mb-md rounded-lg border shadow-floating',
        sticky: 'sticky bottom-0 z-30',
        fixed: 'fixed bottom-0 left-0 right-0 z-30',
      },
      layout: {
        spread: 'justify-between',
        end: 'justify-end',
        start: 'justify-start',
        center: 'justify-center',
        stack: 'flex-col gap-sm items-stretch',
      },
      spacing: {
        tight: 'gap-sm',
        normal: 'gap-sm',
        loose: 'gap-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      layout: 'spread',
      spacing: 'normal',
    },
  }
);

// Enhanced Toolbar System
const toolbarVariants = cva(
  'flex items-center gap-sm p-sm bg-muted border border-border rounded-lg',
  {
    variants: {
      variant: {
        default: '',
        minimal: 'bg-transparent border-0 p-0',
        prominent: 'p-md shadow-surface',
        floating: 'shadow-floating border-border',
      },
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
      size: {
        sm: 'p-xs gap-xs',
        md: 'p-sm gap-sm',
        lg: 'p-sm gap-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      orientation: 'horizontal',
      size: 'md',
    },
  }
);

// =============================================================================
// FEEDBACK WORKFLOWS
// =============================================================================

// Enhanced Status System
const statusVariants = cva(
  'inline-flex items-center gap-sm px-sm py-xs rounded-full text-sm font-medium',
  {
    variants: {
      variant: {
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-destructive/10 text-destructive',
        info: 'bg-accent/10 text-accent',
        neutral: 'bg-muted text-foreground',
        processing: 'bg-accent/10 text-accent animate-pulse',
      },
      size: {
        sm: 'px-sm py-0.5 text-xs',
        md: 'px-sm py-xs text-sm',
        lg: 'px-md py-sm text-base',
      },
      withIcon: {
        true: 'pl-sm',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
      withIcon: false,
    },
  }
);

// Enhanced Notification System
const notificationVariants = cva(
  'relative p-md rounded-lg border shadow-surface transition-all duration-300',
  {
    variants: {
      variant: {
        success: 'bg-success/10 border-success/20 text-success',
        warning: 'bg-warning/10 border-warning/20 text-warning',
        error: 'bg-destructive/10 border-destructive/20 text-destructive',
        info: 'bg-accent/10 border-primary/20 text-accent',
      },
      position: {
        inline: 'mb-md',
        floating: 'fixed top-4 right-4 z-50 max-w-sm',
        banner: 'w-full',
      },
      dismissible: {
        true: 'pr-2xl',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'info',
      position: 'inline',
      dismissible: true,
    },
  }
);

// =============================================================================
// RESPONSIVE WORKFLOW PATTERNS
// =============================================================================

const responsiveWorkflowVariants = {
  // Mobile-first navigation
  mobileNav: 'lg:hidden fixed inset-x-0 bottom-0 z-50 bg-background border-t border-border',
  
  // Desktop sidebar
  desktopSidebar: 'hidden lg:flex lg:flex-col lg:w-container-sm lg:fixed lg:inset-y-0 lg:z-50',
  
  // Responsive content
  responsiveContent: 'lg:pl-64',
  
  // Mobile drawer
  mobileDrawer: 'lg:hidden fixed inset-0 z-50',
  
  // Responsive grid
  responsiveGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md',
  
  // Responsive stack
  responsiveStack: 'flex flex-col lg:flex-row gap-md lg:gap-xl',
  
  // Responsive toolbar
  responsiveToolbar: 'flex flex-col sm:flex-row gap-sm sm:gap-md',
};

// =============================================================================
// WORKFLOW OPTIMIZATION UTILITIES
// =============================================================================

export const workflowOptimization = {
  // Auto-save patterns
  autoSave: {
    debounce: 500,
    indicator: 'text-xs text-muted-foreground animate-pulse',
    success: 'text-xs text-success',
    error: 'text-xs text-destructive',
  },
  
  // Loading states
  loading: {
    skeleton: 'animate-pulse bg-muted rounded',
    spinner: 'animate-spin h-icon-xs w-icon-xs border-2 border-primary border-t-transparent rounded-full',
    dots: 'flex gap-xs [&>div]:w-2 [&>div]:h-2 [&>div]:bg-accent [&>div]:rounded-full [&>div]:animate-bounce',
  },
  
  // Error recovery
  errorRecovery: {
    retry: 'inline-flex items-center gap-sm text-sm text-accent hover:text-accent/80 cursor-pointer',
    fallback: 'p-md bg-muted border border-border rounded-lg text-center',
  },
  
  // Progressive disclosure
  disclosure: {
    collapsed: 'max-h-0 overflow-hidden transition-all duration-300',
    expanded: 'max-h-screen overflow-visible transition-all duration-300',
    toggle: 'flex items-center gap-sm text-sm font-medium text-accent hover:text-accent/80 cursor-pointer',
  },
};

// =============================================================================
// ACCESSIBILITY WORKFLOW PATTERNS
// =============================================================================

export const a11yWorkflowPatterns = {
  // Focus management
  focusManagement: {
    trap: 'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
    skip: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
    restore: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  },
  
  // Screen reader support
  screenReader: {
    liveRegion: '[aria-live="polite"]',
    assertive: '[aria-live="assertive"]',
    description: '[aria-describedby]',
    label: '[aria-labelledby]',
  },
  
  // Keyboard navigation
  keyboard: {
    navigation: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
    shortcuts: '[data-hotkey]',
    escape: '[data-dismiss="escape"]',
  },
};

// =============================================================================
// COMPONENT EXPORTS
// =============================================================================

export const WorkflowSystem = {
  // Page Layouts
  page: pageLayoutVariants,
  content: contentAreaVariants,
  
  // Workflow Patterns
  workflow: workflowVariants,
  step: stepVariants,
  
  // Navigation
  breadcrumb: breadcrumbVariants,
  progress: progressVariants,
  
  // Actions
  actionBar: actionBarVariants,
  toolbar: toolbarVariants,
  
  // Feedback
  status: statusVariants,
  notification: notificationVariants,
  
  // Responsive
  responsive: responsiveWorkflowVariants,
  
  // Optimization
  optimization: workflowOptimization,
  
  // Accessibility
  a11y: a11yWorkflowPatterns,
};

// =============================================================================
// WORKFLOW COMPOSITION UTILITIES
// =============================================================================

export const createWorkflow = <T extends Record<string, any>>(
  steps: T[],
  options?: {
    type?: 'linear' | 'tabbed' | 'wizard';
    validation?: boolean;
    autoSave?: boolean;
    progress?: boolean;
  }
) => {
  const { type = 'linear', validation = true, autoSave = false, progress = false } = options || {};
  
  return {
    steps,
    type,
    validation,
    autoSave,
    progress,
    currentStep: 0,
    completedSteps: new Set<number>(),
    errors: new Map<number, string[]>(),
  };
};

export const optimizeWorkflow = (workflow: any) => {
  // Add auto-save capabilities
  if (workflow.autoSave) {
    // Implement debounced auto-save logic
  }
  
  // Add validation
  if (workflow.validation) {
    // Implement real-time validation
  }
  
  // Add progress tracking
  if (workflow.progress) {
    // Implement progress calculation
  }
  
  return workflow;
};

export default WorkflowSystem;
