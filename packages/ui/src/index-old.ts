/**
 * GHXSTSHIP UI Package - Unified Design System
 * Enterprise-Grade UI Components and Design Tokens
 */

// Export unified design system (PRIMARY EXPORTS)
export * from './index-unified';

// Export remaining legacy components that exist
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from './components/Select';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/Tabs';
export { Drawer } from './components/Drawer';
export { EmptyState } from './components/EmptyState';
export { Breadcrumbs } from './components/Breadcrumbs';
export { Sidebar } from './components/Sidebar';
export { Avatar } from './components/Avatar';
export { EnhancedUniversalDrawer } from './components/EnhancedUniversalDrawer';

// Export normalized components (pixel-perfect, semantic token compliant)
export { 
  Badge as NormalizedBadge, 
  BadgeGroup, 
  StatusBadge,
  badgeVariants as normalizedBadgeVariants 
} from './components/normalized/Badge';
export { 
  Button as NormalizedButton, 
  ButtonGroup,
  buttonVariants as normalizedButtonVariants 
} from './components/normalized/Button';
export { 
  Card as NormalizedCard,
  CardHeader as NormalizedCardHeader,
  CardContent as NormalizedCardContent,
  CardFooter as NormalizedCardFooter,
  CardTitle as NormalizedCardTitle,
  CardDescription as NormalizedCardDescription,
  MetricCard,
  FeatureCard as NormalizedFeatureCard,
  cardVariants as normalizedCardVariants
} from './components/normalized/Card';
export { 
  Input as NormalizedInput,
  InputGroup,
  inputVariants as normalizedInputVariants 
} from './components/normalized/Input';

// Export new atomic components
export { Tooltip } from './components/Tooltip';
export { Loader } from './components/Loader';
export { Alert, AlertTitle, AlertDescription } from './components/Alert';
export { Progress } from './components/Progress';
export { Toggle } from './components/Toggle';
export { Checkbox } from './components/Checkbox';
export { Label } from './atoms/Label';
export { useToast, Toast, ToastContainer, ToastProvider, useToastContext } from './components/Toast';

// Export typography and icon components
export { Heading, DisplayHeading, H1, H2, H3, SectionHeader } from './components/Heading';
export type { HeadingProps, SectionHeaderProps } from './components/Heading';
export { Icon, IconButton, StatusIcon, IconWithText } from './components/Icon';
export type { IconProps, IconButtonProps, StatusIconProps, IconWithTextProps } from './components/Icon';

// Export new typography components
export { Text, textVariants } from './components/Typography/Text';
export type { TextProps } from './components/Typography/Text';
export { Display, displayVariants } from './components/Typography/Display';
export type { DisplayProps } from './components/Typography/Display';

// Export layout components
export { Stack, stackVariants } from './components/Layout/Stack';
export type { StackProps } from './components/Layout/Stack';
export { Cluster, clusterVariants } from './components/Layout/Cluster';
export type { ClusterProps } from './components/Layout/Cluster';
export { Spacer, spacerVariants } from './components/Layout/Spacer';
export type { SpacerProps } from './components/Layout/Spacer';
export { Divider, dividerVariants } from './components/Layout/Divider';
export type { DividerProps } from './components/Layout/Divider';

// Export comprehensive data view system
export * from './components/DataViews';

// Export 2026 Sidebar Navigation System
export * from './components/Sidebar/SidebarNavigation';
export * from './components/Navigation';
export { headerVariants } from './components/Navigation/NavigationVariants';
export type { HeaderVariants } from './components/Navigation/NavigationVariants';

// Export all system components and utilities (with explicit re-export to resolve DashboardLayout conflict)
export {
  DESIGN_TOKENS, 
  COMPONENT_SIZES, 
  GRID_SYSTEM,
  DesignSystemProvider,
  useDesignSystem,
  createVariants,
  responsive,
  Container,
  Stack as SystemStack,
  Inline,
  LayoutGrid,
  Section,
  Panel,
  LayoutHeader,
  PageLayout,
  DashboardLayout as SystemDashboardLayout,
  DetailLayout,
  ShowOn,
  HideOn,
  useResponsive,
  ComponentSystem,
  buttonVariants,
  inputVariants,
  badgeVariants,
  cardVariants,
  avatarVariants,
  skeletonVariants,
  stateVariants,
  animationVariants,
  responsiveVariants,
  a11yVariants,
  cn,
  getVariantClasses,
  composeVariants,
  withDefaults,
  CompositePatterns,
  createPattern,
  extendPattern,
  responsivePattern,
  ContainerSystem,
  createContainer,
  withContainer,
  layoutPatterns,
  a11yContainerPatterns,
  WorkflowSystem,
  createWorkflow,
  optimizeWorkflow,
  GridSystem,
  SPACING_UNITS,
  SEMANTIC_SPACING,
  GRID_BREAKPOINTS,
  CONTAINER_SIZES,
  Grid,
  Flex,
  createResponsiveGrid,
  createFlexLayout,
  createSpacing,
  EnhancementSystem,
  ANIMATION_TIMINGS,
  ThemeProvider,
  PersonalizationProvider,
  useTheme,
  usePersonalization,
  a11yEnhancements,
  performanceOptimizations,
  GHXSTSHIP_DESIGN_SYSTEM,
  systemUtils,
  themePresets,
  componentPresets,
  validationSchemas,
  performanceMonitor,
  devTools
} from './system'; 

// Export design tokens
export { tokens, getSpacing, getColor, getFontSize, getShadow, getRadius, getDuration, getEasing, getZIndex, generateCSSVariables } from './tokens';
export type { Spacing, Color, Font, FontSize, LineHeight, LetterSpacing, FontWeight, Radius, Shadow, Duration, Easing, ZIndex, BorderWidth, Height, Screen } from './tokens';

// Types
export type { ButtonProps } from './components/Button';
export type { InputProps } from './components/Input';
export type { TextareaProps } from './components/Textarea';
export type { SelectProps } from './components/Select';
export type { BadgeProps } from './components/Badge';
export type { SkeletonProps } from './components/Skeleton';
export type { CardProps } from './components/Card';
