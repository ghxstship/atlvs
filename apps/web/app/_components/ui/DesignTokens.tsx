'use client';

import { cn } from '@ghxstship/ui/system';

// Design System Color Tokens
export const designTokens = {
  colors: {
    // Status colors using design system
    status: {
      success: 'bg-success/10 color-success border-success/20',
      warning: 'bg-warning/10 color-warning border-warning/20',
      error: 'bg-destructive/10 color-destructive border-destructive/20',
      info: 'bg-primary/10 color-primary border-primary/20',
      neutral: 'bg-secondary/10 color-muted border-muted/20',
    },
    
    // Priority levels
    priority: {
      high: 'bg-destructive/10 color-destructive border-destructive/30',
      medium: 'bg-warning/10 color-warning border-warning/30',
      low: 'bg-success/10 color-success border-success/30',
    },
    
    // Contract/Job status
    contractStatus: {
      active: 'bg-success/10 color-success',
      pending: 'bg-warning/10 color-warning',
      expired: 'bg-destructive/10 color-destructive',
      draft: 'bg-secondary/10 color-muted',
      cancelled: 'bg-destructive/10 color-destructive',
    },
    
    // Financial status
    financial: {
      paid: 'bg-success/10 color-success',
      pending: 'bg-warning/10 color-warning',
      overdue: 'bg-destructive/10 color-destructive',
      draft: 'bg-secondary/10 color-muted',
    },
    
    // Background variants
    background: {
      primary: 'bg-background',
      secondary: 'bg-secondary/50',
      accent: 'bg-accent/10',
      card: 'bg-card',
      popover: 'bg-popover',
    },
    
    // Border variants
    border: {
      default: 'border-border',
      muted: 'border-muted',
      accent: 'border-accent',
    },
    
    // Text variants
    text: {
      primary: 'color-foreground',
      secondary: 'color-muted',
      accent: 'color-accent-foreground',
      destructive: 'color-destructive',
    }
  },
  
  // Spacing tokens
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
  
  // Border radius tokens
  radius: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
  
  // Shadow tokens
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  }
};

// Utility functions for applying design tokens
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': designTokens.colors.status.success,
    'completed': designTokens.colors.status.success,
    'approved': designTokens.colors.status.success,
    'paid': designTokens.colors.financial.paid,
    
    'pending': designTokens.colors.status.warning,
    'in_progress': designTokens.colors.status.warning,
    'submitted': designTokens.colors.status.warning,
    
    'expired': designTokens.colors.status.error,
    'rejected': designTokens.colors.status.error,
    'overdue': designTokens.colors.financial.overdue,
    'cancelled': designTokens.colors.contractStatus.cancelled,
    
    'draft': designTokens.colors.status.neutral,
    'inactive': designTokens.colors.status.neutral,
  };
  
  return statusMap[status.toLowerCase()] || designTokens.colors.status.neutral;
};

export const getPriorityColor = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'high': designTokens.colors.priority.high,
    'medium': designTokens.colors.priority.medium,
    'low': designTokens.colors.priority.low,
  };
  
  return priorityMap[priority.toLowerCase()] || designTokens.colors.priority.medium;
};

// Component wrapper for consistent styling
interface TokenizedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'muted';
  className?: string;
}

export function TokenizedCard({ 
  children, 
  variant = 'default', 
  className 
}: TokenizedCardProps) {
  const variantClasses = {
    default: cn(designTokens.colors.background.card, designTokens.colors.border.default),
    accent: cn(designTokens.colors.background.accent, designTokens.colors.border.accent),
    muted: cn(designTokens.colors.background.secondary, designTokens.colors.border.muted),
  };
  
  return (
    <div className={cn(
      'border rounded-lg',
      variantClasses[variant],
      designTokens.spacing.md,
      designTokens.shadow.sm,
      className
    )}>
      {children}
    </div>
  );
}

// Status badge component using design tokens
interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-body-sm form-label border',
      getStatusColor(status),
      className
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
}

// Priority badge component using design tokens
interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-body-sm form-label border',
      getPriorityColor(priority),
      className
    )}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

export default designTokens;
