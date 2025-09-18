// DEPRECATED: This shadow UI directory violates single source of truth
// All UI components should be imported directly from @ghxstship/ui
// This file exists only for backward compatibility during migration

import {
  // Core components
  Button,
  Card,
  Badge,
  Input,
  Textarea,
  Select,
  Checkbox,
  Skeleton,
  Progress,
  Loader,
  Alert,
  EmptyState,
  
  // Data views
  DataGrid,
  ViewSwitcher,
  StateManagerProvider,
  
  // Layout
  Container,
  Stack,
  Inline,
  
  // System utilities
  getColor,
  cn,
  DESIGN_TOKENS
} from '@ghxstship/ui';

// Re-export core components
export {
  Button,
  Card,
  Badge,
  Input,
  Textarea,
  Select,
  Checkbox,
  Skeleton,
  DataGrid,
  ViewSwitcher,
  StateManagerProvider,
  Container,
  Stack,
  Inline,
  cn
};

// Legacy aliases for backward compatibility
export const LoadingState = Loader;
export const ErrorState = Alert;
// ProgressBar component with percentage prop support
export const ProgressBar = ({ percentage, ...props }: { percentage?: number; [key: string]: any }) => {
  return Progress({ value: percentage, ...props });
};
// BudgetUtilizationBar component with utilized/total props support
export const BudgetUtilizationBar = ({ utilized, total, ...props }: { utilized?: number; total?: number; [key: string]: any }) => {
  const percentage = total && total > 0 ? (utilized || 0) / total * 100 : 0;
  return Progress({ value: percentage, ...props });
};
// CompletionBar component with percentage prop support
export const CompletionBar = ({ percentage, ...props }: { percentage?: number; [key: string]: any }) => {
  return Progress({ value: percentage, ...props });
};
// DynamicProgressBar component with percentage prop support
export const DynamicProgressBar = ({ percentage, ...props }: { percentage?: number; [key: string]: any }) => {
  return Progress({ value: percentage, ...props });
};

// Design tokens compatibility with legacy structure
export const designTokens = {
  ...DESIGN_TOKENS,
  colors: {
    ...DESIGN_TOKENS,
    status: {
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-destructive',
      info: 'bg-primary'
    }
  }
};
export const getStatusColor = getColor;
export const getPriorityColor = getColor;

// Component aliases
export const TokenizedCard = Card;
export const PriorityBadge = Badge;

// StatusBadge component with status prop support
export const StatusBadge = ({ status, ...props }: { status?: string; [key: string]: any }) => {
  const getVariantFromStatus = (status?: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'paused': return 'outline';
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };
  
  return Badge({ variant: getVariantFromStatus(status), children: status, ...props });
};

// Animation constants - simplified
export const animations = {
  duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
  easing: { ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out' },
  cardInteractive: 'hover:shadow-md transition-shadow'
};
export const animationPresets = animations;
export const combineAnimations = (a: any, b: any) => ({ ...a, ...b });

// Types for backward compatibility
export type LoadingStateProps = { className?: string };
export type ErrorStateProps = { message?: string; className?: string };
