'use client';

import React, { useState, useCallback } from 'react';
import {
  LayoutGrid,
  List,
  KanbanSquare,
  Calendar,
  Image,
  Clock,
  BarChart3,
  GanttChart,
  FormInput,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';

// View Types
export type ViewType =
  | 'table'
  | 'card'
  | 'list'
  | 'kanban'
  | 'calendar'
  | 'gallery'
  | 'timeline'
  | 'chart'
  | 'gantt'
  | 'form';

// View Configuration
export interface ViewConfig {
  type: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  category: 'data' | 'visualization' | 'workflow' | 'form';
  capabilities: string[];
  isDefault?: boolean;
  isPremium?: boolean;
}

export const VIEW_CONFIGS: Record<ViewType, ViewConfig> = {
  table: {
    type: 'table',
    label: 'Table',
    icon: LayoutGrid,
    description: 'Spreadsheet-style data table with sorting and filtering',
    category: 'data',
    capabilities: ['sort', 'filter', 'search', 'export', 'bulk-actions'],
    isDefault: true
  },
  card: {
    type: 'card',
    label: 'Cards',
    icon: LayoutGrid,
    description: 'Card-based layout for visual data browsing',
    category: 'data',
    capabilities: ['filter', 'search', 'export']
  },
  list: {
    type: 'list',
    label: 'List',
    icon: List,
    description: 'Compact list view for quick scanning',
    category: 'data',
    capabilities: ['sort', 'filter', 'search', 'export']
  },
  kanban: {
    type: 'kanban',
    label: 'Kanban',
    icon: KanbanSquare,
    description: 'Kanban board for workflow management',
    category: 'workflow',
    capabilities: ['drag-drop', 'filter', 'search', 'real-time']
  },
  calendar: {
    type: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    description: 'Calendar view for date-based data',
    category: 'visualization',
    capabilities: ['date-filter', 'drag-drop', 'export']
  },
  gallery: {
    type: 'gallery',
    label: 'Image',
    icon: Image,
    description: 'Image gallery with thumbnails and previews',
    category: 'visualization',
    capabilities: ['filter', 'search', 'fullscreen', 'bulk-actions']
  },
  timeline: {
    type: 'timeline',
    label: 'Timeline',
    icon: Clock,
    description: 'Timeline view for chronological data',
    category: 'visualization',
    capabilities: ['date-filter', 'zoom', 'export']
  },
  chart: {
    type: 'chart',
    label: 'Charts',
    icon: BarChart3,
    description: 'Interactive charts and analytics',
    category: 'visualization',
    capabilities: ['interactive', 'export', 'real-time']
  },
  gantt: {
    type: 'gantt',
    label: 'Gantt',
    icon: GanttChart,
    description: 'Gantt chart for project scheduling',
    category: 'workflow',
    capabilities: ['drag-drop', 'dependencies', 'export'],
    isPremium: true
  },
  form: {
    type: 'form',
    label: 'Form',
    icon: FormInput,
    description: 'Form-based data entry and editing',
    category: 'form',
    capabilities: ['validation', 'auto-save', 'templates']
  }
};

// View Switcher Props
export interface ViewSwitcherProps {
  currentView: ViewType;
  availableViews?: ViewType[];
  onViewChange: (view: ViewType) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showDescriptions?: boolean;
  maxVisible?: number;
  disabled?: boolean;
  userPreferences?: {
    defaultView?: ViewType;
    favoriteViews?: ViewType[];
  };
}

// View Switcher Component
export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  availableViews = Object.keys(VIEW_CONFIGS) as ViewType[],
  onViewChange,
  className,
  size = 'md',
  showLabels = true,
  showDescriptions = false,
  maxVisible = 6,
  disabled = false,
  userPreferences
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filter available views
  const filteredViews = availableViews
    .map(type => VIEW_CONFIGS[type])
    .filter(config => config !== undefined);

  // Split into visible and overflow
  const visibleViews = filteredViews.slice(0, maxVisible);
  const overflowViews = filteredViews.slice(maxVisible);

  // Handle view change
  const handleViewChange = useCallback((viewType: ViewType) => {
    onViewChange(viewType);
    setIsOpen(false);
  }, [onViewChange]);

  // Get size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // View Button Component
  const ViewButton: React.FC<{ config: ViewConfig; isActive: boolean }> = ({
    config,
    isActive
  }) => {
    const Icon = config.icon;
    const isFavorite = userPreferences?.favoriteViews?.includes(config.type);

    return (
      <Button
        variant={isActive ? 'default' : 'ghost'}
        size={size === 'sm' ? 'sm' : 'default'}
        onClick={() => handleViewChange(config.type)}
        disabled={disabled}
        className={cn(
          'relative',
          sizeClasses[size],
          isActive && 'shadow-sm',
          isFavorite && 'border-yellow-200 dark:border-yellow-800'
        )}
        title={showDescriptions ? config.description : config.label}
      >
        <Icon className={iconSizeClasses[size]} />
        {isFavorite && (
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full" />
        )}
        {showLabels && (
          <span className="sr-only">{config.label}</span>
        )}
      </Button>
    );
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Visible View Buttons */}
      {visibleViews.map((config) => (
        <ViewButton
          key={config.type}
          config={config}
          isActive={currentView === config.type}
        />
      ))}

      {/* Overflow Menu */}
      {overflowViews.length > 0 && (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'default'}
              disabled={disabled}
              className={cn('relative', sizeClasses[size])}
            >
              <MoreHorizontal className={iconSizeClasses[size]} />
              <span className="sr-only">More views</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {overflowViews.map((config) => {
              const Icon = config.icon;
              const isActive = currentView === config.type;
              const isFavorite = userPreferences?.favoriteViews?.includes(config.type);

              return (
                <DropdownMenuItem
                  key={config.type}
                  onClick={() => handleViewChange(config.type)}
                  className={cn(
                    'flex items-center gap-3',
                    isActive && 'bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{config.label}</span>
                      {config.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          Premium
                        </Badge>
                      )}
                      {isFavorite && (
                        <div className="h-2 w-2 bg-yellow-400 rounded-full" />
                      )}
                    </div>
                    {showDescriptions && config.description && (
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <div className="h-2 w-2 bg-primary rounded-full" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* View Info */}
      {showLabels && (
        <div className="ml-2 text-sm text-muted-foreground">
          {VIEW_CONFIGS[currentView]?.label}
        </div>
      )}
    </div>
  );
};

// View Capabilities Display
export interface ViewCapabilitiesProps {
  viewType: ViewType;
  className?: string;
}

export const ViewCapabilities: React.FC<ViewCapabilitiesProps> = ({
  viewType,
  className
}) => {
  const config = VIEW_CONFIGS[viewType];
  if (!config) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {config.capabilities.map((capability) => (
        <Badge key={capability} variant="outline" className="text-xs">
          {capability.replace('-', ' ')}
        </Badge>
      ))}
    </div>
  );
};

// View Settings Panel
export interface ViewSettingsProps {
  viewType: ViewType;
  settings: Record<string, unknown>;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  className?: string;
}

export const ViewSettings: React.FC<ViewSettingsProps> = ({
  viewType,
  settings,
  onSettingsChange,
  className
}) => {
  const config = VIEW_CONFIGS[viewType];
  if (!config) return null;

  // This would contain view-specific settings controls
  // For now, just show a placeholder
  return (
    <div className={cn('p-4 border rounded-lg', className)}>
      <div className="flex items-center gap-2 mb-4">
        <config.icon className="h-5 w-5" />
        <h3 className="font-medium">{config.label} Settings</h3>
      </div>

      <div className="space-y-4">
        {/* View-specific settings would go here */}
        <div className="text-sm text-muted-foreground">
          Settings for {config.label} view
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSettingsChange(settings)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>
    </div>
  );
};

// Export utilities
export { VIEW_CONFIGS };
export type { ViewType, ViewConfig };
