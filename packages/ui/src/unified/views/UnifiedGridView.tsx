'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Download,
  Share,
  Archive
} from 'lucide-react';
import { formatDate, formatCurrency, formatNumber } from '../../utils/formatters';
import type { UnifiedService } from '../services/UnifiedService';
import type { FieldConfig } from '../drawers/UnifiedDrawer';

export interface UnifiedGridViewProps {
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
  cardRenderer?: (item: any) => React.ReactNode;
  emptyState?: React.ReactNode;
  columns?: number;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const UnifiedGridView: React.FC<UnifiedGridViewProps> = ({
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
  cardRenderer,
  emptyState,
  columns = 3,
  gap = 'md',
}) => {
  const [data, setData] = useState<any[]>(externalData || []);
  const [loading, setLoading] = useState(externalLoading || false);
  const [error, setError] = useState<string | null>(null);

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
      const result = await service.list({ limit: 50 });
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
        return <Badge>{value}</Badge>;
      case 'tags':
        return (
          <div className="flex flex-wrap gap-xs">
            {(Array.isArray(value) ? value : [value]).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        );
      case 'color':
        return (
          <div className="flex items-center gap-xs">
            <div 
              className="w-icon-xs h-icon-xs rounded border"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs font-mono">{value}</span>
          </div>
        );
      default:
        return String(value);
    }
  };

  const renderCard = (item: any) => {
    // Use custom renderer if provided
    if (cardRenderer) {
      return cardRenderer(item);
    }
    
    // Default card rendering
    const titleField = fields.find(f => f.key === 'name' || f.key === 'title') || fields[0];
    const descriptionField = fields.find(f => f.key === 'description' || f.key === 'summary');
    const statusField = fields.find(f => f.key === 'status' || f.key === 'state');
    const dateField = fields.find(f => f.type === 'date' || f.type === 'datetime');
    
    // Display first 3-4 fields that aren't title/description
    const displayFields = fields
      .filter(f => 
        f.key !== titleField?.key && 
        f.key !== descriptionField?.key &&
        f.key !== statusField?.key &&
        !f.hidden
      )
      .slice(0, 3);
    
    return (
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => onItemClick?.(item)}
      >
        <CardHeader className="pb-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {titleField && renderFieldValue(item, titleField)}
              </CardTitle>
              {descriptionField && (
                <p className="text-sm text-muted-foreground mt-xs line-clamp-2">
                  {item[descriptionField.key]}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-xs">
              {statusField && (
                <Badge variant={getStatusVariant(item[statusField.key])}>
                  {item[statusField.key]}
                </Badge>
              )}
              
              {selectable && (
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => handleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
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
        </CardHeader>
        
        <CardContent className="pb-sm">
          <div className="space-y-xs">
            {displayFields.map(field => (
              <div key={field.key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{field.label}:</span>
                <span className="font-medium">{renderFieldValue(item, field)}</span>
              </div>
            ))}
          </div>
        </CardContent>
        
        {dateField && (
          <CardFooter className="pt-sm border-t">
            <p className="text-xs text-muted-foreground">
              {dateField.label}: {renderFieldValue(item, dateField)}
            </p>
          </CardFooter>
        )}
      </Card>
    );
  };

  const getStatusVariant = (status: string): any => {
    const lowercased = status?.toLowerCase();
    if (['active', 'completed', 'approved', 'success'].includes(lowercased)) {
      return 'success';
    }
    if (['pending', 'in_progress', 'processing'].includes(lowercased)) {
      return 'warning';
    }
    if (['inactive', 'cancelled', 'rejected', 'failed'].includes(lowercased)) {
      return 'destructive';
    }
    return 'default';
  };

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  };

  const gapClasses = {
    xs: 'gap-xs',
    sm: 'gap-sm',
    md: 'gap-md',
    lg: 'gap-lg',
    xl: 'gap-xl',
  };

  if (loading || externalLoading) {
    return (
      <div className={`grid ${gridClasses[columns as keyof typeof gridClasses]} ${gapClasses[gap]}`}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-icon-sm w-3/4" />
              <Skeleton className="h-icon-xs w-full mt-xs" />
            </CardHeader>
            <CardContent>
              <div className="space-y-xs">
                <Skeleton className="h-icon-xs w-full" />
                <Skeleton className="h-icon-xs w-2/3" />
                <Skeleton className="h-icon-xs w-3/4" />
              </div>
            </CardContent>
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
    <div className="space-y-md">
      {selectable && (
        <div className="flex items-center gap-sm">
          <Checkbox
            checked={selectedIds.length === data.length && data.length > 0}
            indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedIds.length > 0 
              ? `${selectedIds.length} selected`
              : 'Select all'
            }
          </span>
        </div>
      )}
      
      <div className={`grid ${gridClasses[columns as keyof typeof gridClasses]} ${gapClasses[gap]}`}>
        {data.map(item => (
          <div key={item.id}>
            {renderCard(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnifiedGridView;
