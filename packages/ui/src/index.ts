/**
 * @ghxstship/ui — Complete UI Component Library
 * Production-grade components following Apple HIG 2030
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

// ========================================
// CORE SYSTEM
// ========================================

// Design Tokens & Theme
export * from './core/tokens';
// Theme exports - ThemeMode conflict resolved by using the theme version
export {
  ThemeProvider,
  useTheme as useThemeContext,
  withTheme,
  type ThemeProviderProps,
  type ThemeMode,
  type BrandTier,
  type BrandColors,
  type ThemeConfig,
  type ThemeContextValue,
  type ThemePreset,
  type CSSVariableMap,
  type ThemeChangeEvent,
  themePresets,
  defaultBrandColors,
  enterpriseBrandColors,
  creativeBrandColors,
  partnerBrandColors,
  getThemePreset,
  getBrandColorsByTier,
  listThemePresets,
  getPresetsByTier,
  getSystemTheme,
  resolveThemeMode,
  generateCSSVariables,
  applyCSSVariables,
  applyThemeClass,
  getStoredTheme,
  saveThemeToStorage,
  watchSystemTheme,
  enableThemeTransitions,
  disableThemeTransitions,
  prefersHighContrast,
  getOptimalTheme,
  isValidThemeMode,
  generateThemeMetaTags,
  applyThemeMetaTags,
} from './core/theme';

// ========================================
// LAYOUT SYSTEM
// ========================================

export * from './layout';

// ========================================
// DATA VIEWS
// ========================================

// Export views with canonical types (ViewType, FieldConfig, etc.)
export * from './views';

// ========================================
// ATOMIC COMPONENTS
// ========================================

// Atoms - Single-purpose components
export * from './atoms';

// Molecules - Composite components
export * from './molecules';

// Organisms - Complex components (excluding conflicting types from views)
export {
  DataTable,
  Form,
  Navigation,
  Timeline,
  SearchBar,
  FileManager,
  TreeView,
  Stepper,
  NotificationCenter,
  CodeBlock,
  ImageGallery,
  Stats,
  DashboardWidget,
  BoardView,
  DataViewProvider,
  useDataView,
  ViewSwitcher,
  useViewSwitcher,
  DataActions,
} from './organisms';
// Note: ViewType, FieldConfig, FilterConfig, SortConfig from views/types.ts (canonical)
// Note: DashboardWidget component from organisms (not type from views)
export type {
  DataTableProps,
  Column,
  FormProps,
  FormField,
  NavigationProps,
  NavItem,
  TimelineProps,
  TimelineItem,
  SearchBarProps,
  SearchResult,
  FileManagerProps,
  FileItem,
  TreeViewProps,
  TreeNode,
  StepperProps,
  Step,
  NotificationCenterProps,
  Notification,
  CodeBlockProps,
  ImageGalleryProps,
  GalleryImage,
  StatsProps,
  Stat,
  DashboardWidgetProps,
  BoardViewProps,
  Task,
  DataViewProviderProps,
  DataViewConfig,
  DataViewContextValue,
  ViewSwitcherProps,
  DataActionsProps,
} from './organisms';

// Templates - Page templates
export * from './templates';

// ========================================
// UTILITIES & HOOKS
// ========================================

// Utilities
export * from './utils';

// Hooks
export * from './hooks';

// Patterns - Reusable patterns
// export * from './patterns';

// ========================================
// LEGACY EXPORTS (Backward Compatibility)
// ========================================

// Export design system tokens and providers directly from source
export {
  DESIGN_TOKENS,
  SEMANTIC_TOKENS,
  getToken,
  generateCSSVariables as generateUnifiedCSSVariables,
} from './tokens/unified-design-tokens';

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

export {
  AccessibilityProvider,
  useAccessibility,
  useFocusManagement,
  useAnnouncements,
  useKeyboardNavigation,
  useLiveRegion,
} from './accessibility/AccessibilityProvider';

export { cn } from './lib/utils';

// ========================================
// PROVIDERS
// ========================================

export { StateManagerProvider } from './providers/StateManagerProvider';
export { AdaptiveThemeProvider } from './providers/AdaptiveThemeProvider';
export { GHXSTSHIPProvider } from './providers/GHXSTSHIPProvider';
export type { GHXSTSHIPProviderProps } from './providers/GHXSTSHIPProvider';

// ========================================
// COMPONENT ALIASES (Backward Compatibility)
// ========================================

// Drawer alias for AppDrawer
export { Drawer as AppDrawer } from './layout/Drawer/Drawer';

// Select sub-components (compatibility layer)
// These are aliases for the native Select - apps should use the simple Select
export { Select as SelectTrigger } from './atoms/Select/Select';
export { Select as SelectContent } from './atoms/Select/Select';
export { Select as SelectItem } from './atoms/Select/Select';
export { Select as SelectValue } from './atoms/Select/Select';

// GridView alias for DataGrid
export { GridView as DataGrid } from './views/GridView/GridView';

// KanbanView alias for KanbanBoard  
export { KanbanView as KanbanBoard } from './views/KanbanView/KanbanView';

// Note: All components are already exported via the atomic structure above
// (atoms/molecules/organisms exports include all UI components)
// All hooks are already exported via './hooks' export above
