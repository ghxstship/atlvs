/**
 * Procurement View Switcher Component
 * View type switcher for procurement entities
 */

'use client';

import React from 'react';
import { Button } from '@ghxstship/ui/components/Button';
import { useATLVS } from '../../core/providers/ATLVSProvider';
import {
  Grid3x3,
  List,
  Kanban,
  Calendar,
  Clock,
  BarChart3,
  FileText,
  Settings,
  Image
} from 'lucide-react';

const viewIcons: Record<string, React.ComponentType<any>> = {
  grid: Grid3x3,
  kanban: Kanban,
  calendar: Calendar,
  timeline: Clock,
  gallery: Image,
  list: List,
  dashboard: BarChart3,
  form: FileText,
  table: List,
  chart: BarChart3,
  gantt: Settings,
};

const viewLabels: Record<string, string> = {
  grid: 'Grid',
  kanban: 'Kanban',
  calendar: 'Calendar',
  timeline: 'Timeline',
  gallery: 'Image',
  list: 'List',
  dashboard: 'Dashboard',
  form: 'Form',
  table: 'Table',
  chart: 'Chart',
  gantt: 'Gantt',
};

interface ViewSwitcherProps {
  className?: string;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ className = '' }) => {
  const { viewMode, setViewMode, config } = useATLVS();
  const availableViews = config.views || ['grid', 'list', 'kanban'];

  return (
    <div className={`flex gap-xs p-xs bg-muted rounded-lg ${className}`}>
      {availableViews.map((viewType: string) => {
        const Icon = viewIcons[viewType] || Grid3x3;
        const isActive = viewMode === viewType;

        return (
          <Button
            key={viewType}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode(viewType as any)}
            className="gap-sm"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{viewLabels[viewType]}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default ViewSwitcher;
