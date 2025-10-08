/**
 * View System — Unified Export
 * Modern data view system with Phase 1+2 integration
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

// Types
export type {
  ViewType,
  FieldType,
  FieldConfig,
  DataRecord,
  FilterConfig,
  FilterOperator,
  SortConfig,
  GroupConfig,
  PaginationConfig,
  ActionConfig,
  ViewState,
  SavedView,
  ViewProps,
  ViewConfig,
  KanbanColumn,
  KanbanCard,
  GanttTask,
  CalendarEvent,
  DashboardWidget,
  MapMarker,
  WorkloadResource,
  WorkloadAssignment,
  RLSConfig,
} from './types';

// Views
export { GridView } from './GridView/GridView';
export type { GridViewProps } from './GridView/GridView';

export { KanbanView } from './KanbanView/KanbanView';
export type { KanbanViewProps } from './KanbanView/KanbanView';

export { ListView } from './ListView/ListView';
export type { ListViewProps } from './ListView/ListView';

export { CalendarView } from './CalendarView/CalendarView';
export type { CalendarViewProps } from './CalendarView/CalendarView';

export { CardView } from './CardView/CardView';
export type { CardViewProps } from './CardView/CardView';

export { GanttView } from './GanttView/GanttView';
export type { GanttViewProps } from './GanttView/GanttView';

export { DashboardView } from './DashboardView/DashboardView';
export type { DashboardViewProps } from './DashboardView/DashboardView';

export { DetailView } from './DetailView/DetailView';
export type { DetailViewProps } from './DetailView/DetailView';

export { FormView } from './FormView/FormView';
export type { FormViewProps } from './FormView/FormView';

export { AssetView } from './AssetView/AssetView';
export type { AssetViewProps } from './AssetView/AssetView';

export { MapView } from './MapView/MapView';
export type { MapViewProps } from './MapView/MapView';

export { WorkloadView } from './WorkloadView/WorkloadView';
export type { WorkloadViewProps } from './WorkloadView/WorkloadView';
