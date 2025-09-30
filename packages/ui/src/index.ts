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

// Templates - Page layouts
export * from './templates';

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

// Legacy component exports (backward compatibility - use atomic exports instead)
// These are now exported via atomic structure above, keeping for compatibility
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from './components/Select';

// Hooks
export { useToast, ToastProvider } from './hooks/useToast';
export type { Toast } from './hooks/useToast';
export { useToastContext } from './organisms/Toast';
