'use client';

import { Plus, Filter, Download, Settings, RefreshCw, Grid3X3, List, BarChart3, Calendar, Eye, EyeOff, Maximize2 } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@ghxstship/ui';
import EnhancedMetricWidget from '../widgets/EnhancedMetricWidget';
import EnhancedChartWidget from '../widgets/EnhancedChartWidget';
import EnhancedActivityWidget from '../widgets/EnhancedActivityWidget';
import { DashboardService } from '../lib/dashboard-service';
import type { 
 ModuleOverviewConfig, 
 OverviewMetric, 
 ActivityItem, 
 DashboardWidget,
 DataSource
} from '../types';

interface OverviewTemplateProps {
 orgId: string;
 userId: string;
 userEmail: string;
 module: DataSource;
 config: ModuleOverviewConfig;
 customWidgets?: DashboardWidget[];
 onNavigate?: (path: string) => void;
}

type ViewMode = 'grid' | 'list' | 'compact';

export default function OverviewTemplate({
 orgId,
 userId,
 userEmail,
 module,
 config,
 customWidgets = [],
 onNavigate
}: OverviewTemplateProps) {
 const [metrics, setMetrics] = useState<OverviewMetric[]>([]);
 const [activities, setActivities] = useState<ActivityItem[]>([]);
 const [widgets, setWidgets] = useState<DashboardWidget[]>(customWidgets);
 const [isLoading, setIsLoading] = useState(true);
 const [viewMode, setViewMode] = useState<ViewMode>('grid');
 const [showFilters, setShowFilters] = useState(false);
 const [isRefreshing, setIsRefreshing] = useState(false);

 const dashboardService = new DashboardService();

 useEffect(() => {
 loadOverviewData();
 }, [orgId, module]);

 const loadOverviewData = async () => {
 setIsLoading(true);
 try {
 const [metricsData, activitiesData] = await Promise.all([
 dashboardService.getOverviewMetrics(orgId, module),
 dashboardService.getRecentActivity(orgId, 10)
 ]);

 setMetrics(metricsData);
 setActivities(activitiesData.filter(a => a.type === module || module === 'analytics'));
 } catch (error) {
 console.error('Failed to load overview data:', error);
 } finally {
 setIsLoading(false);
 }
 };

 const handleRefresh = async () => {
 setIsRefreshing(true);
 await loadOverviewData();
 setIsRefreshing(false);
 };

 const handleQuickAction = (action: string, href?: string) => {
 if (href && onNavigate) {
 onNavigate(href);
 }
 };

 const renderMetricsGrid = () => (
 <div className={`grid gap-md ${
 viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
 viewMode === 'list' ? 'grid-cols-1' :
 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
 }`}>
 {metrics.map((metric) => (
 <EnhancedMetricWidget
 key={metric.id}
 widget={{
 id: metric.id,
 dashboard_id: '',
 type: 'metric',
 title: metric.label,
 config: {
 value: metric.value,
 format: metric.format,
 change: metric.change,
 change_type: metric.change_type,
 target: metric.target,
 status: metric.status
 },
 position: { x: 0, y: 0, w: 1, h: 1 },
 refresh_interval: '5_minutes',
 is_visible: true,
 organization_id: orgId,
 created_by: userId,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 }}
 metric={metric}
 isLoading={isLoading}
 />
 ))}
 </div>
 );

 const renderQuickActions = () => (
 <Card className="p-lg">
 <div className="space-y-md">
 <h3 className="font-semibold text-foreground flex items-center space-x-sm">
 <Plus className="w-4 h-4" />
 <span>Quick Actions</span>
 </h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
 {config.quick_actions.map((action, index) => (
 <Button
 key={index}
 variant="outline"
 size="sm"
 onClick={() => handleQuickAction(action.action, action.href)}
 className="justify-start space-x-xs"
 >
 <span className="text-lg">{action.icon}</span>
 <span className="text-xs">{action.label}</span>
 </Button>
 ))}
 </div>
 </div>
 </Card>
 );

 const renderCustomWidgets = () => {
 if (widgets.length === 0) return null;

 return (
 <div className="space-y-md">
 <h3 className="font-semibold text-foreground">Custom Widgets</h3>
 <div className={`grid gap-md ${
 viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' :
 'grid-cols-1'
 }`}>
 {widgets.map((widget) => {
 switch (widget.type) {
 case 'metric':
 case 'kpi_card':
 return (
 <EnhancedMetricWidget
 key={widget.id}
 widget={widget}
 isLoading={isLoading}
 />
 );
 case 'bar_chart':
 case 'line_chart':
 case 'pie_chart':
 return (
 <EnhancedChartWidget
 key={widget.id}
 widget={widget}
 isLoading={isLoading}
 />
 );
 case 'activity_feed':
 return (
 <EnhancedActivityWidget
 key={widget.id}
 widget={widget}
 activities={activities}
 isLoading={isLoading}
 />
 );
 default:
 return null;
 }
 })}
 </div>
 </div>
 );
 };

 return (
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-md">
 <div className={`p-sm rounded-lg bg-${config.color}-100`}>
 <span className="text-2xl">{config.icon}</span>
 </div>
 <div>
 <h1 className="text-heading-2 font-anton uppercase text-foreground">
 {config.display_name}
 </h1>
 <p className="text-muted-foreground">{config.description}</p>
 </div>
 </div>
 
 <div className="flex items-center space-x-sm">
 {/* View Mode Toggle */}
 <div className="flex items-center space-x-xs bg-muted rounded-lg p-xs">
 <Button
 variant={viewMode === 'grid' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('grid')}
 className="p-xs"
 >
 <Grid3X3 className="w-4 h-4" />
 </Button>
 <Button
 variant={viewMode === 'list' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('list')}
 className="p-xs"
 >
 <List className="w-4 h-4" />
 </Button>
 <Button
 variant={viewMode === 'compact' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setViewMode('compact')}
 className="p-xs"
 >
 <BarChart3 className="w-4 h-4" />
 </Button>
 </div>

 {/* Actions */}
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setShowFilters(!showFilters)}
 className="p-xs"
 >
 <Filter className="w-4 h-4" />
 </Button>
 
 <Button
 variant="ghost"
 size="sm"
 onClick={handleRefresh}
 disabled={isRefreshing}
 className="p-xs"
 >
 <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
 </Button>

 <Button
 variant="ghost"
 size="sm"
 className="p-xs"
 >
 <Download className="w-4 h-4" />
 </Button>

 <Button
 variant="ghost"
 size="sm"
 className="p-xs"
 >
 <Settings className="w-4 h-4" />
 </Button>
 </div>
 </div>

 {/* Filters (if shown) */}
 {showFilters && (
 <Card className="p-md">
 <div className="flex items-center space-x-md">
 <span className="text-sm font-medium">Filters:</span>
 <div className="flex items-center space-x-sm">
 <Badge variant="secondary">Last 30 days</Badge>
 <Badge variant="secondary">All statuses</Badge>
 <Button variant="ghost" size="sm" className="text-xs">
 Clear all
 </Button>
 </div>
 </div>
 </Card>
 )}

 {/* Key Metrics */}
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-semibold text-foreground">Key Metrics</h2>
 <Badge variant="outline" className="text-xs">
 {metrics.length} metrics
 </Badge>
 </div>
 {renderMetricsGrid()}
 </div>

 {/* Quick Actions */}
 {config.quick_actions.length > 0 && renderQuickActions()}

 {/* Custom Widgets */}
 {renderCustomWidgets()}

 {/* Recent Activity */}
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onNavigate && onNavigate(`/${module}/activity`)}
 className="text-xs"
 >
 View All Activity
 </Button>
 </div>
 <EnhancedActivityWidget
 widget={{
 id: 'activity-feed',
 dashboard_id: '',
 type: 'activity_feed',
 title: 'Recent Activity',
 config: { limit: 10 },
 position: { x: 0, y: 0, w: 1, h: 1 },
 refresh_interval: '1_minute',
 is_visible: true,
 organization_id: orgId,
 created_by: userId,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 }}
 activities={activities}
 isLoading={isLoading}
 onViewAll={() => onNavigate && onNavigate(`/${module}/activity`)}
 />
 </div>

 {/* Performance Stats */}
 <Card className="p-md">
 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span>
 Last updated: {new Date().toLocaleTimeString()}
 </span>
 <span>
 {metrics.length} metrics • {activities.length} activities • {widgets.length} widgets
 </span>
 </div>
 </Card>
 </div>
 );
}
