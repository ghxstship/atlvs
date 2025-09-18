// 2026 Sidebar Navigation System - Complete Export
// Advanced expand/collapse, responsive design, AI personalization

export { SidebarNavigation } from './SidebarNavigation';
export { SidebarProvider, useSidebar } from './SidebarProvider';
export { SidebarBreadcrumbs } from './SidebarBreadcrumbs';
export { 
  sidebarAnimations,
  AnimatedSidebar,
  AnimatedNavItem,
  AnimatedChildren,
  AnimatedBadge,
  AnimatedPin,
  AnimatedTooltip,
  useReducedMotion,
  useAnimationState,
  AnimationOptimizer
} from './SidebarAnimations';
export {
  SidebarAccessibility,
  AccessibleNavItem,
  SkipNavigation,
  SidebarLandmarks
} from './SidebarAccessibility';
export {
  SidebarPersonalization,
  useSmartReordering,
  useAdaptiveShortcuts
} from './SidebarPersonalization';

// Types
export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  badge?: string | number;
  children?: NavigationItem[];
  isPinned?: boolean;
  isFrequent?: boolean;
  lastAccessed?: Date;
}

export interface SidebarPreferences {
  isCollapsed: boolean;
  pinnedItems: string[];
  frequentItems: string[];
  recentItems: string[];
  searchHistory: string[];
  customOrder: string[];
  adaptiveMode: boolean;
}

export interface PersonalizationInsight {
  type: 'frequent' | 'trending' | 'suggested' | 'time-based';
  itemId: string;
  confidence: number;
  reason: string;
  action: 'promote' | 'suggest' | 'reorder' | 'highlight';
}
