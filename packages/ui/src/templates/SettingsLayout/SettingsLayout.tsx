'use client';

import { ReactNode } from 'react';

export interface SettingsSection {
  id: string;
  title: string;
  icon?: ReactNode;
}

export interface SettingsLayoutProps {
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  children: ReactNode;
  className?: string;
}

export function SettingsLayout({
  sections,
  activeSection,
  onSectionChange,
  children,
  className = '',
}: SettingsLayoutProps) {
  return (
    <div className={`flex gap-6 ${className}`}>
      <aside className="w-64 flex-shrink-0">
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {section.icon}
              {section.title}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
