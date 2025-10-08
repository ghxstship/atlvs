/**
 * Layout Types — Type Definitions for Layout System
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Navigation Item
 * Used for sidebar and header navigation
 */
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
  onClick?: () => void;
}

/**
 * Navigation Section
 * Group of navigation items
 */
export interface NavigationSection {
  id: string;
  label?: string;
  items: NavigationItem[];
}

/**
 * Quick Action
 * Action button in header
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  badge?: string | number;
  disabled?: boolean;
}

/**
 * Notification Item
 */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * User Profile
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  organization?: string;
}

/**
 * Sidebar State
 */
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

/**
 * Drawer Side
 */
export type DrawerSide = 'left' | 'right';

/**
 * Drawer Size
 */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Drawer Tab
 */
export interface DrawerTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
  disabled?: boolean;
}

/**
 * Breadcrumb Item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

/**
 * Layout Configuration
 */
export interface LayoutConfig {
  /** Show header */
  showHeader?: boolean;
  
  /** Show sidebar */
  showSidebar?: boolean;
  
  /** Show footer */
  showFooter?: boolean;
  
  /** Initial sidebar state */
  initialSidebarState?: SidebarState;
  
  /** Allow sidebar collapse */
  allowSidebarCollapse?: boolean;
  
  /** Sticky header */
  stickyHeader?: boolean;
  
  /** Sticky sidebar */
  stickySidebar?: boolean;
}
