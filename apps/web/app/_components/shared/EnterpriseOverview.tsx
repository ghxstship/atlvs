"use client";

import { TrendingUp, TrendingDown, Minus, ArrowRight, MoreVertical, Download, RefreshCw, Settings, Eye, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Info, type LucideIcon } from "lucide-react";
import { ReactNode, useMemo } from "react";
import { Card, Badge, Button, Progress } from "@ghxstship/ui";
import { useRouter } from "next/navigation";
import { format, parseISO, formatDistanceToNow } from "date-fns";

// Types for the enterprise overview system
export interface MetricCard {
 id: string;
 title: string;
 value: string | number;
 subtitle?: string;
 change?: number;
 changeLabel?: string;
 icon: LucideIcon;
 iconColor?: string;
 trend?: "up" | "down" | "neutral";
 onClick?: () => void;
 loading?: boolean;
}

export interface ChartData {
 labels: string[];
 datasets: Array<{
 label: string;
 data: number[];
 color?: string;
 }>;
}

export interface ActivityItem {
 id: string;
 title: string;
 description?: string;
 timestamp: string;
 type: "create" | "update" | "delete" | "status" | "comment" | "other";
 user?: {
 name: string;
 avatar?: string;
 };
 metadata?: Record<string, unknown>;
 onClick?: () => void;
}

export interface QuickAction {
 id: string;
 label: string;
 icon: LucideIcon;
 onClick: () => void;
 variant?: "default" | "outline" | "destructive" | "secondary";
 disabled?: boolean;
}

export interface StatusItem {
 id: string;
 label: string;
 count: number;
 percentage?: number;
 color?: string;
 icon?: LucideIcon;
 onClick?: () => void;
}

export interface OverviewSection {
 id: string;
 title: string;
 description?: string;
 content: ReactNode;
 actions?: ReactNode;
 collapsible?: boolean;
 defaultCollapsed?: boolean;
}

interface EnterpriseOverviewProps {
 title: string;
 description?: string;
 metrics?: MetricCard[];
 statusBreakdown?: StatusItem[];
 recentActivity?: ActivityItem[];
 quickActions?: QuickAction[];
 customSections?: OverviewSection[];
 onRefresh?: () => void;
 onExport?: () => void;
 onSettings?: () => void;
 loading?: boolean;
 emptyState?: {
 title: string;
 description: string;
 icon?: LucideIcon;
 actions?: ReactNode;
 };
}

export default function EnterpriseOverview({
 title,
 description,
 metrics = [],
 statusBreakdown = [],
 recentActivity = [],
 quickActions = [],
 customSections = [],
 onRefresh,
 onExport,
 onSettings,
 loading = false,
 emptyState,
}: EnterpriseOverviewProps) {
 const router = useRouter();

 // Calculate total for status breakdown
 const statusTotal = useMemo(() => {
 return statusBreakdown.reduce((sum, item) => sum + item.count, 0);
 }, [statusBreakdown]);

 // Get trend icon
 const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
 switch (trend) {
 case "up":
 return TrendingUp;
 case "down":
 return TrendingDown;
 default:
 return Minus;
 }
 };

 // Get activity type icon
 const getActivityIcon = (type: ActivityItem["type"]) => {
 switch (type) {
 case "create":
 return CheckCircle;
 case "update":
 return RefreshCw;
 case "delete":
 return XCircle;
 case "status":
 return Info;
 default:
 return Clock;
 }
 };

 // Format metric value
 const formatMetricValue = (value: string | number): string => {
 if (typeof value === "number") {
 if (value >= 1000000) {
 return `${(value / 1000000).toFixed(1)}M`;
 } else if (value >= 1000) {
 return `${(value / 1000).toFixed(1)}K`;
 }
 return value.toLocaleString();
 }
 return value;
 };

 // Show empty state if no data
 if (!loading && emptyState && metrics.length === 0 && statusBreakdown.length === 0) {
 const EmptyIcon = emptyState.icon || AlertTriangle;
 return (
 <div className="flex flex-col items-center justify-center min-h-content-lg text-center">
 <EmptyIcon className="h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">{emptyState.title}</h3>
 <p className="text-muted-foreground mb-md max-w-md">{emptyState.description}</p>
 {emptyState.actions}
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold">{title}</h1>
 {description && <p className="text-muted-foreground mt-xs">{description}</p>}
 </div>
 <div className="flex items-center gap-sm">
 {onExport && (
 <Button variant="outline" size="sm" onClick={onExport}>
 <Download className="h-icon-xs w-icon-xs mr-xs" />
 Export
 </Button>
 )}
 {onRefresh && (
 <Button variant="outline" size="sm" onClick={onRefresh}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-xs" />
 Refresh
 </Button>
 )}
 {onSettings && (
 <Button variant="outline" size="sm" onClick={onSettings}>
 <Settings className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 </div>
 </div>

 {/* Metrics Grid */}
 {metrics.length > 0 && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
 {metrics.map((metric) => {
 const TrendIcon = getTrendIcon(metric.trend);
 return (
 <Card
 key={metric.id}
 className={`p-md ${metric.onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
 onClick={metric.onClick}
 >
 {metric.loading ? (
 <div className="animate-pulse">
 <div className="h-icon-xs bg-muted rounded w-1/2 mb-sm"></div>
 <div className="h-icon-lg bg-muted rounded w-3/4"></div>
 </div>
 ) : (
 <>
 <div className="flex items-center justify-between mb-sm">
 <p className="text-sm text-muted-foreground">{metric.title}</p>
 <metric.icon className={`h-icon-sm w-icon-sm ${metric.iconColor || "text-muted-foreground"}`} />
 </div>
 <div className="flex items-baseline gap-sm">
 <p className="text-2xl font-bold">{formatMetricValue(metric.value)}</p>
 {metric.change !== undefined && (
 <div className={`flex items-center gap-xs text-sm ${
 metric.trend === "up" ? "text-success" : 
 metric.trend === "down" ? "text-destructive" : 
 "text-muted-foreground"
 }`}>
 <TrendIcon className="h-3 w-3" />
 <span>{metric.change > 0 ? "+" : ""}{metric.change}%</span>
 </div>
 )}
 </div>
 {metric.subtitle && (
 <p className="text-xs text-muted-foreground mt-xs">{metric.subtitle}</p>
 )}
 {metric.changeLabel && (
 <p className="text-xs text-muted-foreground mt-xs">{metric.changeLabel}</p>
 )}
 </>
 )}
 </Card>
 );
 })}
 </div>
 )}

 {/* Main Content Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
 {/* Status Breakdown */}
 {statusBreakdown.length > 0 && (
 <Card className="p-lg">
 <h3 className="font-semibold mb-md">Status Breakdown</h3>
 <div className="space-y-sm">
 {statusBreakdown.map((item) => {
 const percentage = statusTotal > 0 ? (item.count / statusTotal) * 100 : 0;
 const StatusIcon = item.icon;
 return (
 <div
 key={item.id}
 className={`${item.onClick ? "cursor-pointer hover:bg-muted/50 -mx-sm px-sm py-xs rounded" : ""}`}
 onClick={item.onClick}
 >
 <div className="flex items-center justify-between mb-xs">
 <div className="flex items-center gap-xs">
 {StatusIcon && <StatusIcon className="h-icon-xs w-icon-xs" style={{ color: item.color }} />}
 <span className="text-sm font-medium">{item.label}</span>
 </div>
 <div className="flex items-center gap-xs">
 <span className="text-sm font-semibold">{item.count}</span>
 {item.percentage !== undefined && (
 <span className="text-xs text-muted-foreground">({item.percentage.toFixed(0)}%)</span>
 )}
 </div>
 </div>
 <Progress value={percentage} className="h-2" style={{ "--progress-color": item.color } as unknown} />
 </div>
 );
 })}
 </div>
 {statusTotal > 0 && (
 <div className="mt-md pt-md border-t">
 <div className="flex items-center justify-between">
 <span className="text-sm text-muted-foreground">Total</span>
 <span className="font-semibold">{statusTotal}</span>
 </div>
 </div>
 )}
 </Card>
 )}

 {/* Recent Activity */}
 {recentActivity.length > 0 && (
 <Card className="p-lg lg:col-span-2">
 <div className="flex items-center justify-between mb-md">
 <h3 className="font-semibold">Recent Activity</h3>
 <Button variant="outline" size="sm" onClick={() => router.push(`${window.location.pathname}/activity`)}>
 View All
 <ArrowRight className="h-3 w-3 ml-xs" />
 </Button>
 </div>
 <div className="space-y-sm max-h-content-lg overflow-y-auto">
 {recentActivity.map((activity) => {
 const ActivityIcon = getActivityIcon(activity.type);
 return (
 <div
 key={activity.id}
 className={`flex items-start gap-sm ${
 activity.onClick ? "cursor-pointer hover:bg-muted/50 -mx-sm px-sm py-xs rounded" : ""
 }`}
 onClick={activity.onClick}
 >
 <div className="mt-xs">
 <ActivityIcon className="h-icon-xs w-icon-xs text-muted-foreground" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium">{activity.title}</p>
 {activity.description && (
 <p className="text-xs text-muted-foreground mt-xs">{activity.description}</p>
 )}
 <div className="flex items-center gap-sm mt-xs">
 {activity.user && (
 <span className="text-xs text-muted-foreground">{activity.user.name}</span>
 )}
 <span className="text-xs text-muted-foreground">
 {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
 </span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 )}
 </div>

 {/* Quick Actions */}
 {quickActions.length > 0 && (
 <Card className="p-lg">
 <h3 className="font-semibold mb-md">Quick Actions</h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-sm">
 {quickActions.map((action) => (
 <Button
 key={action.id}
 variant={action.variant || "outline"}
 onClick={action.onClick}
 disabled={action.disabled}
 className="h-auto py-md flex flex-col items-center gap-xs"
 >
 <action.icon className="h-icon-sm w-icon-sm" />
 <span className="text-xs">{action.label}</span>
 </Button>
 ))}
 </div>
 </Card>
 )}

 {/* Custom Sections */}
 {customSections.map((section) => (
 <Card key={section.id} className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <div>
 <h3 className="font-semibold">{section.title}</h3>
 {section.description && (
 <p className="text-sm text-muted-foreground mt-xs">{section.description}</p>
 )}
 </div>
 {section.actions}
 </div>
 {section.content}
 </Card>
 ))}
 </div>
 );
}
