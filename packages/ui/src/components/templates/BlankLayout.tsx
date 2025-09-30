import React from 'react';
import { cn } from '../../lib/utils';

export interface BlankLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BlankLayout Template
 * Minimal blank layout with just padding
 */
export const BlankLayout: React.FC<BlankLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('h-full p-md', className)}>
      {children}
    </div>
  );
};

BlankLayout.displayName = 'BlankLayout';
