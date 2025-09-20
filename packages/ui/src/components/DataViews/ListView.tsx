'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../atomic/Button';
import { Checkbox } from '../atomic/Checkbox';
import { Badge } from '../Badge';
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Plus,
  Filter,
  Search,
  Settings
} from 'lucide-react';
import { GroupConfig } from './types';

interface ListViewProps {
  className?: string;
  titleField: string;
  subtitleField?: string;
  statusField?: string;
  priorityField?: string;
  tagsField?: string;
  avatarField?: string;
  groupBy?: string;
  showGroupCounts?: boolean;
  collapsibleGroups?: boolean;
  onItemClick?: (item: DataRecord) => void;
  onGroupToggle?: (groupKey: string, collapsed: boolean) => void;
}

interface GroupedData {
  [key: string]: DataRecord[];
}

export function ListView({
  className = '',
  titleField,
  subtitleField,
  statusField,
  priorityField,
  tagsField,
  avatarField,
  groupBy,
  showGroupCounts = true,
  collapsibleGroups = true,
  onItemClick,
  onGroupToggle
}: ListViewProps) {
  const { state, config, actions } = useDataView();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Apply search and filters
  const filteredData = useMemo(() => {
    let filtered = [...(config.data || [])];

    // Apply search
    if (state.search) {
      const searchLower = state.search.toLowerCase();
      filtered = filtered.filter(record =>
        Object.values(record).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply filters
    state.filters.forEach(filter => {
      filtered = filtered.filter(record => {
        const value = record[filter.field];
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (state.sorts.length > 0) {
      filtered.sort((a, b) => {
        for (const sort of state.sorts) {
          const aVal = a[sort.field];
          const bVal = b[sort.field];
          
          let comparison = 0;
          if (aVal < bVal) comparison = -1;
          else if (aVal > bVal) comparison = 1;
          
          if (comparison !== 0) {
            return sort.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return filtered;
  }, [config.data, state.search, state.filters, state.sorts]);

  // Group data if groupBy is specified
  const groupedData = useMemo(() => {
    if (!groupBy) return { 'All Items': filteredData };

    const groups: GroupedData = {};
    
    filteredData.forEach(record => {
      const groupKey = record[groupBy] || 'Ungrouped';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(record);
    });

    return groups;
  }, [filteredData, groupBy]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (groupBy) return groupedData;
    
    const start = (state.pagination.page - 1) * state.pagination.pageSize;
    const end = start + state.pagination.pageSize;
    return { 'All Items': filteredData.slice(start, end) };
  }, [groupedData, filteredData, groupBy, state.pagination]);

  const toggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      onGroupToggle?.(groupKey, !newSet.has(groupKey));
      return newSet;
    });
  }, [onGroupToggle]);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'success';
      case 'in_progress':
      case 'active':
        return 'primary';
      case 'blocked':
      case 'cancelled':
        return 'destructive';
      case 'pending':
      case 'waiting':
        return 'warning';
      default:
        return 'secondary';
    }
  }, []);

  const handleSelectAll = useCallback(() => {
    const allItems = Object.values(paginatedData).flat();
    const allSelected = state.selection.length === allItems.length;
    
    if (allSelected) {
      actions.setSelectedRecords([]);
    } else {
      actions.setSelectedRecords(allItems.map(item => item.id));
    }
  }, [paginatedData, state.selection.length, actions]);

  const listClasses = `
    bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={listClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-md border-b border-border">
        <div className="flex items-center gap-sm">
          <Checkbox
            checked={state.selection.length > 0}
            indeterminate={state.selection.length > 0 && state.selection.length < filteredData.length}
            onChange={handleSelectAll}
            aria-label="Select all items"
          />
          
          <span className="text-sm text-muted-foreground">
            {state.selection.length > 0 
              ? `${state.selection.length} selected` 
              : `${filteredData.length} items`
            }
          </span>

          <Button variant="ghost" >
            <Filter className="h-4 w-4" />
            Filters ({state.filters.length})
          </Button>
        </div>

        <div className="flex items-center gap-sm">
          <Button variant="ghost" >
            <Settings className="h-4 w-4" />
            View Options
          </Button>
          
          <Button
            variant="default"
            
            onClick={() => config.onCreate?.()}
          >
            <Plus className="h-4 w-4 mr-xs" />
            Add Item
          </Button>
        </div>
      </div>

      {/* List Content */}
      <div className="divide-y divide-border">
        {Object.entries(paginatedData).map(([groupKey, items]) => {
          const isCollapsed = collapsedGroups.has(groupKey);
          const showGroupHeader = groupBy && Object.keys(paginatedData).length > 1;

          return (
            <div key={groupKey}>
              {/* Group Header */}
              {showGroupHeader && (
                <div className="bg-muted px-md py-sm border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      {collapsibleGroups && (
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="p-xs hover:bg-muted/50 rounded"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      
                      <h3 className="font-medium text-foreground">
                        {groupKey}
                      </h3>
                      
                      {showGroupCounts && (
                        <Badge variant="secondary" >
                          {items.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Group Items */}
              {!isCollapsed && (
                <div>
                  {items.length === 0 ? (
                    <div className="p-xl text-center text-muted-foreground">
                      <div className="text-sm">No items in {groupKey}</div>
                    </div>
                  ) : (
                    items.map((record: any) => {
                      const isSelected = state.selection.includes(record.id);
                      const isHovered = hoveredItem === record.id;
                      const priority = priorityField ? record[priorityField] : null;
                      const status = statusField ? record[statusField] : null;
                      const tags = tagsField ? record[tagsField] : null;
                      const avatar = avatarField ? record[avatarField] : null;
                      const subtitle = subtitleField ? record[subtitleField] : null;

                      return (
                        <div
                          key={record.id}
                          className={`
                            flex items-center gap-sm p-md cursor-pointer transition-all duration-200
                            hover:bg-muted/50
                            ${isSelected ? 'bg-accent/10 border-l-4 border-l-primary' : ''}
                          `}
                          onClick={() => onItemClick?.(record)}
                          onMouseEnter={() => setHoveredItem(record.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          {/* Selection Checkbox */}
                          <Checkbox
                            checked={isSelected}
                            onClick={(e: any) => {
                              e.stopPropagation();
                              if (isSelected) {
                                actions.setSelectedRecords(state.selection.filter(id => id !== record.id));
                              } else {
                                actions.setSelectedRecords([...state.selection, record.id]);
                              }
                            }}
                            aria-label={`Select ${record[titleField]}`}
                          />

                          {/* Avatar */}
                          {avatar && (
                            <div className="flex-shrink-0">
                              {typeof avatar === 'string' && avatar.startsWith('http') ? (
                                <img
                                  src={avatar}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                                  {String(avatar).charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-sm mb-xs">
                              <h4 className="font-medium text-foreground truncate">
                                {record[titleField]}
                              </h4>
                              
                              {priority && (
                                <Badge variant={getPriorityColor(priority)} >
                                  {priority}
                                </Badge>
                              )}
                              
                              {status && (
                                <Badge variant={getStatusColor(status)} >
                                  {status}
                                </Badge>
                              )}
                            </div>
                            
                            {subtitle && (
                              <p className="text-sm text-muted-foreground truncate">
                                {subtitle}
                              </p>
                            )}
                            
                            {tags && Array.isArray(tags) && tags.length > 0 && (
                              <div className="flex flex-wrap gap-xs mt-sm">
                                {tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" >
                                    {String(tag)}
                                  </Badge>
                                ))}
                                {tags.length > 3 && (
                                  <Badge variant="outline" >
                                    +{tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className={`
                            flex-shrink-0 transition-opacity duration-200
                            ${isHovered ? 'opacity-100' : 'opacity-0'}
                          `}>
                            <Button
                              variant="ghost"
                              
                              onClick={(e: any) => {
                                e.stopPropagation();
                                // Show item actions menu
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {!groupBy && filteredData.length > state.pagination.pageSize && (
        <div className="flex items-center justify-between px-md py-sm border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {((state.pagination.page - 1) * state.pagination.pageSize) + 1} to{' '}
            {Math.min(state.pagination.page * state.pagination.pageSize, filteredData.length)} of{' '}
            {filteredData.length} items
          </div>
          
          <div className="flex items-center gap-sm">
            <Button
              variant="ghost"
              
              disabled={state.pagination.page === 1}
              onClick={() => actions.setPagination({ 
                ...state.pagination, 
                page: state.pagination.page - 1 
              })}
            >
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {state.pagination.page} of {Math.ceil(filteredData.length / state.pagination.pageSize)}
            </span>
            
            <Button
              variant="ghost"
              
              disabled={state.pagination.page >= Math.ceil(filteredData.length / state.pagination.pageSize)}
              onClick={() => actions.setPagination({ 
                ...state.pagination, 
                page: state.pagination.page + 1 
              })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
