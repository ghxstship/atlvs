import React from 'react';
import { cn } from '../../lib/utils';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  backgroundImage?: string;
  className?: string;
}

/**
 * AuthLayout Template
 * Centered layout for authentication pages (login, signup, etc.)
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  logo,
  backgroundImage,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center bg-background',
        className
      )}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="w-full max-w-md space-y-lg p-lg">
        {logo && <div className="flex justify-center">{logo}</div>}
        {title && (
          <h1 className="text-center text-3xl font-bold tracking-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-center text-muted-foreground">{subtitle}</p>
        )}
        <div className="rounded-lg border border-border bg-card p-lg shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

AuthLayout.displayName = 'AuthLayout';
