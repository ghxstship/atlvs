import React from 'react';
import { cn } from '../../lib/utils';

export interface DetailLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

/**
 * DetailLayout Template
 * Layout for detail/view pages with header, breadcrumbs, and optional sidebar
 */
export const DetailLayout: React.FC<DetailLayoutProps> = ({
  children,
  header,
  sidebar,
  actions,
  breadcrumbs,
  className,
}) => {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {breadcrumbs && (
        <div className="border-b border-border bg-background p-sm">
          {breadcrumbs}
        </div>
      )}
      {header && (
        <div className="flex items-center justify-between border-b border-border bg-background p-md">
          <div className="flex-1">{header}</div>
          {actions && <div className="flex gap-x-sm">{actions}</div>}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-md">
          {children}
        </main>
        {sidebar && (
          <aside className="w-container-md border-l border-border bg-background p-md overflow-auto">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
};

DetailLayout.displayName = 'DetailLayout';
