/**
 * 'BlankLayout' Template - Level 4
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface BlankLayoutProps {
  children: ReactNode;
  className?: string;
}

export const BlankLayout: React.FC<BlankLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
};
