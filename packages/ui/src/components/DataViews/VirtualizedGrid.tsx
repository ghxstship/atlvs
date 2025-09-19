'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../atomic/Button';
import { Input } from '../atomic/Input';
import { Checkbox } from '../atomic/Checkbox';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Loader } from '../Loader';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Filter, 
  Search,
  Settings,
  Grid3X3,
  List
} from 'lucide-react';
import { SortConfig, DataRecord } from './types';

interface VirtualizedGridProps {
  className?: string;
  itemHeight?: number;
  itemWidth?: number;
  gap?: number;
  overscan?: number;
  renderItem?: (item: any, index: number) => React.ReactNode;
  onItemClick?: (item: DataRecord) => void;
  onItemSelect?: (item: DataRecord) => void;
  enableVirtualization?: boolean;
  minItemWidth?: number;
  maxItemWidth?: number;
}

interface VirtualizedState {
  scrollTop: number;
  scrollLeft: number;
  containerHeight: number;
  containerWidth: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  itemsPerRow: number;
  totalRows: number;
}

export function VirtualizedGrid({
  className = '',
  itemHeight = 200,
  itemWidth = 300,
  gap = 16,
  overscan = 5,
  renderItem,
  onItemClick,
  onItemSelect,
  enableVirtualization = true,
  minItemWidth = 250,
  maxItemWidth = 400
}: VirtualizedGridProps) {
  const { state, config, actions } = useDataView();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  const [virtualState, setVirtualState] = useState<VirtualizedState>({
    scrollTop: 0,
    scrollLeft: 0,
    containerHeight: 600,
    containerWidth: 1200,
    visibleStartIndex: 0,
    visibleEndIndex: 0,
    itemsPerRow: 4,
    totalRows: 0
  });

  // Filter visible fields
  const visibleFields = useMemo(() => 
    state.fields.filter(field => field.visible !== false),
    [state.fields]
  );

  // Apply filters, search, and sorting
  const processedData = useMemo(() => {
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
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'gte':
            return Number(value) >= Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          case 'lte':
            return Number(value) <= Number(filter.value);
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          case 'notIn':
            return Array.isArray(filter.value) && !filter.value.includes(value);
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

  // Calculate responsive item width
  const responsiveItemWidth = useMemo(() => {
    const availableWidth = virtualState.containerWidth - gap;
    const minColumns = Math.floor(availableWidth / (maxItemWidth + gap));
    const maxColumns = Math.floor(availableWidth / (minItemWidth + gap));
    
    const optimalColumns = Math.max(1, Math.min(maxColumns, Math.max(minColumns, 3)));
    const calculatedWidth = (availableWidth - (optimalColumns - 1) * gap) / optimalColumns;
    
    return Math.max(minItemWidth, Math.min(maxItemWidth, calculatedWidth));
  }, [virtualState.containerWidth, gap, minItemWidth, maxItemWidth]);

  // Calculate grid dimensions
  const gridDimensions = useMemo(() => {
    const actualItemWidth = responsiveItemWidth;
    const itemsPerRow = Math.floor((virtualState.containerWidth + gap) / (actualItemWidth + gap));
    const totalRows = Math.ceil(processedData.length / itemsPerRow);
    
    return {
      itemsPerRow: Math.max(1, itemsPerRow),
      totalRows,
      actualItemWidth,
      totalHeight: totalRows * (itemHeight + gap) - gap
    };
  }, [processedData.length, responsiveItemWidth, virtualState.containerWidth, itemHeight, gap]);

  // Calculate visible range for virtualization
  const visibleRange = useMemo(() => {
    if (!enableVirtualization) {
      return {
        startIndex: 0,
        endIndex: processedData.length - 1,
        startRow: 0,
        endRow: gridDimensions.totalRows - 1
      };
    }

    const startRow = Math.max(0, Math.floor(virtualState.scrollTop / (itemHeight + gap)) - overscan);
    const endRow = Math.min(
      gridDimensions.totalRows - 1,
      Math.ceil((virtualState.scrollTop + virtualState.containerHeight) / (itemHeight + gap)) + overscan
    );
    
    const startIndex = startRow * gridDimensions.itemsPerRow;
    const endIndex = Math.min(processedData.length - 1, (endRow + 1) * gridDimensions.itemsPerRow - 1);
    
    return { startIndex, endIndex, startRow, endRow };
  }, [
    virtualState.scrollTop,
    virtualState.containerHeight,
    itemHeight,
    gap,
    overscan,
    gridDimensions,
    processedData.length,
    enableVirtualization
  ]);

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setVirtualState(prev => ({
      ...prev,
      scrollTop: target.scrollTop,
      scrollLeft: target.scrollLeft
    }));
  }, []);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setVirtualState(prev => ({
          ...prev,
          containerWidth: rect.width,
          containerHeight: rect.height
        }));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Default item renderer
  const defaultRenderItem = useCallback((item: any, index: number) => {
    const titleField = visibleFields.find(f => f.key === 'name' || f.key === 'title') || visibleFields[0];
    const statusField = visibleFields.find(f => f.key === 'status');
    const dateField = visibleFields.find(f => f.type === 'date');
    
    return (
      <Card
        key={item.id}
        className={`
          h-full cursor-pointer transition-all duration-200 hover:shadow-md
          ${state.selection.includes(item.id) ? 'ring-2 ring-primary' : ''}
        `}
        onClick={() => onItemClick?.(item)}
      >
        <div className="p-md h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-sm">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 mb-xs">
                {titleField ? String(item[titleField.key] || 'Untitled') : 'Untitled'}
              </h3>
              {statusField && (
                <Badge variant="outline" >
                  {String(item[statusField.key] || 'Unknown')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-xs ml-sm">
              <Checkbox
                checked={state.selection.includes(item.id)}
                onClick={(e: any) => {
                  e.stopPropagation();
                  onItemSelect?.(item);
                }}
                aria-label={`Select ${titleField ? item[titleField.key] : 'item'}`}
              />
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

          {/* Content */}
          <div className="flex-1 space-y-sm text-xs text-muted-foreground">
            {visibleFields.slice(1, 4).map(field => {
              const value = item[field.key];
              if (!value) return null;
              
              return (
                <div key={field.key} className="flex justify-between">
                  <span className="font-medium">{field.label}:</span>
                  <span className="truncate ml-sm">
                    {field.type === 'date' && value 
                      ? new Date(value).toLocaleDateString()
                      : String(value)
                    }
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {dateField && (
            <div className="pt-sm border-t border-border mt-sm">
              <div className="text-xs text-muted-foreground">
                {new Date(item[dateField.key]).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }, [visibleFields, state.selection, onItemClick, onItemSelect]);

  // Render visible items
  const renderVisibleItems = () => {
    const items = [];
    const { startIndex, endIndex, startRow } = visibleRange;
    
    for (let i = startIndex; i <= endIndex && i < processedData.length; i++) {
      const item = processedData[i];
      const row = Math.floor(i / gridDimensions.itemsPerRow);
      const col = i % gridDimensions.itemsPerRow;
      
      const x = col * (gridDimensions.actualItemWidth + gap);
      const y = row * (itemHeight + gap);
      
      items.push(
        <div
          key={item.id}
          className="absolute"
          style={{
            left: x,
            top: enableVirtualization ? y - startRow * (itemHeight + gap) : y,
            width: gridDimensions.actualItemWidth,
            height: itemHeight
          }}
        >
          {renderItem ? renderItem(item, i) : defaultRenderItem(item, i)}
        </div>
      );
    }
    
    return items;
  };

  const containerClasses = `
    virtualized-grid bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-md border-b border-border">
        <div className="flex items-center gap-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={state.search}
              onChange={(e: any) => actions.setSearch(e.target.value)}
              className="pl-2xl w-64"
            />
          </div>
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
          <Badge variant="secondary" >
            {processedData.length} items
          </Badge>
        </div>
      </div>

      {/* Grid Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative"
        style={{ height: '600px' }}
      >
        <div
          ref={scrollElementRef}
          className="w-full h-full overflow-auto"
          onScroll={handleScroll}
        >
          <div
            className="relative"
            style={{
              height: enableVirtualization ? gridDimensions.totalHeight : 'auto',
              minHeight: enableVirtualization ? gridDimensions.totalHeight : 'auto'
            }}
          >
            {/* Virtualized Items */}
            {enableVirtualization ? (
              <>
                {/* Spacer for virtualization */}
                {visibleRange.startRow > 0 && (
                  <div style={{ height: visibleRange.startRow * (itemHeight + gap) }} />
                )}
                
                {/* Visible Items Container */}
                <div 
                  className="relative"
                  style={{ 
                    height: (visibleRange.endRow - visibleRange.startRow + 1) * (itemHeight + gap),
                    paddingLeft: gap / 2,
                    paddingRight: gap / 2,
                    paddingTop: gap / 2
                  }}
                >
                  {renderVisibleItems()}
                </div>
              </>
            ) : (
              /* Non-virtualized Grid */
              <div 
                className="grid gap-md p-md"
                style={{
                  gridTemplateColumns: `repeat(${gridDimensions.itemsPerRow}, ${gridDimensions.actualItemWidth}px)`,
                  justifyContent: 'center'
                }}
              >
                {processedData.map((item, index) => (
                  <div key={item.id} style={{ height: itemHeight }}>
                    {renderItem ? renderItem(item, index) : defaultRenderItem(item, index)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {state.loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader text="Loading items..." />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-md py-sm border-t border-border bg-muted/30">
        <div className="flex items-center gap-md text-sm text-muted-foreground">
          <span>
            {processedData.length} items ({gridDimensions.itemsPerRow} per row)
          </span>
          {enableVirtualization && (
            <span>
              Showing {visibleRange.endIndex - visibleRange.startIndex + 1} of {processedData.length}
            </span>
          )}
          {state.selection.length > 0 && (
            <Badge variant="default" >
              {state.selection.length} selected
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-sm">
          <Button
            variant={enableVirtualization ? 'default' : 'ghost'}
            
            onClick={() => {
              // Toggle virtualization (would be controlled by parent)
              console.log('Toggle virtualization');
            }}
          >
            <Grid3X3 className="h-4 w-4" />
            Virtual
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {processedData.length === 0 && !state.loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Grid3X3 className="h-12 w-12 mx-auto mb-md text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-sm">No items found</h3>
            <p className="text-sm text-muted-foreground">
              {state.search || state.filters.length > 0
                ? 'Try adjusting your search or filters.'
                : 'No items to display.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
