/**
 * Layout System — Unified Export
 * Complete layout components for modern SaaS applications
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

// Types
export type {
  NavigationItem,
  NavigationSection,
  QuickAction,
  NotificationItem,
  UserProfile,
  SidebarState,
  DrawerSide,
  DrawerSize,
  DrawerTab,
  BreadcrumbItem,
  LayoutConfig,
} from './types';

// AppShell
export { AppShell } from './AppShell/AppShell';
export type { AppShellProps } from './AppShell/AppShell';

// Header
export { Header } from './Header/Header';
export type { HeaderProps } from './Header/Header';

// Sidebar
export { Sidebar } from './Sidebar/Sidebar';
export type { SidebarProps } from './Sidebar/Sidebar';

// Drawer
export { Drawer } from './Drawer/Drawer';
export type { DrawerProps } from './Drawer/Drawer';

// Footer
export { Footer } from './Footer/Footer';
export type { FooterProps } from './Footer/Footer';

// Breadcrumb
export { Breadcrumb } from './Breadcrumb/Breadcrumb';
export type { BreadcrumbProps } from './Breadcrumb/Breadcrumb';

// CommandPalette
export { CommandPalette } from './CommandPalette/CommandPalette';
export type { CommandPaletteProps, CommandItem } from './CommandPalette/CommandPalette';

// WorkspaceSwitcher
export { WorkspaceSwitcher } from './WorkspaceSwitcher/WorkspaceSwitcher';
export type { WorkspaceSwitcherProps, Workspace } from './WorkspaceSwitcher/WorkspaceSwitcher';

// Layout Primitives
export { Stack } from './Stack';
export type { StackProps } from './Stack';

export { HStack } from './HStack';
export type { HStackProps } from './HStack';

export { Grid } from './Grid';
export type { GridProps } from './Grid';
