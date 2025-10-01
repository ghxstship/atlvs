'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/atomic/Button';
import { Checkbox } from '../../components/atomic/Checkbox';
import { Skeleton } from '../../components/atomic/Skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../../components/DropdownMenu';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash, 
  Copy,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { formatDate, formatCurrency, formatNumber } from '../../utils/formatters';
import type { UnifiedService } from '../services/UnifiedService';
import type { FieldConfig } from '../drawers/UnifiedDrawer';

export interface UnifiedListViewProps {
  service: UnifiedService<any>;
  fields: FieldConfig[];
  data?: any[];
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  onItemClick?: (item: any) => void;
  onItemAction?: (action: string, item: any) => void;
  customActions?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (item: any) => void;
    condition?: (item: any) => boolean;
  }>;
  emptyState?: React.ReactNode;
  compact?: boolean;
  showHeaders?: boolean;
  sortable?: boolean;
}

export const UnifiedListView: React.FC<UnifiedListViewProps> = ({
  service,
  fields,
  data: externalData,
  loading: externalLoading,
  selectable = false,
  selectedIds = [],
  onSelect,
  onItemClick,
  onItemAction,
  customActions = [],
  emptyState,
  compact = false,
  showHeaders = true,
  sortable = true,
}) => {
  const [data, setData] = useState<any[]>(externalData || []);
  const [loading, setLoading] = useState(externalLoading || false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Load data if not provided externally
  useEffect(() => {
    if (!externalData && service) {
      loadData();
    } else if (externalData) {
      setData(externalData);
    }
  }, [externalData, service]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const orderBy = sortConfig ? `${sortConfig.key}.${sortConfig.direction}` : undefined;
      const result = await service.list({ limit: 100, orderBy });
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (itemId: string) => {
    if (!onSelect) return;
    
    const newSelection = selectedIds.includes(itemId)
      ? selectedIds.filter(id => id !== itemId)
      : [...selectedIds, itemId];
    
    onSelect(newSelection);
  };

  const handleSelectAll = () => {
    if (!onSelect) return;
    
    const allIds = data.map(item => item.id);
    const newSelection = selectedIds.length === allIds.length ? [] : allIds;
    
    onSelect(newSelection);
  };

  const handleSort = (fieldKey: string) => {
    if (!sortable) return;
    
    const newDirection = sortConfig?.key === fieldKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key: fieldKey, direction: newDirection });
  };

  const renderFieldValue = (item: any, field: FieldConfig) => {
    const value = item[field.key];
    
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }
    
    // Apply custom formatter if provided
    if (field.format) {
      return field.format(value);
    }
    
    // Default formatting based on type
    switch (field.type) {
      case 'date':
        return formatDate(value);
      case 'datetime':
        return formatDate(value, true);
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return formatNumber(value);
      case 'switch':
        return value ? (
          <Badge variant="success">Yes</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        );
      case 'select':
        return <Badge variant="outline">{value}</Badge>;
      case 'tags':
        return (
          <div className="flex flex-wrap gap-xs">
            {(Array.isArray(value) ? value.slice(0, 3) : [value]).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {Array.isArray(value) && value.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{value.length - 3}
              </Badge>
            )}
          </div>
        );
      case 'color':
        return (
          <div className="flex items-center gap-xs">
            <div 
              className="w-3 h-3 rounded border"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs font-mono">{value}</span>
          </div>
        );
      default:
        const stringValue = String(value);
        return stringValue.length > 50 ? (
          <span title={stringValue}>
            {stringValue.substring(0, 50)}...
          </span>
        ) : stringValue;
    }
  };

  const getStatusVariant = (status: string): any => {
    const lowercased = status?.toLowerCase();
    if (['active', 'completed', 'approved', 'success', 'paid'].includes(lowercased)) {
      return 'success';
    }
    if (['pending', 'in_progress', 'processing', 'draft'].includes(lowercased)) {
      return 'warning';
    }
    if (['inactive', 'cancelled', 'rejected', 'failed', 'overdue'].includes(lowercased)) {
      return 'destructive';
    }
    return 'default';
  };

  // Filter out hidden fields and limit visible fields for list view
  const visibleFields = fields.filter(f => !f.hidden).slice(0, 6);
  const primaryField = visibleFields[0];
  const statusField = fields.find(f => f.key === 'status' || f.key === 'state');

  if (loading || externalLoading) {
    return (
      <div className="space-y-sm">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="p-sm">
            <div className="flex items-center gap-sm">
              {selectable && <Skeleton className="h-icon-xs w-icon-xs" />}
              <div className="flex-1 space-y-xs">
                <Skeleton className="h-icon-xs w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-icon-md w-component-md" />
              <Skeleton className="h-icon-lg w-icon-lg" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-lg">
        <div className="text-center">
          <p className="text-destructive mb-sm">Error loading data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={loadData} className="mt-md">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      emptyState || (
        <Card className="p-xl">
          <div className="text-center">
            <p className="text-muted-foreground mb-sm">No items found</p>
            <p className="text-sm text-muted-foreground">
              Create your first item to get started
            </p>
          </div>
        </Card>
      )
    );
  }

  return (
    <div className="space-y-sm">
      {/* Header */}
      {showHeaders && (
        <Card className="p-sm bg-muted/50">
          <div className="flex items-center gap-sm">
            {selectable && (
              <Checkbox
                checked={selectedIds.length === data.length && data.length > 0}
                indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
                onCheckedChange={handleSelectAll}
              />
            )}
            
            <div className="flex-1 grid grid-cols-12 gap-sm">
              {visibleFields.map((field, index) => (
                <div 
                  key={field.key} 
                  className={`
                    text-sm font-medium text-muted-foreground
                    ${index === 0 ? 'col-span-4' : 'col-span-2'}
                    ${sortable ? 'cursor-pointer hover:text-foreground' : ''}
                  `}
                  onClick={() => sortable && handleSort(field.key)}
                >
                  <div className="flex items-center gap-xs">
                    {field.label}
                    {sortable && (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="w-icon-lg" /> {/* Space for actions */}
          </div>
        </Card>
      )}

      {/* Selection Summary */}
      {selectable && selectedIds.length > 0 && (
        <div className="flex items-center gap-sm text-sm text-muted-foreground">
          <span>{selectedIds.length} selected</span>
        </div>
      )}
      
      {/* List Items */}
      <div className="space-y-xs">
        {data.map(item => (
          <Card 
            key={item.id} 
            className={`
              p-sm hover:shadow-md transition-shadow cursor-pointer
              ${compact ? 'py-xs' : ''}
            `}
            onClick={() => onItemClick?.(item)}
          >
            <div className="flex items-center gap-sm">
              {selectable && (
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => handleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              
              <div className="flex-1 grid grid-cols-12 gap-sm items-center">
                {visibleFields.map((field, index) => (
                  <div 
                    key={field.key} 
                    className={`
                      ${index === 0 ? 'col-span-4' : 'col-span-2'}
                      ${index === 0 ? 'font-medium' : 'text-sm text-muted-foreground'}
                    `}
                  >
                    {renderFieldValue(item, field)}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-xs">
                {statusField && (
                  <Badge variant={getStatusVariant(item[statusField.key])}>
                    {item[statusField.key]}
                  </Badge>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-icon-xs w-icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onItemAction?.('view', item)}>
                      <Eye className="mr-xs h-icon-xs w-icon-xs" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onItemAction?.('edit', item)}>
                      <Edit className="mr-xs h-icon-xs w-icon-xs" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onItemAction?.('duplicate', item)}>
                      <Copy className="mr-xs h-icon-xs w-icon-xs" />
                      Duplicate
                    </DropdownMenuItem>
                    
                    {customActions.length > 0 && <DropdownMenuSeparator />}
                    
                    {customActions.map(action => {
                      if (action.condition && !action.condition(item)) return null;
                      return (
                        <DropdownMenuItem 
                          key={action.id}
                          onClick={() => action.onClick(item)}
                        >
                          {action.icon && <action.icon className="mr-xs h-icon-xs w-icon-xs" />}
                          {action.label}
                        </DropdownMenuItem>
                      );
                    })}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => onItemAction?.('delete', item)}
                      className="text-destructive"
                    >
                      <Trash className="mr-xs h-icon-xs w-icon-xs" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UnifiedListView;
