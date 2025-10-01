/**
 * AppShell Template - Level 4
 * Full application shell with sidebar, header, and main content area
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface AppShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  sidebar,
  header,
  className,
}) => {
  return (
    <div className={cn('flex h-screen w-full overflow-hidden', className)}>
      {sidebar && (
        <aside className="flex-shrink-0 w-container-sm border-r bg-background">
          {sidebar}
        </aside>
      )}
      <div className="flex flex-col flex-1 overflow-hidden">
        {header && (
          <header className="flex-shrink-0 border-b bg-background">
            {header}
          </header>
        )}
        <main className="flex-1 overflow-auto p-lg">
          {children}
        </main>
      </div>
    </div>
  );
};
