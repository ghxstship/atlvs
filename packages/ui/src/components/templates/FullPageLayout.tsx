import React from 'react';
import { cn } from '../../lib/utils';

export interface FullPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FullPageLayout Template
 * Full-page layout without any chrome (headers, sidebars, etc.)
 */
export const FullPageLayout: React.FC<FullPageLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('h-screen w-screen overflow-auto', className)}>
      {children}
    </div>
  );
};

FullPageLayout.displayName = 'FullPageLayout';
