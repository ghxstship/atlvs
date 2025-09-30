'use client';

import React from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { Grid3X3, List, Kanban, Calendar, Eye, EyeOff, Maximize2 } from 'lucide-react';

export type BudgetViewType = 'grid' | 'list' | 'kanban' | 'calendar';

interface BudgetViewSwitcherProps {
  currentView: BudgetViewType;
  onViewChange: (view: BudgetViewType) => void;
}

export default function BudgetViewSwitcher({ currentView, onViewChange }: BudgetViewSwitcherProps) {
  const views = [
    { id: 'grid' as const, label: 'Grid', icon: Grid3X3 },
    { id: 'list' as const, label: 'List', icon: List },
    { id: 'kanban' as const, label: 'Kanban', icon: Kanban },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
  ];

  return (
    <div className="flex items-center gap-xs p-xs bg-gray-50 rounded-lg">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`flex items-center gap-xs px-sm py-xs rounded text-sm transition-colors ${
              isActive
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}
