import React from 'react';
import { cn } from '../../lib/utils';

export interface ListLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  pagination?: React.ReactNode;
  className?: string;
}

/**
 * ListLayout Template
 * Layout for list/table pages with filters and pagination
 */
export const ListLayout: React.FC<ListLayoutProps> = ({
  children,
  header,
  filters,
  actions,
  pagination,
  className,
}) => {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {header && (
        <div className="flex items-center justify-between border-b border-border bg-background p-md">
          <div className="flex-1">{header}</div>
          {actions && <div className="flex gap-x-sm">{actions}</div>}
        </div>
      )}
      {filters && (
        <div className="border-b border-border bg-background p-md">
          {filters}
        </div>
      )}
      <main className="flex-1 overflow-auto p-md">
        {children}
      </main>
      {pagination && (
        <div className="border-t border-border bg-background p-md">
          {pagination}
        </div>
      )}
    </div>
  );
};

ListLayout.displayName = 'ListLayout';
