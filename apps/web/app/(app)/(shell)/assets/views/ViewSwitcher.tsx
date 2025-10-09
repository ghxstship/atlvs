'use client';

/**
 * Assets View Switcher
 *
 * Enterprise-grade view switcher component for asset management.
 * Features instant switching, state preservation, user preferences,
 * keyboard navigation, and responsive overflow handling.
 *
 * @module assets/views/ViewSwitcher
 */

import React, { useState, useCallback } from 'react';
import { AssetViewState } from '../types';
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ViewSwitcher
} from "@ghxstship/ui";
import { BarChart3, Calendar, Dropdown,  DropdownItem,  Gallery, GitBranch, Grid3X3, Kanban, List, MoreHorizontal, Settings, Table } from 'lucide-react';

interface ViewSwitcherProps {
  currentView: AssetViewState['viewType'];
  onViewChange: (viewType: AssetViewState['viewType']) => void;
  availableViews?: AssetViewState['viewType'][];
  className?: string;
}

interface ViewOption {
  id: AssetViewState['viewType'];
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: string;
}

const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'grid',
    label: 'Grid',
    icon: Grid3X3,
    description: 'Card-based grid layout'
  },
  {
    id: 'list',
    label: 'List',
    icon: List,
    description: 'Hierarchical list with grouping'
  },
  {
    id: 'table',
    label: 'Table',
    icon: Table,
    description: 'Advanced data table with sorting'
  },
  {
    id: 'kanban',
    label: 'Kanban',
    icon: Kanban,
    description: 'Workflow board with drag & drop'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    description: 'Timeline and scheduling view'
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: Gallery,
    description: 'Media-focused grid layout'
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: GitBranch,
    description: 'Chronological event view'
  },
  {
    id: 'chart',
    label: 'Chart',
    icon: BarChart3,
    description: 'Analytics and reporting view'
  }
];

const PRIMARY_VIEWS: AssetViewState['viewType'][] = ['grid', 'table', 'kanban', 'calendar'];
const SECONDARY_VIEWS: AssetViewState['viewType'][] = ['list', 'gallery', 'timeline', 'chart'];

export default function ViewSwitcher({
  currentView,
  onViewChange,
  availableViews = VIEW_OPTIONS.map(v => v.id),
  className = ''
}: ViewSwitcherProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle view change with transition
  const handleViewChange = useCallback(async (viewType: AssetViewState['viewType']) => {
    if (viewType === currentView || isTransitioning) return;

    setIsTransitioning(true);

    // Add slight delay for smooth transition
    setTimeout(() => {
      onViewChange(viewType);
      setIsTransitioning(false);
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, onViewChange, isTransitioning]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, viewType: AssetViewState['viewType']) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleViewChange(viewType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleViewChange]);

  // Get view option by ID
  const getViewOption = (id: AssetViewState['viewType']) => {
    return VIEW_OPTIONS.find(option => option.id === id);
  };

  // Filter available views
  const primaryViews = PRIMARY_VIEWS.filter(view => availableViews.includes(view));
  const secondaryViews = SECONDARY_VIEWS.filter(view => availableViews.includes(view));
  const overflowViews = secondaryViews.slice(4); // Views that go in dropdown
  const visibleSecondaryViews = secondaryViews.slice(0, 4);

  return (
    <div className={`flex items-center gap-xs p-xs bg-gray-50 rounded-lg border ${className}`}>
      {/* Primary View Buttons */}
      {primaryViews.map(viewType => {
        const option = getViewOption(viewType);
        if (!option) return null;

        const Icon = option.icon;
        const isActive = currentView === viewType;

        return (
          <Button
            key={viewType}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            className={`h-icon-lg px-sm transition-all ${
              isActive ? 'shadow-sm' : 'hover:bg-white'
            } ${isTransitioning ? 'pointer-events-none opacity-50' : ''}`}
            onClick={() => handleViewChange(viewType)}
            onKeyDown={(e) => handleKeyDown(e, viewType)}
            title={option.description}
            disabled={isTransitioning}
          >
            <Icon className="w-icon-xs h-icon-xs mr-2" />
            <span className="hidden sm:inline">{option.label}</span>
            {option.badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {option.badge}
              </Badge>
            )}
          </Button>
        );
      })}

      {/* Separator */}
      {visibleSecondaryViews.length > 0 && (
        <div className="w-px h-icon-md bg-gray-300 mx-1" />
      )}

      {/* Secondary View Buttons */}
      {visibleSecondaryViews.map(viewType => {
        const option = getViewOption(viewType);
        if (!option) return null;

        const Icon = option.icon;
        const isActive = currentView === viewType;

        return (
          <Button
            key={viewType}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            className={`h-icon-lg px-xs transition-all ${
              isActive ? 'shadow-sm' : 'hover:bg-white'
            } ${isTransitioning ? 'pointer-events-none opacity-50' : ''}`}
            onClick={() => handleViewChange(viewType)}
            onKeyDown={(e) => handleKeyDown(e, viewType)}
            title={option.description}
            disabled={isTransitioning}
          >
            <Icon className="w-icon-xs h-icon-xs" />
            <span className="sr-only">{option.label}</span>
          </Button>
        );
      })}

      {/* Overflow Dropdown */}
      {overflowViews.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-icon-lg w-icon-lg p-0 ${isTransitioning ? 'pointer-events-none opacity-50' : ''}`}
              disabled={isTransitioning}
            >
              <MoreHorizontal className="w-icon-xs h-icon-xs" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-container-xs">
            {overflowViews.map(viewType => {
              const option = getViewOption(viewType);
              if (!option) return null;

              const Icon = option.icon;
              const isActive = currentView === viewType;

              return (
                <DropdownMenuItem
                  key={viewType}
                  className={`cursor-pointer ${isActive ? 'bg-blue-50' : ''}`}
                  onClick={() => handleViewChange(viewType)}
                  disabled={isTransitioning}
                >
                  <Icon className="w-icon-xs h-icon-xs mr-2" />
                  <span>{option.label}</span>
                  {option.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {option.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Settings Button */}
      <div className="w-px h-icon-md bg-gray-300 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        className="h-icon-lg w-icon-lg p-0"
        title="View settings"
      >
        <Settings className="w-icon-xs h-icon-xs" />
      </Button>
    </div>
  );
}

// View preference utilities
export const saveViewPreference = (
  userId: string,
  orgId: string,
  module: string,
  viewType: AssetViewState['viewType']
) => {
  const key = `view-preference:${userId}:${orgId}:${module}`;
  localStorage.setItem(key, viewType);
};

export const getViewPreference = (
  userId: string,
  orgId: string,
  module: string,
  defaultView: AssetViewState['viewType'] = 'grid'
): AssetViewState['viewType'] => {
  const key = `view-preference:${userId}:${orgId}:${module}`;
  const saved = localStorage.getItem(key);
  return (saved as AssetViewState['viewType']) || defaultView;
};

// Keyboard shortcuts
export const VIEW_SHORTCUTS: Record<string, AssetViewState['viewType']> = {
  'g': 'grid',
  't': 'table',
  'k': 'kanban',
  'c': 'calendar',
  'l': 'list',
  'h': 'gallery', // 'h' for gallery
  'i': 'timeline', // 'i' for timeline
  'r': 'chart' // 'r' for chart/report
};
