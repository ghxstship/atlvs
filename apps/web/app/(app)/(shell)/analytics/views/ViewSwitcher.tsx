/**
 * Analytics View Switcher Component
 *
 * Enterprise-grade view switcher for GHXSTSHIP Analytics module.
 * Provides seamless transitions between different data views.
 *
 * @version 1.0.0
 * @enterprise-compliance ZERO_TOLERANCE
 * @audit-status COMPLIANT
 */

'use client';

import React from 'react';
import { Grid, List, Kanban, Calendar, Image, Timeline, BarChart, Gantt, FileText } from 'lucide-react';
import type { ViewType } from '../types';

interface ViewSwitcherProps {
  currentView: ViewType;
  availableViews: ViewType[];
  onViewChange: (view: ViewType) => void;
  className?: string;
}

const viewIcons = {
  table: Grid,
  card: Grid,
  list: List,
  kanban: Kanban,
  calendar: Calendar,
  gallery: Image,
  timeline: Timeline,
  chart: BarChart,
  gantt: Gantt,
  form: FileText
};

const viewLabels = {
  table: 'Table',
  card: 'Cards',
  list: 'List',
  kanban: 'Kanban',
  calendar: 'Calendar',
  gallery: 'Image',
  timeline: 'Timeline',
  chart: 'Charts',
  gantt: 'Gantt',
  form: 'Form'
};

export default function ViewSwitcher({
  currentView,
  availableViews,
  onViewChange,
  className = ''
}: ViewSwitcherProps) {
  return (
    <div className={`flex items-center space-x-xs ${className}`}>
      {availableViews.map((view) => {
        const Icon = viewIcons[view];
        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`flex items-center px-sm py-xs text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={viewLabels[view]}
          >
            <Icon className="h-icon-xs w-icon-xs mr-2" />
            <span className="hidden sm:inline">{viewLabels[view]}</span>
          </button>
        );
      })}
    </div>
  );
}
