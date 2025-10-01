/**
 * 'DetailLayout' Template - Level 4
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface DetailLayoutProps {
  children: ReactNode;
  className?: string;
}

export const DetailLayout: React.FC<DetailLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
};
