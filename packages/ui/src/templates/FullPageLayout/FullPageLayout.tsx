/**
 * 'FullPageLayout' Template - Level 4
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface FullPageLayoutProps {
  children: ReactNode;
  className?: string;
}

export const FullPageLayout: React.FC<FullPageLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
};
