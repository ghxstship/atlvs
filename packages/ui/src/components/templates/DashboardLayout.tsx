import React from 'react';
import { cn } from '../../lib/utils';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  widgets?: React.ReactNode;
  className?: string;
}

/**
 * DashboardLayout Template
 * Layout for dashboard pages with optional widgets sidebar
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  header,
  sidebar,
  widgets,
  className,
}) => {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {header && (
        <div className="border-b border-border bg-background p-md">
          {header}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <aside className="w-container-sm border-r border-border bg-background p-md overflow-auto">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-auto p-md">
          {children}
        </main>
        {widgets && (
          <aside className="w-container-md border-l border-border bg-background p-md overflow-auto">
            {widgets}
          </aside>
        )}
      </div>
    </div>
  );
};

DashboardLayout.displayName = 'DashboardLayout';
