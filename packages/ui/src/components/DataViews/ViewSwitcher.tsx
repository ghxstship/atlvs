'use client';

import React from 'react';
import { Button } from '../Button';
import { useDataView } from './DataViewProvider';
import { ViewType } from './types';
import { 
  Grid3x3, 
  List, 
  BarChart3, 
  Calendar, 
  Clock, 
  Kanban,
  Map,
  Settings,
  FileText,
  Image
} from 'lucide-react';

const viewIcons: Record<ViewType, React.ComponentType<any>> = {
  grid: Grid3x3,
  kanban: Kanban,
  calendar: Calendar,
  timeline: Clock,
  gallery: Image,
  list: List,
  dashboard: BarChart3,
  form: FileText,
};

const viewLabels: Record<ViewType, string> = {
  grid: 'Grid',
  kanban: 'Kanban',
  calendar: 'Calendar',
  timeline: 'Timeline',
  gallery: 'Gallery',
  list: 'List',
  dashboard: 'Dashboard',
  form: 'Form',
};

interface ViewSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function ViewSwitcher({ 
  className = '',
  size = 'md',
  showLabels = true,
  orientation = 'horizontal'
}: ViewSwitcherProps) {
  const { state, config, actions } = useDataView();
  
  const availableViews = config.availableViews || ['grid', 'kanban', 'calendar', 'timeline', 'gallery', 'list', 'dashboard', 'form'];
  
  const containerClasses = `
    flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg
    ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
    ${className}
  `.trim();

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  return (
    <div className={containerClasses} role="tablist" aria-label="View switcher">
      {availableViews.map((viewType) => {
        const Icon = viewIcons[viewType];
        const isActive = state.type === viewType;
        
        return (
          <Button
            key={viewType}
            variant={isActive ? 'primary' : 'ghost'}
            size={buttonSize}
            onClick={() => actions.setCurrentView(viewType)}
            className={`
              ${showLabels ? 'gap-2' : ''}
              ${orientation === 'vertical' ? 'justify-start' : ''}
              transition-all duration-200
            `}
            role="tab"
            aria-selected={isActive}
            aria-controls={`view-${viewType}`}
            title={viewLabels[viewType]}
          >
            <Icon className="h-4 w-4" />
            {showLabels && (
              <span className={orientation === 'vertical' ? '' : 'hidden sm:inline'}>
                {viewLabels[viewType]}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
