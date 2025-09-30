/**
 * AuthLayout Template - Level 4
 * Centered card layout for authentication pages
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('flex min-h-screen items-center justify-center bg-background p-4', className)}>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};
