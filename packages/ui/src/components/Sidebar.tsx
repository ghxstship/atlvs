'use client';

import * as React from 'react';
import { 
  SidebarNavigation, 
  SidebarProvider, 
  SidebarPersonalization,
  AnimationOptimizer,
  SidebarLandmarks
} from './Sidebar/index';
import { 
  Home, Users, Briefcase, Code, Layers, ShoppingCart, 
  Building, DollarSign, BarChart3, BookOpen, Settings, User 
} from 'lucide-react';

// Icon mapping for navigation items
const iconMap: Record<string, React.ComponentType<any>> = {
  'Dashboard': Home,
  'Projects': Briefcase,
  'People': Users,
  'Programming': Code,
  'Pipeline': Layers,
  'Procurement': ShoppingCart,
  'Jobs': Briefcase,
  'Companies': Building,
  'Finance': DollarSign,
  'Analytics': BarChart3,
  'Resources': BookOpen,
  'Settings': Settings,
  'Profile': User,
  'Marketplace': ShoppingCart,
  'Company': Building,
};

// Convert navSections (layout.tsx) format to NavigationItem[]
const convertNavSections = (
  navSections: { label: string; items: { label: string; href: string }[] }[]
) => {
  return navSections.map((section: any) => {
    const id = section.label.toLowerCase().replace(/\s+/g, '-');
    const topLevelIcon = iconMap[section.label] || BookOpen;
    const children = section.items.map((it: any) => ({
      id: `${id}-${it.label.toLowerCase().replace(/\s+/g, '-')}`,
      label: it.label,
      href: it.href,
    }));

    // Prefer Overview as top-level href if present
    const overview = section.items.find((i: any) => i.label.toLowerCase() === 'overview');

    return {
      id,
      label: section.label,
      icon: topLevelIcon,
      href: overview?.href,
      children,
    };
  });
};

export function Sidebar({
  title,
  subtitle = 'Command Center',
  navSections,
  onNavigate,
  onSearchChange,
  onToggleExpand,
  onTogglePin,
  initialPinnedIds,
  userId,
  productSwitcher,
  topActions,
  insights,
  footerContent,
  userSummary,
  variant = 'default',
  showPersonalization = true,
}: {
  title: string;
  subtitle?: string;
  navSections: { label: string; items: { label: string; href: string }[] }[];
  onNavigate?: (href: string) => void;
  onSearchChange?: (query: string, resultsCount: number) => void;
  onToggleExpand?: (itemId: string, expanded: boolean) => void;
  onTogglePin?: (itemId: string, pinned: boolean) => void;
  initialPinnedIds?: string[];
  userId?: string;
  productSwitcher?: React.ReactNode;
  topActions?: React.ReactNode;
  insights?: React.ReactNode;
  footerContent?: React.ReactNode;
  userSummary?: React.ReactNode;
  variant?: 'default' | 'floating' | 'overlay';
  showPersonalization?: boolean;
}) {
  const navigationData = convertNavSections(navSections);
  
  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.assign(href);
    }
  };

  return (
    <AnimationOptimizer>
      <SidebarProvider userId={userId ?? 'current-user'}>
        <SidebarLandmarks>
          <div className="flex flex-col h-full" role="navigation" aria-label="Primary">
            {/* Main Sidebar Navigation */}
            <SidebarNavigation
              title={title}
              subtitle={subtitle}
              variant={variant}
              productSwitcher={productSwitcher}
              topActions={topActions}
              onNavigate={handleNavigate}
              items={navigationData}
              onSearchChange={onSearchChange}
              onToggleExpand={onToggleExpand}
              onTogglePin={onTogglePin}
              initialPinnedIds={initialPinnedIds}
              insights={insights ?? (showPersonalization && userId ? (
                <SidebarPersonalization userId={userId} navigationData={navigationData} />
              ) : undefined)}
              footerContent={footerContent}
              userSummary={userSummary}
            />
          </div>
        </SidebarLandmarks>
      </SidebarProvider>
    </AnimationOptimizer>
  );
}
