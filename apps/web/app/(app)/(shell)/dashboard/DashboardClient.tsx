'use client';


import React, { useState, useEffect, useCallback } from 'react';
import { Activity, AlertCircle, BarChart3, Bell, Edit, Layout, Plus, Trash2, TrendingUp } from 'lucide-react';
import { Card, Button, Badge, Stack, HStack, Grid ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';

type ProjectsStats = {
  total: number;
  active: number;
  completed: number;
  budget_total: number;
  budget_used: number;
};

type PeopleStats = {
  total: number;
  active: number;
  on_leave: number;
  contractors: number;
  departments: string[];
};

type FinanceStats = {
  revenue_monthly: number;
  expenses_monthly: number;
  profit_margin: number;
  pending_invoices: number;
  overdue_payments: number;
};

type AnalyticsStats = {
  page_views: number;
  unique_visitors: number;
  conversion_rate: number;
  bounce_rate: number;
};

type CrossModuleData = {
  projects?: ProjectsStats;
  people?: PeopleStats;
  finance?: FinanceStats;
  analytics?: AnalyticsStats;
};


// Dashboard types
interface WidgetConfig {
  value?: number | string;
  change?: number;
  status?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  format?: 'currency' | 'number';
  chartType?: 'line' | 'bar' | 'pie';
  data?: number[];
  headers?: string[];
  rows?: string[][];
  activities?: Array<{
    user: string;
    action: string;
    item: string;
    time: string;
    module?: string;
  }>;
}

interface DashboardWidget {
  id: string;
  dashboard_id: string;
  type: 'metric' | 'chart' | 'activity' | 'table' | 'text';
  title: string;
  config: WidgetConfig;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data_source?: string;
  refresh_interval?: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface DashboardLayout {
  columns: number;
  gutters: 'sm' | 'md' | 'lg';
  padding: 'sm' | 'md' | 'lg';
  // eslint-disable-next-line react-hooks/exhaustive-deps
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  is_default: boolean;
  is_public: boolean;
  organization_id: string;
  created_by: string;
  widgets: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

interface DashboardClientProps {
  orgId: string;
}

// Cross-module data integration functions
const fetchProjectsData = async (_orgId: string): Promise<ProjectsStats> => {
  // Mock integration with Projects module
  return {
    total: 24,
    active: 18,
    completed: 6,
    budget_total: 2500000,
    budget_used: 1875000
  };
};

const fetchPeopleData = async (_orgId: string): Promise<PeopleStats> => {
  // Mock integration with People module
  return {
    total: 156,
    active: 142,
    on_leave: 8,
    contractors: 6,
    departments: ['Engineering', 'Design', 'Marketing', 'Sales']
  };
};

const fetchFinanceData = async (_orgId: string): Promise<FinanceStats> => {
  // Mock integration with Finance module
  return {
    revenue_monthly: 125000,
    expenses_monthly: 89000,
    profit_margin: 28.8,
    pending_invoices: 12,
    overdue_payments: 3
  };
};

const fetchAnalyticsData = async (_orgId: string): Promise<AnalyticsStats> => {
  // Mock integration with Analytics module
  return {
    page_views: 45230,
    unique_visitors: 12450,
    conversion_rate: 3.2,
    bounce_rate: 42.1
  };
};

// Mock data for demonstration with cross-module integration
const mockDashboard: Dashboard = {
  id: 'mock-dashboard-1',
  name: 'Executive Overview',
  description: 'Unified view of key metrics across modules',
  layout: {
    columns: 12,
    gutters: 'lg',
    padding: 'lg'
  },
  is_default: true,
  is_public: false,
  organization_id: 'org-1',
  created_by: 'mock-user',
  widgets: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

interface WidgetDraft {
  id?: string;
  type: DashboardWidget['type'];
  title: string;
  config: WidgetConfig;
  position: DashboardWidget['position'];
  data_source?: string;
  refresh_interval?: number;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ orgId }) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [crossModuleData, setCrossModuleData] = useState<CrossModuleData>({});
  const [notifications, setNotifications] = useState<Array<{ id: number; type: string; message: string; timestamp: string }>>([]);
  const [isWidgetDrawerOpen, setIsWidgetDrawerOpen] = useState(false);
  const [widgetDraft, setWidgetDraft] = useState<WidgetDraft | null>(null);

  const createDefaultDraft = useCallback((): WidgetDraft => ({
    type: 'metric',
    title: '',
    config: {},
    position: { x: 0, y: 0, w: 4, h: 3 },
    refresh_interval: 300
  }), []);

  // Real-time notifications simulation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        type: 'info',
        message: `Real-time update: ${Math.floor(Math.random() * 100)} new activities`,
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load cross-module data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadCrossModuleData = async () => {
      try {
        const [projects, people, finance, analytics] = await Promise.all([
          fetchProjectsData(orgId),
          fetchPeopleData(orgId),
          fetchFinanceData(orgId),
          fetchAnalyticsData(orgId)
        ]);

        setCrossModuleData({
          projects,
          people,
          finance,
          analytics
        });
      } catch (err) {
        console.error('Failed to load cross-module data:', err);
      }
    };

    loadCrossModuleData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // Load dashboard and widgets with cross-module integration
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock widgets data with cross-module integration
      const mockWidgets: DashboardWidget[] = [
        {
          id: 'widget-1',
          dashboard_id: 'mock-dashboard-1',
          type: 'metric',
          title: 'Total Projects',
          config: { 
            value: crossModuleData.projects?.total ?? 24, 
            change: 12, 
            status: 'up',
            subtitle: `${crossModuleData.projects?.active ?? 18} active`
          },
          position: { x: 0, y: 0, w: 3, h: 2 },
          organization_id: orgId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'widget-2',
          dashboard_id: 'mock-dashboard-1',
          type: 'metric',
          title: 'Team Members',
          config: { 
            value: crossModuleData.people?.total ?? 156, 
            change: -3, 
            status: 'down',
            subtitle: `${crossModuleData.people?.active ?? 142} active`
          },
          position: { x: 3, y: 0, w: 3, h: 2 },
          organization_id: orgId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'widget-3',
          dashboard_id: 'mock-dashboard-1',
          type: 'metric',
          title: 'Monthly Revenue',
          config: { 
            value: crossModuleData.finance?.revenue_monthly ?? 125000, 
            change: 8.5, 
            status: 'up',
            subtitle: `${crossModuleData.finance?.profit_margin ?? 28.8}% margin`,
            format: 'currency'
          },
          position: { x: 6, y: 0, w: 3, h: 2 },
          organization_id: orgId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'widget-4',
          dashboard_id: 'mock-dashboard-1',
          type: 'activity',
          title: 'Recent Activity',
          config: { 
            activities: [
              { user: 'John Doe', action: 'completed task', item: 'Design Review', time: '2 hours ago', module: 'Projects' },
              { user: 'Jane Smith', action: 'created project', item: 'New Campaign', time: '4 hours ago', module: 'Projects' },
              { user: 'Mike Johnson', action: 'updated budget', item: 'Q4 Planning', time: '6 hours ago', module: 'Finance' },
              { user: 'Sarah Wilson', action: 'hired employee', item: 'Frontend Developer', time: '8 hours ago', module: 'People' }
            ]
          },
          position: { x: 9, y: 0, w: 3, h: 4 },
          organization_id: orgId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'widget-5',
          dashboard_id: 'mock-dashboard-1',
          type: 'chart',
          title: 'Revenue Trend',
          config: { chartType: 'line', data: [120, 135, 125, 140, 155, 145, 160] },
          position: { x: 0, y: 2, w: 6, h: 4 },
          organization_id: orgId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'widget-6',
          dashboard_id: 'mock-dashboard-1',
          type: 'table',
          title: 'Top Projects by Budget',
          config: {
            headers: ['Project', 'Status', 'Budget', 'Used', 'Progress'],
            rows: [
              ['Project Alpha', 'Active', '$125,000', '$93,750', '75%'],
              ['Project Beta', 'Planning', '$89,000', '$22,250', '25%'],
              ['Project Gamma', 'Completed', '$156,000', '$156,000', '100%'],
              ['Project Delta', 'Active', '$78,000', '$39,000', '50%']
            ]
          },
          position: { x: 6, y: 2, w: 6, h: 4 },
          organization_id: orgId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setDashboard(mockDashboard);
      setWidgets(mockWidgets);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [orgId, crossModuleData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (Object.keys(crossModuleData).length > 0) {
      loadDashboard();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDashboard, crossModuleData]);

  const handleAddWidget = useCallback(async (widgetData: Partial<DashboardWidget>) => {
    if (!dashboard) return;

    try {
      const base = {
        dashboard_id: dashboard.id,
        organization_id: orgId
      };

      if (widgetData.id) {
        setWidgets(prev => prev.map(widget =>
          widget.id === widgetData.id
            ? {
                ...widget,
                ...base,
                type: widgetData.type ?? widget.type,
                title: widgetData.title ?? widget.title,
                config: widgetData.config ?? widget.config,
                position: widgetData.position ?? widget.position,
                data_source: widgetData.data_source ?? widget.data_source,
                refresh_interval: widgetData.refresh_interval ?? widget.refresh_interval,
                updated_at: new Date().toISOString()
              }
            : widget
        ));
      } else {
        const newWidget: DashboardWidget = {
          id: `widget-${Date.now()}`,
          ...base,
          type: widgetData.type || 'metric',
          title: widgetData.title || 'New Widget',
          config: widgetData.config || {},
          position: widgetData.position || { x: 0, y: 0, w: 4, h: 3 },
          data_source: widgetData.data_source,
          refresh_interval: widgetData.refresh_interval || 300,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setWidgets(prev => [...prev, newWidget]);
      }

      setIsWidgetDrawerOpen(false);
      setWidgetDraft(null);
    } catch (err) {
      console.error('Error adding widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to add widget');
    }
  }, [dashboard, orgId]);

  const handleDeleteWidget = useCallback(async (widgetId: string) => {
    try {
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
    } catch (err) {
      console.error('Error deleting widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete widget');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderWidget = (widget: DashboardWidget) => {
    const commonProps = {
      key: widget.id,
      widget,
      onEdit: () => {
        setWidgetDraft({
          id: widget.id,
          type: widget.type,
          title: widget.title,
          config: widget.config,
          position: widget.position,
          data_source: widget.data_source,
          refresh_interval: widget.refresh_interval
        });
        setIsWidgetDrawerOpen(true);
      },
      onDelete: () => handleDeleteWidget(widget.id),
      orgId
    };

    switch (widget.type) {
      case 'metric':
        return (
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <h3 className="form-label">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-xs">
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-icon-xs w-icon-xs" />
                  </Button>
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-icon-xs w-icon-xs" />
                  </Button>
                </div>
              )}
            </div>
            <div className="stack-sm">
              <div className="text-heading-3 text-heading-3">
                {widget.config.format === 'currency' ? 
                  `$${(widget.config.value || 0).toLocaleString()}` : 
                  (widget.config.value || '0')}
              </div>
              <div className="flex items-center gap-sm">
                <Badge variant={widget.config.status === 'up' ? 'success' : widget.config.status === 'down' ? 'error' : 'secondary'}>
                  {widget.config.status === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                   widget.config.status === 'down' ? <TrendingUp className="h-3 w-3 rotate-180" /> : 
                   <BarChart3 className="h-3 w-3" />}
                  {widget.config.change || '0'}%
                </Badge>
                {widget.config.subtitle && (
                  <span className="text-body-sm color-muted">{widget.config.subtitle}</span>
                )}
              </div>
            </div>
          </Card>
        );
      case 'chart':
        return (
          <Card className="p-md">
            <div className="flex items-center justify-between mb-md">
              <h3 className="form-label">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-xs">
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-icon-xs w-icon-xs" />
                  </Button>
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-icon-xs w-icon-xs" />
                  </Button>
                </div>
              )}
            </div>
            <div className="h-container-xs flex items-center justify-center bg-secondary/50 rounded">
              <BarChart3 className="h-icon-2xl w-icon-2xl color-muted" />
              <span className="ml-sm color-muted">Chart Widget</span>
            </div>
          </Card>
        );
      case 'activity':
        return (
          <Card className="p-md">
            <div className="flex items-center justify-between mb-md">
              <h3 className="form-label">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-xs">
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-icon-xs w-icon-xs" />
                  </Button>
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-icon-xs w-icon-xs" />
                  </Button>
                </div>
              )}
            </div>
            <div className="stack-sm">
              {widget.config.activities?.map((activity, index: number) => (
                <div key={index} className="flex items-center gap-sm">
                  <div className="w-icon-lg h-icon-lg bg-accent/10 rounded-full flex items-center justify-center">
                    <Activity className="h-icon-xs w-icon-xs color-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body-sm">
                      <span className="form-label">{activity.user}</span> {activity.action}{' '}
                      <span className="form-label">{activity.item}</span>
                    </p>
                    <div className="flex items-center gap-sm">
                      <p className="text-body-sm color-muted">{activity.time}</p>
                      {activity.module && (
                        <Badge variant="secondary">
                          {activity.module}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      case 'table':
        return (
          <Card className="p-md">
            <div className="flex items-center justify-between mb-md">
              <h3 className="form-label">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-xs">
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-icon-xs w-icon-xs" />
                  </Button>
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-icon-xs w-icon-xs" />
                  </Button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b">
                    {widget.config.headers?.map((header: string, index: number) => (
                      <th key={index} className="text-left py-sm  px-md form-label">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {widget.config.rows?.map((row: string[], index: number) => (
                    <tr key={index} className="border-b">
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="py-sm  px-md ">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      default:
        return (
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <h3 className="form-label">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-xs">
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-icon-xs w-icon-xs" />
                  </Button>
                  <Button
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-icon-xs w-icon-xs" />
                  </Button>
                </div>
              )}
            </div>
            <p className="color-muted">Widget content</p>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <Stack spacing="lg">
        <HStack justify="between" align="center">
          <Stack spacing="xs">
            <h1 className="text-heading-3 font-anton uppercase">Dashboard</h1>
            <p className="text-body-sm opacity-80">Loading your dashboard...</p>
          </Stack>
        </HStack>
        <Grid cols={1} responsive={{ md: 2, lg: 3 }} spacing="lg">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-component-xl animate-pulse bg-secondary/50" />
          ))}
        </Grid>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing="lg">
        <HStack justify="between" align="center">
          <Stack spacing="xs">
            <h1 className="text-heading-3 font-anton uppercase">Dashboard</h1>
            <p className="text-body-sm opacity-80">Error loading dashboard</p>
          </Stack>
        </HStack>
        <Card className="p-lg text-center">
          <p className="color-destructive mb-md">{error}</p>
          <Button onClick={loadDashboard}>Retry</Button>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing="lg">
      <HStack justify="between" align="center">
        <Stack spacing="xs">
          <h1 className="text-heading-3 font-anton uppercase">
            {dashboard?.name || 'Dashboard'}
          </h1>
          <p className="text-body-sm opacity-80">
            {dashboard?.description || 'Your personalized dashboard'}
          </p>
        </Stack>
        <HStack spacing="sm" align="center">
          {notifications.length > 0 && (
            <Button
              variant="secondary"
              className="relative"
            >
              <Bell className="h-icon-xs w-icon-xs" />
              <span className="absolute -top-xs -right-1 bg-destructive color-destructive-foreground text-body-sm rounded-full h-icon-sm w-icon-sm flex items-center justify-center">
                {notifications.length}
              </span>
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => setEditMode(!editMode)}
          >
            <Layout className="h-icon-xs w-icon-xs mr-sm" />
            {editMode ? 'Done' : 'Edit'}
          </Button>
          <Button
            onClick={() => {
              setWidgetDraft(createDefaultDraft());
              setIsWidgetDrawerOpen(true);
            }}
          >
            <Plus className="h-icon-xs w-icon-xs mr-sm" />
            Add Widget
          </Button>
        </HStack>
      </HStack>

      {widgets.length === 0 ? (
        <Card className="p-xl text-center space-y-md">
          <BarChart3 className="h-icon-2xl w-icon-2xl mx-auto color-muted" />
          <Stack spacing="sm" align="center">
            <h3 className="text-body form-label">No widgets yet</h3>
            <p className="color-muted">Add your first widget to start building your dashboard.</p>
            <Button
              onClick={() => {
                setWidgetDraft(createDefaultDraft());
                setIsWidgetDrawerOpen(true);
              }}
            >
              <Plus className="h-icon-xs w-icon-xs mr-sm" />
              Add Widget
            </Button>
          </Stack>
        </Card>
      ) : (
        <>
          {notifications.length > 0 && (
            <Card className="p-md mb-lg bg-info/10 border-info/20">
              <HStack justify="between" align="center" className="mb-sm">
                <HStack align="center" spacing="sm">
                  <Bell className="h-icon-xs w-icon-xs text-info" />
                  <h3 className="form-label text-info">Real-time Updates</h3>
                </HStack>
                <Button
                  variant="ghost"
                  onClick={() => setNotifications([])}
                  className="text-info hover:text-info/80"
                >
                  Clear All
                </Button>
              </HStack>
              <Stack spacing="sm">
                {notifications.slice(0, 3).map((notification) => (
                  <HStack key={notification.id} spacing="sm" align="center">
                    <AlertCircle className="h-3 w-3" />
                    <span>{notification.message}</span>
                    <span className="ml-auto text-body-sm text-info">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </HStack>
                ))}
              </Stack>
            </Card>
          )}

          <Grid
            cols={1}
            responsive={{ md: 2, lg: 3, xl: 4 }}
            spacing="lg"
            role="main"
            aria-label="Dashboard widgets"
          >
            {widgets.map(renderWidget)}
          </Grid>

          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-md focus:left-4 bg-accent color-accent-foreground px-md py-sm rounded-md z-50"
          >
            Skip to main content
          </a>
        </>
      )}

      {/* Widget creation drawer placeholder */}
      {isWidgetDrawerOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md p-lg m-md">
            <HStack justify="between" align="center" className="mb-md">
              <h3 className="text-body form-label">Add New Widget</h3>
              <Button
                variant="ghost"
                onClick={() => setIsWidgetDrawerOpen(false)}
                aria-label="Close widget drawer"
              >
                ×
              </Button>
            </HStack>
            <Stack spacing="md">
              <div>
                <label className="block text-body-sm form-label mb-sm">Widget Type</label>
                <select
                  className="w-full p-sm border border-border rounded-md bg-background"
                  value={widgetDraft?.type ?? 'metric'}
                  onChange={(event) =>
                    setWidgetDraft((prev) => ({
                      ...(prev ?? createDefaultDraft()),
                      type: event.target.value as DashboardWidget['type']
                    }))
                  }
                >
                  <option value="metric">Metric</option>
                  <option value="chart">Chart</option>
                  <option value="activity">Activity</option>
                  <option value="table">Table</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm form-label mb-sm">Title</label>
                <input
                  type="text"
                  className="w-full p-sm border border-border rounded-md bg-background"
                  placeholder="Enter widget title"
                  value={widgetDraft?.title ?? ''}
                  onChange={(event) =>
                    setWidgetDraft((prev) => ({
                      ...(prev ?? createDefaultDraft()),
                      title: event.target.value
                    }))
                  }
                />
              </div>
              <HStack spacing="sm" className="pt-md">
                <Button 
                  onClick={() => {
                    handleAddWidget({
                      id: widgetDraft?.id,
                      type: widgetDraft?.type ?? 'metric',
                      title: widgetDraft?.title ?? 'New Widget',
                      config: widgetDraft?.config,
                      position: widgetDraft?.position,
                      data_source: widgetDraft?.data_source,
                      refresh_interval: widgetDraft?.refresh_interval
                    });
                  }}
                  className="flex-1"
                >
                  Add Widget
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setIsWidgetDrawerOpen(false);
                    setWidgetDraft(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </HStack>
            </Stack>
          </Card>
        </div>
      )}
    </Stack>
  );
}

export default DashboardClient;
export { DashboardClient };
