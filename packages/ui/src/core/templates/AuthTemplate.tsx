'use client';

import React from 'react';
import { Button } from '../../unified/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../unified/Card';
import { cn } from '../../lib/utils';

interface AuthTemplateProps {
  /** Main title */
  title: string;

  /** Subtitle or description */
  description?: string;

  /** Main form content */
  children: React.ReactNode;

  /** Footer content (links, etc.) */
  footer?: React.ReactNode;

  /** Brand/logo content */
  brand?: React.ReactNode;

  /** Background pattern or image */
  background?: React.ReactNode;

  /** Custom className */
  className?: string;

  /** Maximum width of the form card */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';

  /** Show loading state */
  loading?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  title,
  description,
  children,
  footer,
  brand,
  background,
  className,
  maxWidth = 'md',
  loading = false,
}) => {
  return (
    <div className={cn('min-h-screen flex', className)}>
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {background || (
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
        )}
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-md">
        <div className="w-full max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Brand/Left Side */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              {brand || (
                <div className="space-y-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-icon-xl h-icon-xl bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-xl">G</span>
                    </div>
                    <span className="text-2xl font-bold text-foreground">GHXSTSHIP</span>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                      Welcome to the future of production management
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      Transform your creative workflow with enterprise-grade tools designed for modern teams.
                    </p>
                  </div>
                </div>
              )}

              {/* Feature highlights */}
              <div className="grid gap-md">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-foreground">Advanced project management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-foreground">Real-time collaboration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-foreground">Enterprise security</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form/Right Side */}
          <div className="w-full flex flex-col justify-center">
            <Card className={cn('w-full', maxWidthClasses[maxWidth])}>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className="text-muted-foreground">
                    {description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {loading ? (
                  <div className="space-y-md">
                    <div className="h-icon-xl bg-muted animate-pulse rounded" />
                    <div className="h-icon-xl bg-muted animate-pulse rounded" />
                    <div className="h-icon-xl bg-muted animate-pulse rounded" />
                  </div>
                ) : (
                  children
                )}
              </CardContent>
            </Card>

            {/* Footer */}
            {footer && (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}

            {/* Mobile brand */}
            <div className="lg:hidden mt-8 text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-icon-lg h-icon-lg bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">G</span>
                </div>
                <span className="text-lg font-bold text-foreground">GHXSTSHIP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
