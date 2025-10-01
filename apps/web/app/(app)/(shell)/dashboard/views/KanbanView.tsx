'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  MoreHorizontal,
  GripVertical,
  Search,
  Filter,
  Settings,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';

// Kanban Column Configuration
export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  limit?: number;
  order: number;
  field: string;
  value: unknown;
  icon?: React.ComponentType<{ className?: string }>;
}

// Kanban Card Configuration
export interface KanbanCard {
  id: string;
  title: {
    field: string;
    format?: (value: unknown) => string;
  };
  subtitle?: {
    field: string;
    format?: (value: unknown) => string;
  };
  avatar?: {
    field: string;
    fallbackField?: string;
  };
  badges?: Array<{
    field: string;
    format?: (value: unknown) => string;
    color?: string;
  }>;
  metadata?: Array<{
    field: string;
    label?: string;
    format?: (value: unknown) => string;
  }>;
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: Record<string, unknown>) => void;
    disabled?: (row: Record<string, unknown>) => boolean;
  }[];
}

// Kanban Swimlane Configuration
export interface KanbanSwimlane {
  field: string;
  title: string;
  collapsed?: boolean;
}

// Kanban View Props
export interface KanbanViewProps {
  data: Record<string, unknown>[];
  columns: KanbanColumn[];
  cardConfig: KanbanCard;
  swimlanes?: KanbanSwimlane[];
  loading?: boolean;
  className?: string;

  // Search & Filter
  globalSearch?: string;
  onGlobalSearch?: (query: string) => void;

  // Drag & Drop
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string, newValue: unknown) => Promise<void>;
  onCardReorder?: (cardId: string, columnId: string, newIndex: number) => Promise<void>;

  // Column Management
  onAddColumn?: () => void;
  onEditColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;

  // Card Actions
  onCardClick?: (card: Record<string, unknown>) => void;
  onAddCard?: (columnId: string) => void;

  // Selection
  selectable?: boolean;
  selectedCards?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;

  // Bulk Actions
  bulkActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (selectedCards: Record<string, unknown>[]) => void;
    disabled?: boolean;
  }[];

  // Advanced Features
  showLimits?: boolean;
  collapsibleColumns?: boolean;
  showEmptyColumns?: boolean;
  maxCardsPerColumn?: number;
  virtualized?: boolean;
}

// Kanban View Component
export const KanbanView: React.FC<KanbanViewProps> = ({
  data,
  columns,
  cardConfig,
  swimlanes = [],
  loading = false,
  className,

  // Search & Filter
  globalSearch = '',
  onGlobalSearch,

  // Drag & Drop
  onCardMove,
  onCardReorder,

  // Column Management
  onAddColumn,
  onEditColumn,
  onDeleteColumn,

  // Card Actions
  onCardClick,
  onAddCard,

  // Selection
  selectable = false,
  selectedCards = [],
  onSelectionChange,

  // Bulk Actions
  bulkActions = [],

  // Advanced Features
  showLimits = true,
  collapsibleColumns = true,
  showEmptyColumns = true,
  maxCardsPerColumn,
  virtualized = false
}) => {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>(new Set());
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Set<string>(new Set());

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!globalSearch) return data;

    const searchTerm = globalSearch.toLowerCase();
    return data.filter(row => {
      const searchableFields = [
        cardConfig.title.field,
        cardConfig.subtitle?.field,
        ...(cardConfig.badges?.map(b => b.field) || []),
        ...(cardConfig.metadata?.map(m => m.field) || [])
      ].filter(Boolean);

      return searchableFields.some(field => {
        const value = row[field!];
        return String(value || '').toLowerCase().includes(searchTerm);
      });
    });
  }, [data, globalSearch, cardConfig]);

  // Group data by columns and swimlanes
  const groupedData = useMemo(() => {
    const result: Record<string, Record<string, Record<string, unknown>[]> = {};

    filteredData.forEach(row => {
      columns.forEach(column => {
        const columnValue = row[column.field];
        const matchesColumn = columnValue === column.value ||
          (column.value === 'other' && !columns.some(c => c.id !== column.id && row[c.field] === c.value));

        if (matchesColumn) {
          // Group by swimlanes if enabled
          const swimlaneKey = swimlanes.length > 0
            ? swimlanes.map(s => String(row[s.field] || 'none')).join('|')
            : 'default';

          if (!result[column.id]) result[column.id] = {};
          if (!result[column.id][swimlaneKey]) result[column.id][swimlaneKey] = [];

          result[column.id][swimlaneKey].push(row);
        }
      });
    });

    return result;
  }, [filteredData, columns, swimlanes]);

  // Handle card selection
  const handleCardSelect = useCallback((cardId: string) => {
    if (!onSelectionChange) return;

    const newSelection = selectedCards.includes(cardId)
      ? selectedCards.filter(id => id !== cardId)
      : [...selectedCards, cardId];

    onSelectionChange(newSelection);
  }, [selectedCards, onSelectionChange]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    const targetColumn = columns.find(c => c.id === columnId);

    if (!cardId || !targetColumn || !onCardMove) return;

    try {
      await onCardMove(cardId, draggedCard!, columnId, targetColumn.value);
    } catch (error) {
      console.error('Error moving card:', error);
    } finally {
      setDraggedCard(null);
      setDragOverColumn(null);
    }
  }, [draggedCard, columns, onCardMove]);

  // Toggle column collapse
  const toggleColumnCollapse = useCallback((columnId: string) => {
    setCollapsedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  }, []);

  // Toggle swimlane collapse
  const toggleSwimlaneCollapse = useCallback((swimlaneKey: string) => {
    setCollapsedSwimlanes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(swimlaneKey)) {
        newSet.delete(swimlaneKey);
      } else {
        newSet.add(swimlaneKey);
      }
      return newSet;
    });
  }, []);

  // Render card
  const renderCard = useCallback((row: Record<string, unknown>, columnId: string) => {
    const cardId = String(row.id || '');
    const isSelected = selectedCards.includes(cardId);
    const isDragging = draggedCard === cardId;
    const title = cardConfig.title.format
      ? cardConfig.title.format(row[cardConfig.title.field])
      : String(row[cardConfig.title.field] || '');

    return (
      <Card
        key={cardId}
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-primary',
          isDragging && 'opacity-50 rotate-2 scale-105',
          'mb-3'
        )}
        draggable={!isDragging}
        onDragStart={(e) => handleDragStart(e, cardId)}
        onClick={() => onCardClick?.(row)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-xs flex-1 min-w-0">
              {/* Selection Checkbox */}
              {selectable && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleCardSelect(cardId)}
                  className="flex-shrink-0"
                />
              )}

              {/* Avatar */}
              {cardConfig.avatar && (
                <Avatar className="h-icon-md w-icon-md flex-shrink-0">
                  <AvatarImage src={String(row[cardConfig.avatar.field] || '')} />
                  <AvatarFallback>
                    {cardConfig.avatar.fallbackField
                      ? String(row[cardConfig.avatar.fallbackField] || '').slice(0, 2).toUpperCase()
                      : title.slice(0, 2).toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Title */}
              <CardTitle className="text-sm font-medium truncate flex-1">
                {title}
              </CardTitle>
            </div>

            {/* Card Actions */}
            {cardConfig.actions && cardConfig.actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0 flex-shrink-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {cardConfig.actions.map((action, idx) => {
                    const Icon = action.icon;
                    const disabled = action.disabled?.(row);

                    return (
                      <DropdownMenuItem
                        key={idx}
                        onClick={() => action.onClick(row)}
                        disabled={disabled}
                      >
                        {Icon && <Icon className="h-icon-xs w-icon-xs mr-2" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Subtitle */}
          {cardConfig.subtitle && (
            <p className="text-xs text-muted-foreground truncate">
              {cardConfig.subtitle.format
                ? cardConfig.subtitle.format(row[cardConfig.subtitle.field])
                : String(row[cardConfig.subtitle.field] || '')
              }
            </p>
          )}

          {/* Badges */}
          {cardConfig.badges && cardConfig.badges.length > 0 && (
            <div className="flex flex-wrap gap-xs mt-2">
              {cardConfig.badges.map((badge, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: badge.color }}
                >
                  {badge.format
                    ? badge.format(row[badge.field])
                    : String(row[badge.field] || '')
                  }
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        {/* Metadata */}
        {cardConfig.metadata && cardConfig.metadata.length > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-xs">
              {cardConfig.metadata.map((meta, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{meta.label}:</span>
                  <span className="font-medium">
                    {meta.format
                      ? meta.format(row[meta.field])
                      : String(row[meta.field] || '')
                    }
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        {/* Drag Handle */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-icon-xs w-icon-xs text-muted-foreground" />
        </div>
      </Card>
    );
  }, [
    selectedCards,
    draggedCard,
    cardConfig,
    selectable,
    handleCardSelect,
    handleDragStart,
    onCardClick
  ]);

  // Render column
  const renderColumn = useCallback((column: KanbanColumn) => {
    const columnData = groupedData[column.id] || {};
    const totalCards = Object.values(columnData).reduce((sum, cards) => sum + cards.length, 0);
    const isCollapsed = collapsedColumns.has(column.id);
    const isOver = dragOverColumn === column.id;
    const hasLimit = showLimits && column.limit !== undefined;
    const isOverLimit = hasLimit && totalCards > column.limit!;

    return (
      <div
        key={column.id}
        className={cn(
          'flex-shrink-0 w-container-md bg-muted/30 rounded-lg p-md',
          isOver && 'ring-2 ring-primary ring-opacity-50',
          isCollapsed && 'w-icon-2xl'
        )}
        onDragOver={(e) => handleDragOver(e, column.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, column.id)}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          {isCollapsed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleColumnCollapse(column.id)}
              className="p-xs h-icon-lg w-icon-lg"
            >
              <column.icon className="h-icon-xs w-icon-xs" />
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-xs">
                {column.icon && <column.icon className="h-icon-xs w-icon-xs" style={{ color: column.color }} />}
                <h3 className="font-medium text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {totalCards}
                  {hasLimit && `/${column.limit}`}
                </Badge>
                {isOverLimit && (
                  <Badge variant="destructive" className="text-xs">
                    Over limit
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-xs">
                {onAddCard && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddCard(column.id)}
                    className="h-icon-md w-icon-md p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}

                {collapsibleColumns && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleColumnCollapse(column.id)}
                    className="h-icon-md w-icon-md p-0"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEditColumn && (
                      <DropdownMenuItem onClick={() => onEditColumn(column.id)}>
                        Edit Column
                      </DropdownMenuItem>
                    )}
                    {onDeleteColumn && (
                      <DropdownMenuItem
                        onClick={() => onDeleteColumn(column.id)}
                        className="text-destructive"
                      >
                        Delete Column
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>

        {/* Column Content */}
        {!isCollapsed && (
          <div className="space-y-sm">
            {swimlanes.length > 0 ? (
              // Render with swimlanes
              swimlanes.map((swimlane) => {
                const swimlaneKey = swimlane.field;
                const swimlaneData = columnData[swimlaneKey] || [];
                const isSwimlaneCollapsed = collapsedSwimlanes.has(swimlaneKey);

                return (
                  <div key={swimlaneKey} className="border rounded-md p-sm bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-muted-foreground">
                        {swimlane.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSwimlaneCollapse(swimlaneKey)}
                        className="h-icon-sm w-icon-sm p-0"
                      >
                        <ChevronRight className={cn(
                          'h-3 w-3 transition-transform',
                          isSwimlaneCollapsed && 'rotate-90'
                        )} />
                      </Button>
                    </div>

                    {!isSwimlaneCollapsed && (
                      <div className="space-y-xs">
                        {swimlaneData.map((row) => renderCard(row, column.id))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Render without swimlanes
              <div className="space-y-xs">
                {(columnData['default'] || []).map((row) => renderCard(row, column.id))}
              </div>
            )}

            {/* Add Card Button */}
            {onAddCard && !isCollapsed && (
              <Button
                variant="dashed"
                className="w-full justify-start h-icon-lg text-muted-foreground"
                onClick={() => onAddCard(column.id)}
              >
                <Plus className="h-icon-xs w-icon-xs mr-2" />
                Add card
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }, [
    groupedData,
    collapsedColumns,
    dragOverColumn,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    toggleColumnCollapse,
    showLimits,
    collapsibleColumns,
    onAddCard,
    onEditColumn,
    onDeleteColumn,
    swimlanes,
    collapsedSwimlanes,
    toggleSwimlaneCollapse,
    renderCard
  ]);

  return (
    <div className="space-y-md">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-xs">
          {/* Search */}
          {onGlobalSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
              <Input
                placeholder="Search cards..."
                value={globalSearch}
                onChange={(e) => onGlobalSearch(e.target.value)}
                className="pl-9 w-container-sm"
              />
            </div>
          )}

          {/* Bulk Actions */}
          {bulkActions.length > 0 && selectedCards.length > 0 && (
            <div className="flex items-center gap-xs">
              {bulkActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => {
                      const selectedData = filteredData.filter(row =>
                        selectedCards.includes(String(row.id || ''))
                      );
                      action.onClick(selectedData);
                    }}
                    disabled={action.disabled}
                  >
                    {Icon && <Icon className="h-icon-xs w-icon-xs mr-1" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-xs">
          {/* Add Column */}
          {onAddColumn && (
            <Button variant="outline" size="sm" onClick={onAddColumn}>
              <Plus className="h-icon-xs w-icon-xs mr-1" />
              Add Column
            </Button>
          )}

          <div className="text-sm text-muted-foreground">
            {selectedCards.length > 0 && `${selectedCards.length} selected`}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className={cn(
        'flex gap-lg overflow-x-auto pb-4',
        virtualized && 'h-container-lg overflow-y-auto',
        className
      )}>
        {loading ? (
          // Loading state
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-container-md bg-muted/30 rounded-lg p-md animate-pulse">
              <div className="h-icon-xs bg-muted rounded w-component-lg mb-4" />
              <div className="space-y-sm">
                {Array.from({ length: 3 }).map((_, cardIndex) => (
                  <div key={cardIndex} className="h-component-lg bg-muted rounded" />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Columns
          columns
            .sort((a, b) => a.order - b.order)
            .map((column) => {
              const hasData = groupedData[column.id] &&
                Object.values(groupedData[column.id]).some(cards => cards.length > 0);

              if (!showEmptyColumns && !hasData) return null;

              return renderColumn(column);
            })
        )}
      </div>
    </div>
  );
};

export type { KanbanColumn, KanbanCard, KanbanSwimlane, KanbanViewProps };
