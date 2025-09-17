// Reusable UI Components for Protected Routes
// These components enforce consistent styling and behavior across all modules

// Export all UI components for easy importing
export { LoadingState } from './LoadingState';
export { ErrorState } from './ErrorState';
export { ProgressBar } from './ProgressBar';
export { ChartBar } from './ChartBar';
export { DynamicProgressBar, BudgetUtilizationBar, CompletionBar } from './DynamicProgressBar';
export { animations, animationPresets, combineAnimations } from './AnimationConstants';
export { 
  designTokens, 
  getStatusColor, 
  getPriorityColor, 
  TokenizedCard, 
  StatusBadge, 
  PriorityBadge 
} from './DesignTokens';

// Type exports for component props
export type { LoadingStateProps } from './LoadingState';
export type { ErrorStateProps } from './ErrorState';

// Re-export common UI components from @ghxstship/ui
export {
  Button,
  Card,
  Badge,
  Input,
  Textarea,
  Select,
  Checkbox,
  Skeleton,
  Drawer,
  DataGrid,
  ViewSwitcher,
  StateManagerProvider
} from '@ghxstship/ui';
