'use client';

import React from 'react';
import { Button } from '@ghxstship/ui';
import { Grid3X3, List, Kanban, Calendar } from 'lucide-react';

export type AccountViewType = 'grid' | 'list' | 'kanban' | 'calendar';

interface AccountViewSwitcherProps {
  currentView: AccountViewType;
  onViewChange: (view: AccountViewType) => void;
}

export default function AccountViewSwitcher({ currentView, onViewChange }: AccountViewSwitcherProps) {
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
          <Button
            key={view.id}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange(view.id)}
            className={`flex items-center gap-xs ${
              isActive
                ? 'bg-white shadow-sm'
                : 'hover:bg-white/50'
            }`}
          >
            <Icon className="h-icon-xs w-icon-xs" />
            <span className="hidden sm:inline">{view.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
