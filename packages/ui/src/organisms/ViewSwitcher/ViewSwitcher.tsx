/**
 * ViewSwitcher — ATLVS View Type Switcher
 * Allows switching between different data view types
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { 
  Table, 
  LayoutGrid, 
  List, 
  Columns, 
  Calendar, 
  Image, 
  Clock, 
  BarChart3, 
  GanttChart, 
  FileEdit 
} from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Dropdown } from '../../molecules/Dropdown/Dropdown';
import type { ViewType } from '../DataViewProvider/DataViewProvider';

export interface ViewSwitcherProps {
  currentView: ViewType;
  availableViews?: ViewType[];
  onViewChange: (view: ViewType) => void;
  compact?: boolean;
  className?: string;
}

const viewConfig: Record<ViewType, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  table: { label: 'Table', icon: Table, description: 'Spreadsheet-style data grid' },
  card: { label: 'Cards', icon: LayoutGrid, description: 'Card-based layout' },
  list: { label: 'List', icon: List, description: 'Compact list view' },
  kanban: { label: 'Kanban', icon: Columns, description: 'Board with columns' },
  calendar: { label: 'Calendar', icon: Calendar, description: 'Calendar timeline' },
  gallery: { label: 'Gallery', icon: Image, description: 'Image/media grid' },
  timeline: { label: 'Timeline', icon: Clock, description: 'Chronological timeline' },
  chart: { label: 'Charts', icon: BarChart3, description: 'Data visualizations' },
  gantt: { label: 'Gantt', icon: GanttChart, description: 'Project timeline' },
  form: { label: 'Form', icon: FileEdit, description: 'Form-based editing' },
};

export function ViewSwitcher({
  currentView,
  availableViews = ['table', 'card', 'list', 'kanban', 'calendar'],
  onViewChange,
  compact = false,
  className = '',
}: ViewSwitcherProps) {
  const currentConfig = viewConfig[currentView];

  if (compact) {
    const items = availableViews.map((view) => ({
      id: view,
      label: viewConfig[view].label,
      onClick: () => onViewChange(view),
    }));

    const IconComponent = currentConfig.icon;

    return (
      <Dropdown
        items={items}
        selected={currentView}
        trigger={
          <Button variant="outline" size="sm">
            <IconComponent className="w-4 h-4 mr-2" />
            {currentConfig.label}
          </Button>
        }
      />
    );
  }

  return (
    <div className={`flex items-center gap-xs p-xs bg-muted rounded-lg ${className}`}>
      {availableViews.map((view) => {
        const config = viewConfig[view];
        const isActive = view === currentView;
        const IconComponent = config.icon;

        return (
          <Button
            key={view}
            variant={isActive ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewChange(view)}
            className={`flex items-center gap-xs ${
              isActive ? 'shadow-sm' : 'hover:bg-background'
            }`}
            title={config.description}
          >
            <IconComponent className="w-4 h-4" />
            <span className="hidden sm:inline">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

// Hook for managing view state with persistence
export function useViewSwitcher(
  initialView: ViewType = 'table',
  storageKey?: string
) {
  const [currentView, setCurrentView] = React.useState<ViewType>(() => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && viewConfig.hasOwnProperty(stored)) {
        return stored as ViewType;
      }
    }
    return initialView;
  });

  const changeView = React.useCallback((view: ViewType) => {
    setCurrentView(view);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, view);
    }
  }, [storageKey]);

  return [currentView, changeView] as const;
}
