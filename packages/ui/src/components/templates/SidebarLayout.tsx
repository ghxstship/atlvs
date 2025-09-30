import React from 'react';
import { cn } from '../../lib/utils';

export interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string;
  className?: string;
}

/**
 * SidebarLayout Template
 * Layout with sidebar on left or right
 */
export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = '256px',
  className,
}) => {
  return (
    <div className={cn('flex h-full', className)}>
      {sidebarPosition === 'left' && (
        <aside
          className="border-r border-border bg-background overflow-auto"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </aside>
      )}
      <main className="flex-1 overflow-auto p-md">
        {children}
      </main>
      {sidebarPosition === 'right' && (
        <aside
          className="border-l border-border bg-background overflow-auto"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </aside>
      )}
    </div>
  );
};

SidebarLayout.displayName = 'SidebarLayout';
