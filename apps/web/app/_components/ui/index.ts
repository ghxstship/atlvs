// DEPRECATED: This shadow UI directory violates single source of truth
// All UI components should be imported directly from @ghxstship/ui
// This file exists only for backward compatibility during migration

import React from 'react';
import { 
  Button, 
  Card, 
  Badge, 
  UnifiedInput, 
  Skeleton,
  Textarea,
  Checkbox,
  cn,
  DataGrid,
  KanbanBoard,
  ListView,
  CalendarView,
  ViewSwitcher,
  DataActions,
  DataViewProvider,
  StateRenderer,
  EmptyState,
  ErrorState,
  LoadingState,
  useStateManager
} from '@ghxstship/ui';

// Re-export core components
export {
  Button,
  Card,
  Badge,
  UnifiedInput as Input,
  Skeleton,
  Textarea,
  Checkbox,
  cn,
  DataGrid,
  KanbanBoard,
  ListView,
  CalendarView,
  ViewSwitcher,
  DataActions,
  DataViewProvider,
  StateRenderer,
  EmptyState,
  ErrorState,
  LoadingState,
  useStateManager
};

// Legacy container components
export const Container = ({ children }: { children: React.ReactNode }) => children;
export const Stack = ({ children }: { children: React.ReactNode }) => children;
export const Inline = ({ children }: { children: React.ReactNode }) => children;

// Legacy progress components - simplified non-JSX versions
export const ProgressBar = ({ percentage, ...props }: { percentage?: number; [key: string]: any }) => {
  return React.createElement('div', {
    className: 'w-full bg-muted rounded-full h-2',
    ...props
  }, React.createElement('div', {
    className: 'bg-accent h-2 rounded-full transition-all',
    style: { width: `${Math.min(100, Math.max(0, percentage || 0))}%` }
  }));
};

export const BudgetUtilizationBar = ({ utilized, total, ...props }: { utilized?: number; total?: number; [key: string]: any }) => {
  const percentage = total && total > 0 ? (utilized || 0) / total * 100 : 0;
  return ProgressBar({ percentage, ...props });
};

export const CompletionBar = ProgressBar;
export const DynamicProgressBar = ProgressBar;

// Design tokens
export const designTokens = {
  colors: {
    status: {
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-red-500',
      info: 'bg-info-500'
    }
  }
};

export const getStatusColor = (status: string) => designTokens.colors.status[status as keyof typeof designTokens.colors.status] || '';
export const getPriorityColor = getStatusColor;

// Component aliases
export const TokenizedCard = Card;
export const PriorityBadge = Badge;
export const StatusBadge = Badge;

// Animation constants
export const animations = {
  duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
  easing: { ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out' },
  cardInteractive: 'hover:shadow-lg transition-shadow'
};
export const animationPresets = animations;
export const combineAnimations = (a: any, b: any) => ({ ...a, ...b });

// Types for backward compatibility
export type LoadingStateProps = { className?: string };
export type ErrorStateProps = { message?: string; className?: string };
