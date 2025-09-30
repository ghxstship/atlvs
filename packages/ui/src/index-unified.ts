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
  Input,
  InputGroup,
  SearchInput,
  PasswordInput,
  inputVariants,
} from './components/atomic/Input';

export { Input as UnifiedInput } from './components/atomic/Input';

export type {
  InputProps,
  InputProps as UnifiedInputProps,
} from './components/atomic/Input';

// ==========================================
// LEGACY COMPONENTS (Backward Compatibility)
// ==========================================

// Legacy components have been removed - use atomic components instead
// For backward compatibility, atomic components are exported with legacy names
export { Input as LegacyInput } from './components/atomic/Input';

export { Label } from './components/Label';
export type { LabelProps } from './components/Label';

// Export Card and Badge components (these still exist)
export { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from './components/Card';
export { Badge } from './components/Badge';

export { Separator } from './components/Separator';

// Export Icon and Progress components
export { Icon, IconButton, StatusIcon, IconWithText } from './components/Icon';
export type { IconProps, IconButtonProps, StatusIconProps, IconWithTextProps } from './components/Icon';
export { Progress } from './components/Progress';

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
  StateManagerProvider,
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
export { RadioButton, RadioGroup, radioVariants } from './components/atomic/RadioButton';
export type { RadioButtonProps, RadioGroupProps } from './components/atomic/RadioButton';
export { RangeSlider, sliderVariants } from './components/atomic/RangeSlider';
export type { RangeSliderProps } from './components/atomic/RangeSlider';
export { ColorPicker, colorPickerVariants } from './components/atomic/ColorPicker';
export type { ColorPickerProps } from './components/atomic/ColorPicker';
export { CodeBlock, useSyntaxHighlighting } from './components/CodeBlock';
export type { CodeBlockProps } from './components/CodeBlock';

// ==========================================
// TYPES
// ==========================================

export type {
  DataRecord,
  DataViewConfig,
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
// NAVIGATION VARIANTS
// ==========================================

export {
  headerVariants,
  sidebarVariants,
  navigationItemVariants,
  breadcrumbVariants,
  dropdownVariants,
  searchVariants,
} from './components/Navigation/NavigationVariants';

export type {
  HeaderVariants,
  SidebarVariants,
  NavigationItemVariants,
  BreadcrumbVariants,
  DropdownVariants,
  SearchVariants,
} from './components/Navigation/NavigationVariants';

// ==========================================
// UTILITIES
// ==========================================

export { cn } from './lib/utils';

// ==========================================
// THEME UTILITIES
// ==========================================

export {
  useSyntaxTheme,
  usePrismTheme,
  useHighlightJsTheme,
  useMonacoTheme,
  useShikiTheme,
  useCodeMirrorTheme,
  generateSyntaxHighlightingCSS,
  applySyntaxTheme,
} from './utils/syntax-theme-adapter';

export type {
  SyntaxTheme,
} from './utils/syntax-theme-adapter';

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
