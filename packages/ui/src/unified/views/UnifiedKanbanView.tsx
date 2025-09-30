'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/atomic/Button';
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
  Plus,
  GripVertical
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { UnifiedService } from '../services/UnifiedService';
import type { FieldConfig } from '../drawers/UnifiedDrawer';

export interface KanbanColumn {
  id: string;
  title: string;
  value: string;
  color?: string;
  limit?: number;
}

export interface UnifiedKanbanViewProps {
  service: UnifiedService<any>;
  fields: FieldConfig[];
  data?: any[];
  loading?: boolean;
  onItemClick?: (item: any) => void;
  onItemAction?: (action: string, item: any) => void;
  onItemMove?: (itemId: string, fromColumn: string, toColumn: string) => Promise<void>;
  customActions?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (item: any) => void;
    condition?: (item: any) => boolean;
  }>;
  emptyState?: React.ReactNode;
  statusField?: string;
  columns?: KanbanColumn[];
  allowDragDrop?: boolean;
}

export const UnifiedKanbanView: React.FC<UnifiedKanbanViewProps> = ({
  service,
  fields,
  data: externalData,
  loading: externalLoading,
  onItemClick,
  onItemAction,
  onItemMove,
  customActions = [],
  emptyState,
  statusField = 'status',
  columns: customColumns,
  allowDragDrop = true,
}) => {
  const [data, setData] = useState<any[]>(externalData || []);
  const [loading, setLoading] = useState(externalLoading || false);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Default columns based on common status values
  const defaultColumns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do', value: 'todo', color: 'gray' },
    { id: 'in_progress', title: 'In Progress', value: 'in_progress', color: 'blue' },
    { id: 'review', title: 'Review', value: 'review', color: 'yellow' },
    { id: 'done', title: 'Done', value: 'done', color: 'green' },
  ];

  const columns = customColumns || defaultColumns;

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
      const result = await service.list({ limit: 200 });
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Group items by status
  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    columns.forEach(column => {
      groups[column.value] = data.filter(item => item[statusField] === column.value);
    });
    
    return groups;
  }, [data, columns, statusField]);

  const handleDragStart = (e: React.DragEvent, item: any) => {
    if (!allowDragDrop) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnValue: string) => {
    if (!allowDragDrop || !draggedItem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnValue);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnValue: string) => {
    if (!allowDragDrop || !draggedItem) return;
    e.preventDefault();
    
    const fromColumn = draggedItem[statusField];
    const toColumn = columnValue;
    
    if (fromColumn !== toColumn) {
      // Optimistically update UI
      setData(prev => prev.map(item => 
        item.id === draggedItem.id 
          ? { ...item, [statusField]: toColumn }
          : item
      ));
      
      // Call the move handler
      if (onItemMove) {
        try {
          await onItemMove(draggedItem.id, fromColumn, toColumn);
        } catch (error) {
          // Revert on error
          setData(prev => prev.map(item => 
            item.id === draggedItem.id 
              ? { ...item, [statusField]: fromColumn }
              : item
          ));
        }
      }
    }
    
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const renderCard = (item: any) => {
    const titleField = fields.find(f => f.key === 'name' || f.key === 'title') || fields[0];
    const descriptionField = fields.find(f => f.key === 'description' || f.key === 'summary');
    const priorityField = fields.find(f => f.key === 'priority');
    const assigneeField = fields.find(f => f.key === 'assignee_id' || f.key === 'assigned_to');
    const dueDateField = fields.find(f => f.key === 'due_date' || f.key === 'end_date');
    
    return (
      <Card 
        key={item.id}
        className={`
          mb-sm cursor-pointer hover:shadow-md transition-all
          ${allowDragDrop ? 'cursor-grab active:cursor-grabbing' : ''}
          ${draggedItem?.id === item.id ? 'opacity-50' : ''}
        `}
        draggable={allowDragDrop}
        onDragStart={(e) => handleDragStart(e, item)}
        onClick={() => onItemClick?.(item)}
      >
        <CardHeader className="pb-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate">
                {titleField && item[titleField.key]}
              </CardTitle>
              {descriptionField && item[descriptionField.key] && (
                <p className="text-xs text-muted-foreground mt-xs line-clamp-2">
                  {item[descriptionField.key]}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-xs ml-sm">
              {allowDragDrop && (
                <GripVertical className="h-3 w-3 text-muted-foreground" />
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onItemAction?.('view', item)}>
                    <Eye className="mr-xs h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onItemAction?.('edit', item)}>
                    <Edit className="mr-xs h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onItemAction?.('duplicate', item)}>
                    <Copy className="mr-xs h-4 w-4" />
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
                        {action.icon && <action.icon className="mr-xs h-4 w-4" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => onItemAction?.('delete', item)}
                    className="text-destructive"
                  >
                    <Trash className="mr-xs h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-xs">
            {/* Priority */}
            {priorityField && item[priorityField.key] && (
              <Badge 
                variant={getPriorityVariant(item[priorityField.key])}
                className="text-xs"
              >
                {item[priorityField.key]}
              </Badge>
            )}
            
            {/* Assignee */}
            {assigneeField && item[assigneeField.key] && (
              <div className="flex items-center gap-xs text-xs text-muted-foreground">
                <span>Assigned to:</span>
                <span className="font-medium">
                  {item.assignee?.name || item[assigneeField.key]}
                </span>
              </div>
            )}
            
            {/* Due Date */}
            {dueDateField && item[dueDateField.key] && (
              <div className="text-xs text-muted-foreground">
                Due: {formatDate(item[dueDateField.key])}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const getPriorityVariant = (priority: string): any => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getColumnColor = (color?: string) => {
    const colors = {
      gray: 'border-gray-200 bg-gray-50',
      blue: 'border-blue-200 bg-blue-50',
      yellow: 'border-yellow-200 bg-yellow-50',
      green: 'border-green-200 bg-green-50',
      red: 'border-red-200 bg-red-50',
      purple: 'border-purple-200 bg-purple-50',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  if (loading || externalLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {columns.map(column => (
          <div key={column.id} className="space-y-sm">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-sm">
                <Skeleton className="h-4 w-3/4 mb-xs" />
                <Skeleton className="h-3 w-full mb-xs" />
                <Skeleton className="h-3 w-1/2" />
              </Card>
            ))}
          </div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
      {columns.map(column => {
        const columnItems = groupedItems[column.value] || [];
        const isOverLimit = column.limit && columnItems.length > column.limit;
        
        return (
          <div 
            key={column.id}
            className={`
              min-h-[500px] rounded-lg border-2 border-dashed p-sm
              ${dragOverColumn === column.value ? 'border-primary bg-primary/5' : getColumnColor(column.color)}
              transition-colors
            `}
            onDragOver={(e) => handleDragOver(e, column.value)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.value)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-sm">
              <div className="flex items-center gap-xs">
                <h3 className="font-medium text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnItems.length}
                </Badge>
              </div>
              
              {column.limit && (
                <div className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {columnItems.length}/{column.limit}
                </div>
              )}
            </div>
            
            {/* Column Items */}
            <div className="space-y-sm">
              {columnItems.map(renderCard)}
            </div>
            
            {/* Add Item Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-sm border-dashed border"
              onClick={() => onItemAction?.('create', { [statusField]: column.value })}
            >
              <Plus className="h-4 w-4 mr-xs" />
              Add Item
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default UnifiedKanbanView;
