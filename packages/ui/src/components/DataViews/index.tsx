'use client';

import React from 'react';
import { useATLVS } from '../../core/providers/ATLVSProvider';
import { UnifiedGridView } from '../../unified/views/UnifiedGridView';
import { UnifiedListView } from '../../unified/views/UnifiedListView';
import { UnifiedKanbanView } from '../../unified/views/UnifiedKanbanView';
import { UnifiedCalendarView } from '../../unified/views/UnifiedCalendarView';
import { UnifiedTimelineView } from '../../unified/views/UnifiedTimelineView';
import { UnifiedDashboardView } from '../../unified/views/UnifiedDashboardView';
import { Button } from '../atomic/Button';
import { Input } from '../atomic/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select';
import { 
  Grid3x3, 
  List, 
  Kanban, 
  Calendar,
  Clock,
  BarChart3,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// View Switcher Component
export const ViewSwitcher: React.FC = () => {
  const { viewMode, setViewMode, config } = useATLVS();
  const availableViews = config.views || ['grid', 'list'];

  const viewIcons = {
    grid: Grid3x3,
    list: List,
    kanban: Kanban,
    calendar: Calendar,
    timeline: Clock,
    dashboard: BarChart3,
    table: List,
    gallery: Grid3x3,
    map: Grid3x3,
  };

  return (
    <div className="flex items-center gap-xs">
      {availableViews.map((view) => {
        const Icon = viewIcons[view as keyof typeof viewIcons] || Grid3x3;
        return (
          <Button
            key={view}
            variant={viewMode === view ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode(view as any)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
};

// Data View Container Component
export const DataViewContainer: React.FC = () => {
  const { 
    viewMode, 
    data, 
    loading, 
    error,
    selectedIds,
    setSelectedIds,
    config,
    handleEdit,
    handleView,
    handleDelete
  } = useATLVS();

  const handleItemAction = async (action: string, item: any) => {
    switch (action) {
      case 'view':
        handleView(item);
        break;
      case 'edit':
        handleEdit(item);
        break;
      case 'delete':
        await handleDelete(item.id);
        break;
      default:
        // Handle custom actions
        const customAction = config.customActions?.find(a => a.id === action);
        if (customAction) {
          await customAction.onClick(item);
        }
    }
  };

  // Render the appropriate view based on viewMode
  switch (viewMode) {
    case 'grid':
      return (
        <UnifiedGridView
          service={config.service}
          fields={config.fields || []}
          data={data}
          loading={loading}
          selectable={true}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onItemClick={handleView}
          onItemAction={handleItemAction}
          customActions={config.customActions}
          emptyState={config.emptyState}
        />
      );
    
    case 'list':
      return (
        <UnifiedListView
          service={config.service}
          fields={config.fields || []}
          data={data}
          loading={loading}
          selectable={true}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onItemClick={handleView}
          onItemAction={handleItemAction}
          customActions={config.customActions}
          emptyState={config.emptyState}
        />
      );
    
    case 'kanban':
      return (
        <UnifiedKanbanView
          service={config.service}
          fields={config.fields || []}
          data={data}
          loading={loading}
          onItemClick={handleView}
          onItemAction={handleItemAction}
          customActions={config.customActions}
          emptyState={config.emptyState}
          allowDragDrop={true}
        />
      );
    
    case 'calendar':
      return (
        <UnifiedCalendarView
          service={config.service}
          fields={config.fields || []}
          data={data}
          loading={loading}
          onItemClick={handleView}
          onItemAction={handleItemAction}
          customActions={config.customActions}
          emptyState={config.emptyState}
        />
      );
    
    case 'timeline':
      return (
        <UnifiedTimelineView
          service={config.service}
          fields={config.fields || []}
          data={data}
          loading={loading}
          onItemClick={handleView}
          onItemAction={handleItemAction}
          customActions={config.customActions}
          emptyState={config.emptyState}
        />
      );
    
    case 'dashboard':
      return (
        <UnifiedDashboardView
          service={config.service}
          fields={config.fields || []}
          widgets={[]} // Would be configured based on entity
          loading={loading}
          onRefresh={() => window.location.reload()}
        />
      );
    
    case 'table':
      // Table is essentially the same as list view but with different styling
      return (
        <UnifiedListView
          service={config.service}
          fields={config.fields || []}
          data={data}
          loading={loading}
          selectable={true}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onItemClick={handleView}
          onItemAction={handleItemAction}
          customActions={config.customActions}
          emptyState={config.emptyState}
          showHeaders={true}
          sortable={true}
        />
      );
    
    case 'gallery':
      // Gallery is essentially grid view with image focus
      return (
        <UnifiedGridView
          service={config.service}
          fields={config.fields || []}
          data={data}
          loading={loading}
          selectable={true}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onItemClick={handleView}
          onItemAction={handleItemAction}
          customActions={config.customActions}
          emptyState={config.emptyState}
          columns={4}
          gap="lg"
        />
      );
    
    case 'map':
      // Map view placeholder - would integrate with mapping library
      return (
        <div className="p-xl text-center">
          <div className="text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-md bg-muted rounded-lg flex items-center justify-center">
              🗺️
            </div>
            <p className="mb-sm">Map view</p>
            <p className="text-sm">Geographic visualization of {data.length} items</p>
          </div>
        </div>
      );
    
    default:
      return (
        <UnifiedGridView
          service={config.service}
          fields={config.fields || []}
          data={data}
          loading={loading}
          selectable={true}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onItemClick={handleView}
          onItemAction={handleItemAction}
          customActions={config.customActions}
          emptyState={config.emptyState}
        />
      );
  }
};

// Data Actions Component
export const DataActions: React.FC = () => {
  const { 
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    selectedIds,
    handleBulkAction,
    handleExport,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    config
  } = useATLVS();

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-sm">
      {/* Search and Filters */}
      <div className="flex items-center gap-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-xs" />
          Filters
        </Button>
        
        {selectedIds.length > 0 && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkAction('delete')}
            >
              Delete ({selectedIds.length})
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-xs" />
              Export
            </Button>
          </>
        )}
      </div>
      
      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} results
          </div>
          
          <div className="flex items-center gap-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-xs">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Expose additional view utilities for consumers importing this module
export { DataGrid } from './DataGrid';
export { KanbanBoard } from './KanbanBoard';
export { ListView } from './ListView';
export { CalendarView } from './CalendarView';
export { TimelineView } from './TimelineView';
export { GalleryView } from './GalleryView';
export { DashboardView } from './DashboardView';
export { FormView } from './FormView';
export { UniversalDrawer } from './UniversalDrawer';
export { PivotTableView } from './PivotTableView';
export { MapView } from './MapView';
export { WhiteboardView } from './WhiteboardView';
export { VirtualizedGrid } from './VirtualizedGrid';
export { PerformanceOptimizer } from './PerformanceOptimizer';
export { DatabaseOptimizer } from './DatabaseOptimizer';
export { DesignTokenValidator } from './DesignTokenValidator';
export { SchemaIntrospector } from './SchemaValidationFramework';
export { SchemaIntegratedDataGrid } from './SchemaIntegratedDataGrid';
export { AdvancedSearchSystem } from './AdvancedSearchSystem';
export { DynamicFieldManager } from './DynamicFieldManager';
export { DatabaseTransactionManager, useDatabaseTransaction } from './DatabaseTransactionManager';
export { PerformanceMonitoringSystem } from './PerformanceMonitoringSystem';
export { VirtualizedList, LazyLoad, useInfiniteScroll } from './VirtualizedList';

export {
  StateManagerProvider,
  useStateManager,
  StateRenderer,
  EmptyState,
  ErrorState,
  LoadingState,
  EMPTY_STATES,
  ERROR_STATES,
  LOADING_STATES,
} from './StateManager';

export { DataViewProvider, useDataView } from './DataViewProvider';

export type {
  ViewType,
  ViewProps,
  FilterConfig,
  SortConfig,
  GroupConfig,
  ViewState,
  KanbanColumn,
  CalendarEvent,
  TimelineItem,
  GalleryItem,
  ListGroup,
  SavedView,
  DashboardWidget,
  DashboardLayout,
  FormSection,
  FormValidation,
  ExportConfig,
  ImportConfig,
  DataRecord,
  DataViewConfig,
} from './types';
