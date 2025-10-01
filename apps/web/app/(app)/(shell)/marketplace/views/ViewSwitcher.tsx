import React from 'react';
import { Button } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ghxstship/ui';
import {
  Grid,
  List,
  Kanban,
  Calendar,
  Image,
  Clock,
  BarChart3,
  GitBranch,
  FileText,
  ChevronDown,
  Check
} from 'lucide-react';

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

interface ViewSwitcherProps {
  currentView: ViewType;
  availableViews?: ViewType[];
  onViewChange: (view: ViewType) => void;
  compact?: boolean;
}

const viewConfig = {
  table: { label: 'Table', icon: Grid, description: 'Spreadsheet-style data grid' },
  card: { label: 'Cards', icon: Grid, description: 'Card-based layout' },
  list: { label: 'List', icon: List, description: 'Compact list view' },
  kanban: { label: 'Kanban', icon: Kanban, description: 'Board with columns' },
  calendar: { label: 'Calendar', icon: Calendar, description: 'Calendar timeline' },
  gallery: { label: 'Image', icon: Image, description: 'Image/media grid' },
  timeline: { label: 'Timeline', icon: Clock, description: 'Chronological timeline' },
  chart: { label: 'Charts', icon: BarChart3, description: 'Data visualizations' },
  gantt: { label: 'Gantt', icon: GitBranch, description: 'Project timeline' },
  form: { label: 'Form', icon: FileText, description: 'Form-based editing' },
};

export default function ViewSwitcher({
  currentView,
  availableViews = ['table', 'card', 'list', 'kanban', 'calendar', 'gallery', 'timeline', 'chart', 'gantt', 'form'],
  onViewChange,
  compact = false,
}: ViewSwitcherProps) {
  const currentConfig = viewConfig[currentView];
  const CurrentIcon = currentConfig.icon;

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <CurrentIcon className="h-icon-xs w-icon-xs mr-2" />
            {currentConfig.label}
            <ChevronDown className="h-icon-xs w-icon-xs ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-container-xs">
          {availableViews.map((view) => {
            const config = viewConfig[view];
            const Icon = config.icon;
            const isActive = view === currentView;

            return (
              <DropdownMenuItem
                key={view}
                onClick={() => onViewChange(view)}
                className="flex items-center gap-sm"
              >
                <Icon className="h-icon-xs w-icon-xs" />
                <div className="flex-1">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-muted-foreground">{config.description}</div>
                </div>
                {isActive && <Check className="h-icon-xs w-icon-xs text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-xs p-xs bg-muted rounded-lg">
      {availableViews.map((view) => {
        const config = viewConfig[view];
        const Icon = config.icon;
        const isActive = view === currentView;

        return (
          <Button
            key={view}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange(view)}
            className={`flex items-center gap-xs ${
              isActive ? 'shadow-sm' : 'hover:bg-background'
            }`}
            title={config.description}
          >
            <Icon className="h-icon-xs w-icon-xs" />
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

// Helper function to get view component
export function getViewComponent(viewType: ViewType) {
  switch (viewType) {
    case 'table':
      return React.lazy(() => import('./TableView'));
    case 'card':
      return React.lazy(() => import('./CardView'));
    case 'list':
      return React.lazy(() => import('./ListView'));
    case 'kanban':
      return React.lazy(() => import('./KanbanView'));
    case 'calendar':
      return React.lazy(() => import('./CalendarView'));
    case 'gallery':
      return React.lazy(() => import('./ImageView'));
    case 'timeline':
      return React.lazy(() => import('./TimelineView'));
    case 'chart':
      return React.lazy(() => import('./ChartView'));
    case 'gantt':
      return React.lazy(() => import('./GanttView'));
    case 'form':
      return React.lazy(() => import('./FormView'));
    default:
      return React.lazy(() => import('./TableView'));
  }
}
