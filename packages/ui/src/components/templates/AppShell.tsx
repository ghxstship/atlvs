import React from 'react';
import { cn } from '../../lib/utils';

export interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * AppShell Template
 * Main application shell with sidebar, header, and footer
 */
export const AppShell: React.FC<AppShellProps> = ({
  children,
  sidebar,
  header,
  footer,
  className,
}) => {
  return (
    <div className={cn('flex h-screen overflow-hidden', className)}>
      {sidebar && (
        <aside className="w-container-sm border-r border-border bg-background">
          {sidebar}
        </aside>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        {header && (
          <header className="border-b border-border bg-background">
            {header}
          </header>
        )}
        <main className="flex-1 overflow-auto p-md">
          {children}
        </main>
        {footer && (
          <footer className="border-t border-border bg-background p-md">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

AppShell.displayName = 'AppShell';
