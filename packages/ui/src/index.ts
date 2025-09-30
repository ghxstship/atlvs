/**
 * GHXSTSHIP UI Package - Atomic Design System
 * Enterprise-Grade UI Components organized by atomic design principles
 */

// ========================================
// ATOMIC DESIGN EXPORTS
// ========================================

// Atoms - Single-purpose components
export * from './atoms';

// Molecules - Simple combinations
export * from './molecules';

// Organisms - Complex components
export * from './organisms';

// Templates - Page layouts (when ready)
// export * from './templates';

// Patterns - Reusable patterns
// export * from './patterns';

// ========================================
// LEGACY EXPORTS (Backward Compatibility)
// ========================================

// Export unified design system tokens and providers (NOT atomic components to avoid duplicates)
export {
  DESIGN_TOKENS,
  SEMANTIC_TOKENS,
  getToken,
  generateCSSVariables,
  UnifiedThemeProvider,
  useTheme,
  useDesignTokens,
  useReducedMotion,
  useResponsive,
  getCSSVariable,
  setCSSVariable,
  createThemeClasses,
  AccessibilityProvider,
  useAccessibility,
  useFocusManagement,
  useAnnouncements,
  useKeyboardNavigation,
  useLiveRegion,
} from './index-unified';

// Legacy component exports (will be phased out)
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from './components/Select';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './molecules/Tabs';
export { Drawer } from './components/Drawer';
export { AppDrawer } from './components/AppDrawer';
export { EmptyState } from './organisms/EmptyState';
export { Breadcrumbs } from './molecules/Breadcrumbs';
export { Sidebar } from './components/Sidebar';
export { Avatar } from './atoms/Avatar';
export { EnhancedUniversalDrawer } from './components/EnhancedUniversalDrawer';

// Additional exports
export * from './dropdown-menu';
export * from './alert';
export * from './table';
export * from './switch';

// Hooks
export { useToast, ToastProvider } from './hooks/useToast';
export type { Toast } from './hooks/useToast';
export { useToastContext } from './components/Toast';
