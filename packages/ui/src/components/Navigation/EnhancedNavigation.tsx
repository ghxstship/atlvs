'use client';

import React, { useEffect } from 'react';
import { SidebarNavigation } from '../Sidebar/SidebarNavigation';
import { NavigationCacheProvider, useNavigationCache } from './NavigationCache';
import { NavigationAnnouncer } from './NavigationAccessibility';
import { NavigationMetrics } from './NavigationMetrics';
import { useNavigationAI } from './NavigationAI';

interface EnhancedNavigationProps {
  items?: any[];
  className?: string;
  defaultCollapsed?: boolean;
  variant?: 'default' | 'floating' | 'overlay';
  onNavigate?: (href: string) => void;
  initialPinnedIds?: string[];
  onSearchChange?: (query: string, resultsCount: number) => void;
  onToggleExpand?: (itemId: string, expanded: boolean) => void;
  onTogglePin?: (itemId: string, pinned: boolean) => void;
}

const NavigationWithAI: React.FC<EnhancedNavigationProps> = (props: any) => {
  const { predictions } = useNavigationAI();
  const { prefetchRoutes } = useNavigationCache();

  // Prefetch predicted routes for better performance
  useEffect(() => {
    const routesToPrefetch = predictions.map(p => p.path);
    if (routesToPrefetch.length > 0) {
      prefetchRoutes(routesToPrefetch);
    }
  }, [predictions, prefetchRoutes]);

  return (
    <>
      <NavigationAnnouncer />
      <SidebarNavigation {...props} />
      <NavigationMetrics />
    </>
  );
};

export const EnhancedNavigation: React.FC<EnhancedNavigationProps> = (props: any) => {
  return (
    <NavigationCacheProvider>
      <NavigationWithAI {...props} />
    </NavigationCacheProvider>
  );
};

export default EnhancedNavigation;
