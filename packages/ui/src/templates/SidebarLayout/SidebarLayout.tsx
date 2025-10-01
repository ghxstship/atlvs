/**
 * 'SidebarLayout' Template - Level 4
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface SidebarLayoutProps {
  children: ReactNode;
  className?: string;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
};
