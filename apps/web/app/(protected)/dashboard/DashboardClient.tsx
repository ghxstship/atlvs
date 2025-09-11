'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, Upload, Plus, Settings, Layout, Grip, BarChart3, Users, DollarSign, TrendingUp, Edit, Trash2, Bell, Activity, AlertCircle } from 'lucide-react';

// Temporary inline components to avoid import issues
const TempCard = ({ children, className, ...props }: any) => (
  <div className={`bg-card rounded-lg border shadow-sm ${className || ''}`} {...props}>
    {children}
  </div>
);

const TempButton = ({ children, variant = 'default', size = 'default', className, onClick, disabled, ...props }: any) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  const variantClasses: Record<string, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border hover:bg-muted/50',
    ghost: 'hover:bg-muted',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };
  const sizeClasses: Record<string, string> = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const TempBadge = ({ children, variant = 'default', className, ...props }: any) => {
  const variantClasses: Record<string, string> = {
    default: 'bg-primary/10 text-primary',
    secondary: 'bg-muted text-muted-foreground',
    success: 'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
    warning: 'bg-warning/10 text-warning'
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant] || variantClasses.default} ${className || ''}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Dashboard types
interface DashboardWidget {
  id: string;
  dashboard_id: string;
  type: 'metric' | 'chart' | 'activity' | 'table' | 'text';
  title: string;
  config: Record<string, any>;
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

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: Record<string, any>;
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
const fetchProjectsData = async (orgId: string) => {
  // Mock integration with Projects module
  return {
    total: 24,
    active: 18,
    completed: 6,
    budget_total: 2500000,
    budget_used: 1875000
  };
};

const fetchPeopleData = async (orgId: string) => {
  // Mock integration with People module
  return {
    total: 156,
    active: 142,
    on_leave: 8,
    contractors: 6,
    departments: ['Engineering', 'Design', 'Marketing', 'Sales']
  };
};

const fetchFinanceData = async (orgId: string) => {
  // Mock integration with Finance module
  return {
    revenue_monthly: 125000,
    expenses_monthly: 89000,
    profit_margin: 28.8,
    pending_invoices: 12,
    overdue_payments: 3
  };
};

const fetchAnalyticsData = async (orgId: string) => {
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
  name: 'Enterprise Dashboard',
  description: 'Your comprehensive business overview with real-time cross-module data',
  layout: { breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }, cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } },
  is_default: true,
  is_public: false,
  organization_id: 'mock-org',
  created_by: 'mock-user',
  widgets: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DashboardClient: React.FC<DashboardClientProps> = ({ orgId }) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [crossModuleData, setCrossModuleData] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isWidgetDrawerOpen, setIsWidgetDrawerOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);

  // Real-time notifications simulation
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
  }, []);

  // Load cross-module data
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
            value: crossModuleData.projects?.total || 24, 
            change: 12, 
            status: 'up',
            subtitle: `${crossModuleData.projects?.active || 18} active`
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
            value: crossModuleData.people?.total || 156, 
            change: -3, 
            status: 'down',
            subtitle: `${crossModuleData.people?.active || 142} active`
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
            value: crossModuleData.finance?.revenue_monthly || 125000, 
            change: 8.5, 
            status: 'up',
            subtitle: `${crossModuleData.finance?.profit_margin || 28.8}% margin`,
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

  useEffect(() => {
    if (Object.keys(crossModuleData).length > 0) {
      loadDashboard();
    }
  }, [loadDashboard]);

  const handleAddWidget = useCallback(async (widgetData: Partial<DashboardWidget>) => {
    if (!dashboard) return;

    try {
      const newWidget: DashboardWidget = {
        id: `widget-${Date.now()}`,
        dashboard_id: dashboard.id,
        type: widgetData.type || 'metric',
        title: widgetData.title || 'New Widget',
        config: widgetData.config || {},
        position: widgetData.position || { x: 0, y: 0, w: 4, h: 3 },
        data_source: widgetData.data_source,
        refresh_interval: widgetData.refresh_interval || 300,
        organization_id: orgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setWidgets(prev => [...prev, newWidget]);
      setIsWidgetDrawerOpen(false);
    } catch (err) {
      console.error('Error adding widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to add widget');
    }
  }, [dashboard, orgId]);

  const handleUpdateWidget = useCallback(async (widgetId: string, updates: Partial<DashboardWidget>) => {
    try {
      setWidgets(prev => prev.map(w => w.id === widgetId ? { ...w, ...updates, updated_at: new Date().toISOString() } : w));
      setSelectedWidget(null);
      setIsWidgetDrawerOpen(false);
    } catch (err) {
      console.error('Error updating widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to update widget');
    }
  }, []);

  const handleDeleteWidget = useCallback(async (widgetId: string) => {
    try {
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
    } catch (err) {
      console.error('Error deleting widget:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete widget');
    }
  }, []);

  const renderWidget = (widget: DashboardWidget) => {
    const commonProps = {
      key: widget.id,
      widget,
      onEdit: () => {
        setSelectedWidget(widget);
        setIsWidgetDrawerOpen(true);
      },
      onDelete: () => handleDeleteWidget(widget.id),
      orgId
    };

    switch (widget.type) {
      case 'metric':
        return (
          <TempCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-1">
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </TempButton>
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </TempButton>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {widget.config.format === 'currency' ? 
                  `$${(widget.config.value || 0).toLocaleString()}` : 
                  (widget.config.value || '0')}
              </div>
              <div className="flex items-center gap-2">
                <TempBadge variant={widget.config.status === 'up' ? 'success' : widget.config.status === 'down' ? 'destructive' : 'secondary'}>
                  {widget.config.status === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                   widget.config.status === 'down' ? <TrendingUp className="h-3 w-3 rotate-180" /> : 
                   <BarChart3 className="h-3 w-3" />}
                  {widget.config.change || '0'}%
                </TempBadge>
                {widget.config.subtitle && (
                  <span className="text-xs text-muted-foreground">{widget.config.subtitle}</span>
                )}
              </div>
            </div>
          </TempCard>
        );
      case 'chart':
        return (
          <TempCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-1">
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </TempButton>
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </TempButton>
                </div>
              )}
            </div>
            <div className="h-48 flex items-center justify-center bg-muted/50 rounded">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Chart Widget</span>
            </div>
          </TempCard>
        );
      case 'activity':
        return (
          <TempCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-1">
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </TempButton>
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </TempButton>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {widget.config.activities?.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      {activity.module && (
                        <TempBadge variant="secondary" className="text-xs">
                          {activity.module}
                        </TempBadge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TempCard>
        );
      case 'table':
        return (
          <TempCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-1">
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </TempButton>
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </TempButton>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {widget.config.headers?.map((header: string, index: number) => (
                      <th key={index} className="text-left py-2 px-3 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {widget.config.rows?.map((row: string[], index: number) => (
                    <tr key={index} className="border-b">
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="py-2 px-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TempCard>
        );
      default:
        return (
          <TempCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{widget.title}</h3>
              {editMode && (
                <div className="flex gap-1">
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </TempButton>
                  <TempButton
                    variant="ghost"
                   
                    onClick={commonProps.onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </TempButton>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">Widget content</p>
          </TempCard>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-anton uppercase">Dashboard</h1>
            <p className="text-sm opacity-80">Loading your dashboard...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <TempCard key={i} className="h-32 animate-pulse bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-anton uppercase">Dashboard</h1>
            <p className="text-sm opacity-80">Error loading dashboard</p>
          </div>
        </div>
        <TempCard className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <TempButton onClick={loadDashboard}>Retry</TempButton>
        </TempCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-anton uppercase">
            {dashboard?.name || 'Dashboard'}
          </h1>
          <p className="text-sm opacity-80">
            {dashboard?.description || 'Your personalized dashboard'}
          </p>
        </div>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <TempButton
              variant="outline"
             
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            </TempButton>
          )}
          <TempButton
            variant="outline"
            onClick={() => setEditMode(!editMode)}
          >
            <Layout className="h-4 w-4 mr-2" />
            {editMode ? 'Done' : 'Edit'}
          </TempButton>
          <TempButton onClick={() => setIsWidgetDrawerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </TempButton>
        </div>
      </div>

      {widgets.length === 0 ? (
        <TempCard className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No widgets yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first widget to start building your dashboard
          </p>
          <TempButton onClick={() => setIsWidgetDrawerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </TempButton>
        </TempCard>
      ) : (
        <>
          {/* Real-time notifications panel */}
          {notifications.length > 0 && (
            <TempCard className="p-4 mb-6 bg-info/10 border-info/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-info" />
                  <h3 className="font-medium text-info">Real-time Updates</h3>
                </div>
                <TempButton
                  variant="ghost"
                 
                  onClick={() => setNotifications([])}
                  className="text-info hover:text-info/80"
                >
                  Clear All
                </TempButton>
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-center gap-2 text-sm text-info">
                    <AlertCircle className="h-3 w-3" />
                    <span>{notification.message}</span>
                    <span className="text-xs text-info ml-auto">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </TempCard>
          )}

          {/* Dashboard widgets grid with responsive design */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            role="main"
            aria-label="Dashboard widgets"
          >
            {widgets.map(renderWidget)}
          </div>

          {/* Accessibility: Skip to content link */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
          >
            Skip to main content
          </a>
        </>
      )}

      {/* Widget creation drawer placeholder */}
      {isWidgetDrawerOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <TempCard className="w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add New Widget</h3>
              <TempButton
                variant="ghost"
               
                onClick={() => setIsWidgetDrawerOpen(false)}
              >
                ×
              </TempButton>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Widget Type</label>
                <select className="w-full p-2 border border-border rounded-md bg-background">
                  <option value="metric">Metric</option>
                  <option value="chart">Chart</option>
                  <option value="activity">Activity</option>
                  <option value="table">Table</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-border rounded-md bg-background" 
                  placeholder="Enter widget title"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <TempButton 
                  onClick={() => {
                    handleAddWidget({
                      type: 'metric',
                      title: 'New Widget',
                      config: { value: 0, change: 0, status: 'stable' }
                    });
                  }}
                  className="flex-1"
                >
                  Add Widget
                </TempButton>
                <TempButton 
                  variant="outline" 
                  onClick={() => setIsWidgetDrawerOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </TempButton>
              </div>
            </div>
          </TempCard>
        </div>
      )}
    </div>
  );
};

export default DashboardClient;
