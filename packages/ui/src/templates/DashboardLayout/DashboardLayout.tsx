/**
 * DashboardLayout Template - Level 4
 * Grid layout for dashboard widgets
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface DashboardLayoutProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  columns = 3,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid gap-6',
        {
          'grid-cols-1': columns === 1,
          'grid-cols-1 md:grid-cols-2': columns === 2,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4,
        },
        className
      )}
    >
      {children}
    </div>
  );
};
