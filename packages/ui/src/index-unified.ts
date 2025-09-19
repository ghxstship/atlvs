/**
 * GHXSTSHIP Unified Design System
 * Enterprise-Grade UI Component Library
 * 
 * This is the main entry point for the refactored design system.
 * All components, tokens, and utilities are exported from here.
 */

// ==========================================
// DESIGN TOKENS
// ==========================================

export {
  DESIGN_TOKENS,
  SEMANTIC_TOKENS,
  getToken,
  generateCSSVariables,
} from './tokens/unified-design-tokens';

export type {
  DesignTokens,
  SemanticTokens,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
} from './tokens/unified-design-tokens';

// ==========================================
// PROVIDERS
// ==========================================

export {
  UnifiedThemeProvider,
  useTheme,
  useDesignTokens,
  useReducedMotion,
  useResponsive,
  getCSSVariable,
  setCSSVariable,
  createThemeClasses,
} from './providers/UnifiedThemeProvider';

export type {
  Theme,
  Brand,
  ThemeConfig,
  ThemeContextValue,
  UnifiedThemeProviderProps,
} from './providers/UnifiedThemeProvider';

export {
  AccessibilityProvider,
  useAccessibility,
  useFocusManagement,
  useAnnouncements,
  useKeyboardNavigation,
  useLiveRegion,
} from './accessibility/AccessibilityProvider';

export type {
  AccessibilityConfig,
  AccessibilityContextValue,
  AccessibilityProviderProps,
} from './accessibility/AccessibilityProvider';

// ==========================================
// ATOMIC COMPONENTS
// ==========================================

export {
  Button,
  ButtonGroup,
  buttonVariants,
} from './components/atomic/Button';

export type {
  ButtonProps,
} from './components/atomic/Button';

export {
  Input as UnifiedInput,
  InputGroup,
  SearchInput,
  PasswordInput,
  inputVariants,
} from './components/atomic/Input';

export type {
  InputProps as UnifiedInputProps,
} from './components/atomic/Input';

// ==========================================
// LEGACY COMPONENTS (Backward Compatibility)
// ==========================================

// Legacy components have been removed - use atomic components instead
// For backward compatibility, atomic components are exported with legacy names
export { Input as LegacyInput } from './components/atomic/Input';

// Export Card and Badge components (these still exist)
export { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from './components/Card';
export { Badge } from './components/Badge';

// ==========================================
// DATA VIEWS COMPONENTS
// ==========================================

export {
  DataGrid,
  KanbanBoard,
  ListView,
  CalendarView,
  TimelineView,
  GalleryView,
  DashboardView,
  FormView,
  UniversalDrawer,
  ViewSwitcher,
  DataActions,
  DataViewProvider,
  useDataView,
  PivotTableView,
  MapView,
  WhiteboardView,
  VirtualizedGrid,
  useStateManager,
  StateRenderer,
  EmptyState,
  ErrorState,
  LoadingState
} from './components/DataViews';

// ==========================================
// ATOMIC COMPONENTS (Additional)
// ==========================================

export { Skeleton } from './components/atomic/Skeleton';
export { Textarea } from './components/atomic/Textarea';
export { Checkbox } from './components/atomic/Checkbox';

// ==========================================
// TYPES
// ==========================================

export type {
  DataRecord,
  FieldConfig,
  ViewType,
  ViewProps,
  FilterConfig,
  SortConfig,
  GroupConfig,
  ViewState,
  KanbanColumn,
  KanbanCard,
  CalendarEvent,
  TimelineItem,
  GalleryItem,
  ListGroup,
  SavedView,
  DashboardWidget,
  DashboardLayout,
  FormSection,
  FormValidation,
  ExportConfig,
  ImportConfig
} from './components/DataViews/types';

// ==========================================
// UTILITIES
// ==========================================

export { cn } from './lib/utils';

// ==========================================
// STYLES
// ==========================================

// CSS is automatically imported when using the components
// Users can also import './styles/unified-design-system.css' directly

// ==========================================
// COMPOUND PROVIDER
// ==========================================

/**
 * All-in-one provider that includes theme and accessibility
 */
import React from 'react';
import { UnifiedThemeProvider, UnifiedThemeProviderProps } from './providers/UnifiedThemeProvider';
import { AccessibilityProvider, AccessibilityProviderProps } from './accessibility/AccessibilityProvider';

export interface GHXSTSHIPProviderProps {
  children: React.ReactNode;
  theme?: Omit<UnifiedThemeProviderProps, 'children'>;
  accessibility?: Omit<AccessibilityProviderProps, 'children'>;
}

export function GHXSTSHIPProvider({
  children,
  theme = {},
  accessibility = {},
}: GHXSTSHIPProviderProps) {
  return React.createElement(
    UnifiedThemeProvider,
    { ...theme, children: React.createElement(
      AccessibilityProvider,
      { ...accessibility, children }
    )}
  );
}
