import type { ViewConfig, BulkAction } from '@ghxstship/atlvs';
import type { DashboardListItem, OverviewMetric, DashboardQuickInsight } from '../types';

interface DashboardViewConfigProps {
  dashboards: DashboardListItem[];
  metrics: OverviewMetric[];
  insights: DashboardQuickInsight[];
}

export const dashboardViews = ({ dashboards, metrics, insights }: DashboardViewConfigProps) => {
  const views: ViewConfig<DashboardListItem>[] = [
    {
      id: 'grid',
      name: 'Grid View',
      description: 'Card-based grid layout with dashboard previews',
      icon: 'grid',
      defaultSort: { field: 'updated_at', direction: 'desc' },
      groupBy: undefined,
      itemsPerPage: 12,
      showPagination: true,
      showSearch: true,
      showFilters: true,
      showSort: true,
      showGrouping: false,
      showExport: true,
      customComponent: 'DashboardGridView'
    },
    {
      id: 'list',
      name: 'List View',
      description: 'Detailed list with all dashboard information',
      icon: 'list',
      defaultSort: { field: 'name', direction: 'asc' },
      groupBy: undefined,
      itemsPerPage: 25,
      showPagination: true,
      showSearch: true,
      showFilters: true,
      showSort: true,
      showGrouping: true,
      showExport: true,
      customComponent: 'DataGrid'
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      description: 'Organize dashboards by type or status',
      icon: 'kanban',
      defaultSort: { field: 'updated_at', direction: 'desc' },
      groupBy: 'type',
      itemsPerPage: 50,
      showPagination: false,
      showSearch: true,
      showFilters: true,
      showSort: false,
      showGrouping: true,
      showExport: false,
      customComponent: 'KanbanBoard',
      kanbanConfig: {
        groupByField: 'type',
        columns: [
          {
            id: 'system',
            title: 'System Dashboards',
            color: 'blue',
            description: 'Built-in system dashboards'
          },
          {
            id: 'custom',
            title: 'Custom Dashboards',
            color: 'green',
            description: 'User-created dashboards'
          },
          {
            id: 'template',
            title: 'Templates',
            color: 'purple',
            description: 'Dashboard templates'
          }
        ]
      }
    },
    {
      id: 'calendar',
      name: 'Calendar View',
      description: 'View dashboards by creation and update dates',
      icon: 'calendar',
      defaultSort: { field: 'created_at', direction: 'desc' },
      groupBy: undefined,
      itemsPerPage: 100,
      showPagination: false,
      showSearch: true,
      showFilters: true,
      showSort: false,
      showGrouping: false,
      showExport: true,
      customComponent: 'CalendarView',
      calendarConfig: {
        dateField: 'created_at',
        titleField: 'name',
        descriptionField: 'description',
        colorField: 'type',
        colors: {
          system: 'hsl(var(--color-primary))',
          custom: 'hsl(var(--color-success))',
          template: 'hsl(var(--color-purple))'
        }
      }
    },
    {
      id: 'timeline',
      name: 'Timeline View',
      description: 'Chronological timeline of dashboard activity',
      icon: 'timeline',
      defaultSort: { field: 'updated_at', direction: 'desc' },
      groupBy: undefined,
      itemsPerPage: 50,
      showPagination: true,
      showSearch: true,
      showFilters: true,
      showSort: true,
      showGrouping: false,
      showExport: true,
      customComponent: 'TimelineView',
      timelineConfig: {
        dateField: 'updated_at',
        titleField: 'name',
        descriptionField: 'description',
        avatarField: 'created_by_user.avatar_url',
        userField: 'created_by_user.full_name'
      }
    },
    {
      id: 'dashboard',
      name: 'Dashboard View',
      description: 'Analytics and metrics overview',
      icon: 'dashboard',
      defaultSort: { field: 'widget_count', direction: 'desc' },
      groupBy: undefined,
      itemsPerPage: 0,
      showPagination: false,
      showSearch: false,
      showFilters: false,
      showSort: false,
      showGrouping: false,
      showExport: true,
      customComponent: 'DashboardAnalyticsView',
      dashboardConfig: {
        metrics: metrics,
        insights: insights,
        charts: [
          {
            id: 'dashboard_types',
            title: 'Dashboard Types Distribution',
            type: 'pie',
            dataSource: dashboards,
            groupBy: 'type'
          },
          {
            id: 'access_levels',
            title: 'Access Levels',
            type: 'donut',
            dataSource: dashboards,
            groupBy: 'access_level'
          },
          {
            id: 'widget_distribution',
            title: 'Widget Count Distribution',
            type: 'bar',
            dataSource: dashboards,
            xAxis: 'name',
            yAxis: 'widget_count'
          },
          {
            id: 'creation_timeline',
            title: 'Dashboard Creation Timeline',
            type: 'line',
            dataSource: dashboards,
            xAxis: 'created_at',
            yAxis: 'count',
            groupBy: 'month'
          }
        ]
      }
    }
  ];

  const bulkActions: BulkAction<DashboardListItem>[] = [
    {
      id: 'export',
      label: 'Export Selected',
      icon: 'download',
      variant: 'default',
      action: async (items) => {
        // Export selected dashboards
      }
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: 'copy',
      variant: 'secondary',
      action: async (items) => {
        // Duplicate selected dashboards
      }
    },
    {
      id: 'share',
      label: 'Share',
      icon: 'share',
      variant: 'secondary',
      action: async (items) => {
        // Share selected dashboards
      }
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: 'archive',
      variant: 'secondary',
      action: async (items) => {
        // Archive selected dashboards
      }
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'destructive',
      confirmMessage: 'Are you sure you want to delete the selected dashboards? This action cannot be undone.',
      action: async (items) => {
        // Delete selected dashboards
      }
    }
  ];

  return {
    views,
    bulkActions
  };
};
