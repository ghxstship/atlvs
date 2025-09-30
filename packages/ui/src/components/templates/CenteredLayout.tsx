import React from 'react';
import { cn } from '../../lib/utils';

export interface CenteredLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

/**
 * CenteredLayout Template
 * Centered content layout with max-width constraint
 */
export const CenteredLayout: React.FC<CenteredLayoutProps> = ({
  children,
  maxWidth = '1200px',
  className,
}) => {
  return (
    <div className={cn('flex min-h-screen items-center justify-center p-md', className)}>
      <div className="w-full" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
};

CenteredLayout.displayName = 'CenteredLayout';
