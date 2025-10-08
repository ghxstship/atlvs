/**
 * AppShell Component — Complete App Layout Structure
 * Header + Sidebar + Content + Drawer + Footer
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Header, type HeaderProps } from '../Header/Header';
import { Sidebar, type SidebarProps } from '../Sidebar/Sidebar';
import { Footer, type FooterProps } from '../Footer/Footer';
import { Drawer, type DrawerProps } from '../Drawer/Drawer';
import type { LayoutConfig } from '../types';

export interface AppShellProps {
  /** Layout configuration */
  config?: LayoutConfig;
  
  /** Header props */
  header?: Omit<HeaderProps, 'onToggleSidebar'>;
  
  /** Sidebar props */
  sidebar?: SidebarProps;
  
  /** Footer props */
  footer?: FooterProps;
  
  /** Drawer props */
  drawer?: DrawerProps;
  
  /** Main content */
  children: React.ReactNode;
  
  /** Custom className for content area */
  contentClassName?: string;
}

/**
 * AppShell Component
 * Complete layout structure for modern SaaS apps
 * 
 * @example
 * ```tsx
 * <AppShell
 *   header={{
 *     logo: <Logo />,
 *     user: currentUser,
 *     onSearch: handleSearch,
 *   }}
 *   sidebar={{
 *     sections: navigationSections,
 *     header: <WorkspaceSelector />,
 *   }}
 *   footer={{
 *     syncStatus: 'synced',
 *     version: 'v2.0.0',
 *   }}
 * >
 *   <YourContent />
 * </AppShell>
 * ```
 */
export function AppShell({
  config = {},
  header,
  sidebar,
  footer,
  drawer,
  children,
  contentClassName = '',
}: AppShellProps) {
  const [sidebarState, setSidebarState] = React.useState(
    config.initialSidebarState || 'expanded'
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  
  const {
    showHeader = true,
    showSidebar = true,
    showFooter = true,
    stickyHeader = true,
    stickySidebar = true,
  } = config;
  
  const handleToggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      {showSidebar && sidebar && (
        <>
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              {...sidebar}
              initialState={sidebarState}
              onStateChange={setSidebarState}
            />
          </div>
          
          {/* Mobile sidebar */}
          {isMobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-40">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              
              {/* Sidebar */}
              <div className="relative">
                <Sidebar
                  {...sidebar}
                  initialState="expanded"
                  onStateChange={(state) => {
                    if (state === 'hidden') {
                      setIsMobileSidebarOpen(false);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {showHeader && header && (
          <Header
            {...header}
            onToggleSidebar={handleToggleSidebar}
          />
        )}
        
        {/* Content */}
        <main
          className={`
            flex-1 overflow-auto
            ${contentClassName}
          `}
        >
          {children}
        </main>
        
        {/* Footer */}
        {showFooter && footer && (
          <Footer {...footer} />
        )}
      </div>
      
      {/* Drawer */}
      {drawer && drawer.open && (
        <Drawer {...drawer} />
      )}
    </div>
  );
}

AppShell.displayName = 'AppShell';
