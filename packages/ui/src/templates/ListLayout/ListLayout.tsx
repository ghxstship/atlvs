/**
 * 'ListLayout' Template - Level 4
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ListLayoutProps {
  children: ReactNode;
  className?: string;
}

export const ListLayout: React.FC<ListLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
};
