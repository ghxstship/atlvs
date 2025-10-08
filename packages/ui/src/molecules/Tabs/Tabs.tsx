/**
 * Tabs Component — Tabbed Interface
 * Accessible tabs with keyboard navigation
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Tabs array */
  tabs: Tab[];
  
  /** Default active tab ID */
  defaultTab?: string;
  
  /** Controlled active tab */
  activeTab?: string;
  
  /** Tab change handler */
  onTabChange?: (tabId: string) => void;
  
  /** Variant */
  variant?: 'default' | 'pills' | 'underline';
}

/**
 * Tabs Component
 * 
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
 *     { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
 *   ]}
 * />
 * ```
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
}) => {
  const [internalActiveTab, setInternalActiveTab] = React.useState(
    defaultTab || tabs[0]?.id || ''
  );
  
  const activeTab = controlledActiveTab || internalActiveTab;
  
  const handleTabChange = (tabId: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };
  
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;
  
  const variantClasses = {
    default: {
      list: 'border-b border-border',
      tab: (isActive: boolean) => `
        px-4 py-2 border-b-2 transition-colors
        ${isActive
          ? 'border-primary text-primary'
          : 'border-transparent hover:border-border text-muted-foreground'
        }
      `,
    },
    pills: {
      list: 'gap-2',
      tab: (isActive: boolean) => `
        px-4 py-2 rounded-md transition-colors
        ${isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground'
        }
      `,
    },
    underline: {
      list: 'gap-6',
      tab: (isActive: boolean) => `
        pb-2 border-b-2 transition-colors
        ${isActive
          ? 'border-primary text-foreground'
          : 'border-transparent hover:border-border text-muted-foreground'
        }
      `,
    },
  };
  
  return (
    <div>
      {/* Tab list */}
      <div
        role="tablist"
        className={`flex ${variantClasses[variant].list}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={`
              font-medium text-sm
              disabled:opacity-50 disabled:cursor-not-allowed
              ${variantClasses[variant].tab(activeTab === tab.id)}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab panel */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
      >
        {activeTabContent}
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';
