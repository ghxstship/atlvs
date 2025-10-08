/**
 * SettingsLayout — Settings Page Template
 * Standard layout for settings pages with sidebar navigation
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

import React, { ReactNode } from 'react';
import { Card, CardContent } from '../../molecules/Card/Card';

export interface SettingsSection {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
}

export interface SettingsLayoutProps {
  title: string;
  description?: string;
  sections?: SettingsSection[];
  currentSection?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SettingsLayout({
  title,
  description,
  sections = [],
  currentSection,
  children,
  actions,
  className = '',
}: SettingsLayoutProps) {
  return (
    <div className={`container mx-auto p-lg ${className}`}>
      {/* Header */}
      <div className="mb-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-sm">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-sm">{actions}</div>}
        </div>
      </div>

      {/* Layout */}
      <div className="grid gap-lg lg:grid-cols-[240px_1fr]">
        {/* Sidebar Navigation */}
        {sections.length > 0 && (
          <aside className="space-y-xs">
            <nav className="flex flex-col gap-xs">
              {sections.map((section) => {
                const isActive = section.id === currentSection;
                return (
                  <a
                    key={section.id}
                    href={section.href || `#${section.id}`}
                    className={`
                      flex items-center gap-sm px-md py-sm rounded-lg
                      transition-colors
                      ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }
                    `}
                  >
                    {section.icon && <span className="text-lg">{section.icon}</span>}
                    <span className="font-medium">{section.label}</span>
                  </a>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main>
          <Card>
            <CardContent className="p-lg">
              {children}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

// Convenience component for settings sections
export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className = '',
}: SettingsSectionProps) {
  return (
    <div className={`space-y-md ${className}`}>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-xs">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
