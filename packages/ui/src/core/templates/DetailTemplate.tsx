'use client';

import React from 'react';
import { Breadcrumb } from '../../layout/Breadcrumb/Breadcrumb';
import { Tabs } from '../../molecules/Tabs/Tabs';
import { Button } from '../../atoms/Button/Button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DetailTemplateProps {
  /** Breadcrumb navigation items */
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;

  /** Main title of the detail page */
  title: string;

  /** Subtitle or description */
  subtitle?: string;

  /** Tab configuration */
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
  }>;

  /** Default active tab */
  defaultTab?: string;

  /** Actions to display in the header */
  actions?: React.ReactNode;

  /** Back navigation */
  backHref?: string;
  onBack?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Custom className */
  className?: string;
}

export const DetailTemplate: React.FC<DetailTemplateProps> = ({
  breadcrumbs,
  title,
  subtitle,
  tabs,
  defaultTab,
  actions,
  backHref,
  onBack,
  loading = false,
  className,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      window.history.back();
    }
  };

  const initialTab = defaultTab ?? tabs[0]?.id ?? '';

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-md py-6">
          {/* Breadcrumbs */}
          <Breadcrumbs
            segments={breadcrumbs.map((crumb) => ({
              label: crumb.label,
              href: crumb.href ?? '#',
            }))}
            className="mb-4"
          />

          {/* Header Content */}
          <div className="flex items-start justify-between gap-md">
            <div className="flex-1 min-w-0">
              {/* Back Button */}
              {(backHref || onBack) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-icon-xs w-icon-xs mr-2" />
                  Back
                </Button>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                <p className="mt-2 text-lg text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-xs flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-md py-8">
        {loading ? (
          <div className="space-y-6">
            <div className="h-icon-lg bg-muted animate-pulse rounded" />
            <div className="h-container-sm bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <Tabs defaultValue={initialTab} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-auto-fit gap-1 mb-8">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  disabled={!!tab.disabled}
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="rounded-lg border bg-card p-lg shadow-sm">
                  {tab.content}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};
