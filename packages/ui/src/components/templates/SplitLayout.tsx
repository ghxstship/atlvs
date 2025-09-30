import React from 'react';
import { cn } from '../../lib/utils';

export interface SplitLayoutProps {
  children: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  className?: string;
}

/**
 * SplitLayout Template
 * Two-column split layout with configurable widths
 */
export const SplitLayout: React.FC<SplitLayoutProps> = ({
  children,
  left,
  right,
  leftWidth = '50%',
  rightWidth = '50%',
  className,
}) => {
  return (
    <div className={cn('flex h-full', className)}>
      {left && (
        <div
          className="border-r border-border bg-background p-md overflow-auto"
          style={{ width: leftWidth }}
        >
          {left}
        </div>
      )}
      <div className="flex-1 overflow-auto p-md">
        {children}
      </div>
      {right && (
        <div
          className="border-l border-border bg-background p-md overflow-auto"
          style={{ width: rightWidth }}
        >
          {right}
        </div>
      )}
    </div>
  );
};

SplitLayout.displayName = 'SplitLayout';
