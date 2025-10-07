'use client';

import { MoreHorizontal, Trash2, Edit, Copy, Download, Archive, Mail, Tag } from 'lucide-react';
import { Button } from '../../components/atomic/Button';
import { Badge } from '../../components/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  onClick: (selectedIds: string[]) => void;
  requiresConfirmation?: boolean;
}

export interface BulkActionsProps {
  selectedCount: number;
  totalCount?: number;
  actions?: BulkAction[];
  onClearSelection?: () => void;
  className?: string;
}

const DEFAULT_ACTIONS: BulkAction[] = [
  {
    id: 'edit',
    label: 'Edit',
    icon: Edit,
    onClick: () => {},
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    onClick: () => {},
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    onClick: () => {},
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    onClick: () => {},
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    onClick: () => {},
    requiresConfirmation: true,
  },
];

export function BulkActions({
  selectedCount,
  totalCount,
  actions = DEFAULT_ACTIONS,
  onClearSelection,
  className = '',
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  const handleActionClick = (action: BulkAction, selectedIds: string[]) => {
    if (action.requiresConfirmation) {
      if (window.confirm(`Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} item(s)?`)) {
        action.onClick(selectedIds);
      }
    } else {
      action.onClick(selectedIds);
    }
  };

  return (
    <div className={`flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-md ${className}`}>
      <Badge variant="default" className="font-semibold">
        {selectedCount} selected
      </Badge>

      {totalCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          of {totalCount}
        </span>
      )}

      <div className="flex items-center gap-1 ml-auto">
        {actions.slice(0, 3).map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleActionClick(action, [])}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          );
        })}

        {actions.length > 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.slice(3).map((action, index) => {
                const Icon = action.icon;
                return (
                  <div key={action.id}>
                    {index > 0 && action.variant === 'destructive' && (
                      <DropdownMenuSeparator />
                    )}
                    <DropdownMenuItem
                      onClick={() => handleActionClick(action, [])}
                      className={action.variant === 'destructive' ? 'text-destructive' : ''}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </DropdownMenuItem>
                  </div>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onClearSelection && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
