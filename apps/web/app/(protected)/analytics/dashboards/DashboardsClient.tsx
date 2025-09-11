'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { StandardButton } from '../../components/ui/StandardButton';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Activity,
  Settings,
  Eye,
  Copy,
  Share2,
  Download,
  LayoutGrid,
  Layout
} from 'lucide-react';
import CreateDashboardClient from './CreateDashboardClient';

interface Widget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'gauge';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: Record<string, any>;
  data?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Dashboard {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  widgets: Widget[];
  layout: 'grid' | 'freeform';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface DashboardsClientProps {
  organizationId: string;
  translations: Record<string, string>;
}

export default function DashboardsClient({ organizationId, translations }: DashboardsClientProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateDashboard, setShowCreateDashboard] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadDashboards();
  }, [organizationId]);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dashboards from API
      const response = await fetch('/api/v1/analytics/dashboards', {
        headers: {
          'x-org-id': organizationId
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboards');
      }

      const data = await response.json();
      setDashboards(data.dashboards || []);

      // Fallback to mock data if no dashboards exist
      if (data.dashboards?.length === 0) {
        const mockDashboards: Dashboard[] = [
        {
          id: '1',
          organizationId,
          name: 'Executive Overview',
          description: 'High-level metrics and KPIs for leadership team',
          isPublic: true,
          layout: 'grid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1',
          widgets: [
            {
              id: 'w1',
              title: 'Revenue Trend',
              type: 'chart',
              chartType: 'line',
              size: 'large',
              position: { x: 0, y: 0 },
              config: { timeRange: '30d', currency: 'USD' },
              data: [
                { date: '2024-01-01', value: 45000 },
                { date: '2024-01-02', value: 52000 },
                { date: '2024-01-03', value: 48000 },
                { date: '2024-01-04', value: 61000 },
                { date: '2024-01-05', value: 55000 }
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'w2',
              title: 'Active Projects',
              type: 'metric',
              size: 'small',
              position: { x: 1, y: 0 },
              config: { format: 'number' },
              data: [{ value: 24, change: 12.5, changeType: 'increase' }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'w3',
              title: 'Team Performance',
              type: 'chart',
              chartType: 'bar',
              size: 'medium',
              position: { x: 0, y: 1 },
              config: { groupBy: 'department' },
              data: [
                { category: 'Production', value: 85 },
                { category: 'Creative', value: 92 },
                { category: 'Technical', value: 78 },
                { category: 'Management', value: 88 }
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        {
          id: '2',
          organizationId,
          name: 'Financial Dashboard',
          description: 'Revenue, expenses, and financial health metrics',
          isPublic: false,
          layout: 'grid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1',
          widgets: [
            {
              id: 'w4',
              title: 'Monthly Revenue',
              type: 'metric',
              size: 'small',
              position: { x: 0, y: 0 },
              config: { format: 'currency' },
              data: [{ value: 125000, change: 8.3, changeType: 'increase' }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'w5',
              title: 'Expense Breakdown',
              type: 'chart',
              chartType: 'pie',
              size: 'medium',
              position: { x: 1, y: 0 },
              config: { showLabels: true },
              data: [
                { category: 'Payroll', value: 45000 },
                { category: 'Equipment', value: 15000 },
                { category: 'Marketing', value: 8000 },
                { category: 'Operations', value: 12000 }
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      ];

        setDashboards(mockDashboards);
        if (mockDashboards.length > 0) {
          setSelectedDashboard(mockDashboards[0]);
        }
      }

    } catch (err) {
      console.error('Error loading dashboards:', err);
      setError('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const createDashboard = async (name: string, description: string) => {
    try {
      const newDashboard: Dashboard = {
        id: crypto.randomUUID(),
        organizationId,
        name,
        description,
        isPublic: false,
        layout: 'grid',
        widgets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user'
      };

      setDashboards(prev => [...prev, newDashboard]);
      setSelectedDashboard(newDashboard);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating dashboard:', err);
      setError('Failed to create dashboard');
    }
  };

  const deleteDashboard = async (dashboardId: string) => {
    try {
      setDashboards(prev => prev.filter(d => d.id !== dashboardId));
      if (selectedDashboard?.id === dashboardId) {
        const remaining = dashboards.filter(d => d.id !== dashboardId);
        setSelectedDashboard(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Error deleting dashboard:', err);
      setError('Failed to delete dashboard');
    }
  };

  const addWidget = (type: Widget['type'], chartType?: Widget['chartType']) => {
    if (!selectedDashboard) return;

    const newWidget: Widget = {
      id: crypto.randomUUID(),
      title: `New ${type} Widget`,
      type,
      chartType,
      size: 'medium',
      position: { x: 0, y: selectedDashboard.widgets.length },
      config: {},
      data: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedDashboard = {
      ...selectedDashboard,
      widgets: [...selectedDashboard.widgets, newWidget],
      updatedAt: new Date().toISOString()
    };

    setSelectedDashboard(updatedDashboard);
    setDashboards(prev => prev.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
    setEditingWidget(newWidget);
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    if (!selectedDashboard) return;

    const updatedWidgets = selectedDashboard.widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
    );

    const updatedDashboard = {
      ...selectedDashboard,
      widgets: updatedWidgets,
      updatedAt: new Date().toISOString()
    };

    setSelectedDashboard(updatedDashboard);
    setDashboards(prev => prev.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
  };

  const deleteWidget = (widgetId: string) => {
    if (!selectedDashboard) return;

    const updatedWidgets = selectedDashboard.widgets.filter(w => w.id !== widgetId);
    const updatedDashboard = {
      ...selectedDashboard,
      widgets: updatedWidgets,
      updatedAt: new Date().toISOString()
    };

    setSelectedDashboard(updatedDashboard);
    setDashboards(prev => prev.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
  };

  const getWidgetIcon = (widget: Widget) => {
    if (widget.type === 'chart') {
      switch (widget.chartType) {
        case 'bar': return BarChart3;
        case 'line': return LineChart;
        case 'pie': return PieChart;
        default: return BarChart3;
      }
    }
    switch (widget.type) {
      case 'metric': return TrendingUp;
      case 'table': return LayoutGrid;
      case 'gauge': return Activity;
      default: return BarChart3;
    }
  };

  const renderWidget = (widget: Widget) => {
    const IconComponent = getWidgetIcon(widget);
    
    return (
      <Card key={widget.id} className={`p-4 ${widget.size === 'small' ? 'col-span-1' : widget.size === 'large' ? 'col-span-2' : 'col-span-1'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <IconComponent className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{widget.title}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
             
              onClick={() => setEditingWidget(widget)}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
             
              onClick={() => deleteWidget(widget.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="h-32 bg-muted/50 rounded flex items-center justify-center">
          {widget.type === 'metric' && widget.data?.[0] ? (
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {widget.config.format === 'currency' ? `$${widget.data[0].value.toLocaleString()}` : widget.data[0].value}
              </div>
              <div className="text-sm text-success">
                +{widget.data[0].change}% vs last period
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <IconComponent className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm">Chart Preview</div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card title="Error">
        <div className="text-sm text-destructive">{error}</div>
        <Button onClick={loadDashboards} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboards</h1>
          <p className="text-sm text-muted-foreground">Create and manage custom analytics dashboards</p>
        </div>
        <StandardButton onClick={() => setShowCreateDashboard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Dashboard
        </StandardButton>
      </div>

      {/* Dashboard Selector */}
      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        {dashboards.map((dashboard) => (
          <button
            key={dashboard.id}
            onClick={() => setSelectedDashboard(dashboard)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-colors ${
              selectedDashboard?.id === dashboard.id
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-background border-border text-foreground hover:bg-muted'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Layout className="h-4 w-4" />
              <span className="text-sm font-medium">{dashboard.name}</span>
              {dashboard.isPublic && (
                <Badge variant="outline" className="text-xs">Public</Badge>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedDashboard && (
        <>
          {/* Dashboard Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedDashboard.name}
              </h2>
              {selectedDashboard.description && (
                <span className="text-sm text-muted-foreground">
                  — {selectedDashboard.description}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Add Widget Bar */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Add Widget:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                 
                  onClick={() => addWidget('chart', 'bar')}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Bar Chart
                </Button>
                <Button
                  variant="outline"
                 
                  onClick={() => addWidget('chart', 'line')}
                >
                  <LineChart className="h-4 w-4 mr-1" />
                  Line Chart
                </Button>
                <Button
                  variant="outline"
                 
                  onClick={() => addWidget('chart', 'pie')}
                >
                  <PieChart className="h-4 w-4 mr-1" />
                  Pie Chart
                </Button>
                <Button
                  variant="outline"
                 
                  onClick={() => addWidget('metric')}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Metric
                </Button>
              </div>
            </div>
          </Card>

          {/* Dashboard Grid */}
          {selectedDashboard.widgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDashboard.widgets.map(renderWidget)}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No widgets yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first widget to start building your dashboard
              </p>
              <Button onClick={() => addWidget('metric')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </Card>
          )}
        </>
      )}

      {/* Create Dashboard Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Dashboard</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const description = formData.get('description') as string;
                createDashboard(name, description);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Dashboard Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Sales Dashboard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Brief description of this dashboard..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Dashboard
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Dashboard Modal */}
      {showCreateDashboard && (
        <CreateDashboardClient
          organizationId={organizationId}
          onSuccess={(dashboard) => {
            setDashboards([...dashboards, dashboard]);
            setSelectedDashboard(dashboard);
            setShowCreateDashboard(false);
          }}
          onCancel={() => setShowCreateDashboard(false)}
        />
      )}
    </div>
  );
}
