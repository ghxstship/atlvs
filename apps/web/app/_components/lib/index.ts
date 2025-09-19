// Centralized utility exports for marketing pages
// This file optimizes imports and provides consistent access to shared utilities

// Typography system
export { typography, anton, TypographyClasses } from './typography';

// Layout utilities
export { layouts } from './layouts';

// Spacing system
export { spacing, layouts as spacingLayouts } from './spacing';

// Accessibility utilities
export { accessibility, a11yValidation } from './accessibility';

// Performance utilities
export { performance, performanceMonitoring } from './performance';

// Re-export commonly used external utilities
export { cn } from '@ghxstship/ui';
