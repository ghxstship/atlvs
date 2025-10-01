'use client';

import { Calendar, Users, Building, Music, FileText, Clock, TrendingUp, ArrowRight, Activity, BarChart3 } from "lucide-react";
import { useMemo } from 'react';
import { Badge, Button, Card, Skeleton } from '@ghxstship/ui';
import Link from 'next/link';
import type { ProgrammingOverviewData } from '../types';

interface QuickAction {
 id: string;
 title: string;
 description: string;
 icon: string;
 href: string;
 color: string;
}

interface ProgrammingOverviewDashboardViewProps {
 data: ProgrammingOverviewData;
 loading: boolean;
 quickActions: readonly QuickAction[];
 selectedItems: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (ids: string[], selected: boolean) => void;
}

const iconMap = {
 CalendarPlus: Calendar,
 Building: Building,
 GraduationCap: Users,
 Users: Users,
 FileText: FileText,
 ClipboardList: FileText,
};

export default function ProgrammingOverviewDashboardView({
 data,
 loading,
 quickActions,
 selectedItems,
 onSelectItem,
 onSelectAll,
}: ProgrammingOverviewDashboardViewProps) {
 const statsCards = useMemo(() => [
 {
 title: 'Total Events',
 value: data.stats.totalEvents,
 change: '+12%',
 trend: 'up' as const,
 icon: Calendar,
 color: 'text-blue-600',
 bgColor: 'bg-blue-50',
 },
 {
 title: 'Available Spaces',
 value: data.stats.availableSpaces,
 change: '+5%',
 trend: 'up' as const,
 icon: Building,
 color: 'text-purple-600',
 bgColor: 'bg-purple-50',
 },
 {
 title: 'Active Workshops',
 value: data.stats.activeWorkshops,
 change: '+8%',
 trend: 'up' as const,
 icon: Users,
 color: 'text-green-600',
 bgColor: 'bg-green-50',
 },
 {
 title: 'Total Revenue',
 value: `$${data.stats.totalRevenue.toLocaleString()}`,
 change: '+15%',
 trend: 'up' as const,
 icon: TrendingUp,
 color: 'text-emerald-600',
 bgColor: 'bg-emerald-50',
 },
 {
 title: 'Total Participants',
 value: data.stats.totalParticipants,
 change: '+10%',
 trend: 'up' as const,
 icon: Users,
 color: 'text-orange-600',
 bgColor: 'bg-orange-50',
 },
 {
 title: 'Pending Riders',
 value: data.stats.pendingRiders,
 change: '-3%',
 trend: 'down' as const,
 icon: FileText,
 color: 'text-yellow-600',
 bgColor: 'bg-yellow-50',
 },
 ], [data.stats]);

 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
 {Array.from({ length: 6 }).map((_, i) => (
 <Card key={i} className="p-lg">
 <Skeleton className="h-icon-xs w-component-lg mb-2" />
 <Skeleton className="h-icon-lg w-component-md mb-2" />
 <Skeleton className="h-3 w-icon-2xl" />
 </Card>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
 {statsCards.map((stat, index) => {
 const Icon = stat.icon;
 return (
 <Card key={index} className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground">
 {stat.title}
 </p>
 <p className="text-2xl font-bold">{stat.value}</p>
 <div className="flex items-center mt-1">
 <span
 className={`text-sm font-medium ${
 stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
 }`}
 >
 {stat.change}
 </span>
 <span className="text-sm text-muted-foreground ml-1">
 vs last month
 </span>
 </div>
 </div>
 <div className={`p-sm rounded-lg ${stat.bgColor}`}>
 <Icon className={`h-icon-md w-icon-md ${stat.color}`} />
 </div>
 </div>
 </Card>
 );
 })}
 </div>

 {/* Quick Actions */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold">Quick Actions</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {quickActions.map((action) => {
 const IconComponent = iconMap[action.icon as keyof typeof iconMap] || Calendar;
 return (
 <Link key={action.id} href={action.href as any as any}>
 <Card className={`p-md cursor-pointer transition-colors ${action.color}`}>
 <div className="flex items-start gap-sm">
 <IconComponent className="h-icon-sm w-icon-sm mt-0.5 text-current" />
 <div className="flex-1">
 <h4 className="font-medium text-sm">{action.title}</h4>
 <p className="text-xs text-muted-foreground mt-1">
 {action.description}
 </p>
 </div>
 <ArrowRight className="h-icon-xs w-icon-xs text-muted-foreground" />
 </div>
 </Card>
 </Link>
 );
 })}
 </div>
 </Card>

 {/* Recent Activity & Upcoming Events */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {/* Recent Activity */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold flex items-center gap-xs">
 <Activity className="h-icon-sm w-icon-sm" />
 Recent Activity
 </h3>
 <Button variant="ghost" size="sm">
 View All
 </Button>
 </div>
 <div className="space-y-sm">
 {data.recentActivity.slice(0, 5).map((activity) => (
 <div key={activity.id} className="flex items-start gap-sm p-sm rounded-lg bg-muted/50">
 <div className="w-2 h-2 rounded-full bg-primary mt-2" />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium truncate">{activity.title}</p>
 <p className="text-xs text-muted-foreground">
 {activity.action} by {activity.user_name}
 </p>
 <p className="text-xs text-muted-foreground">
 {new Date(activity.timestamp).toLocaleDateString()}
 </p>
 </div>
 <Badge variant="secondary" className="text-xs">
 {activity.type}
 </Badge>
 </div>
 ))}
 </div>
 </Card>

 {/* Upcoming Events */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm" />
 Upcoming Events
 </h3>
 <Button variant="ghost" size="sm">
 View All
 </Button>
 </div>
 <div className="space-y-sm">
 {data.upcomingEvents.slice(0, 5).map((event) => (
 <div key={event.id} className="flex items-start gap-sm p-sm rounded-lg bg-muted/50">
 <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium truncate">{event.title}</p>
 <p className="text-xs text-muted-foreground">
 {event.location} • {event.venue}
 </p>
 <p className="text-xs text-muted-foreground">
 {new Date(event.start_date).toLocaleDateString()}
 </p>
 </div>
 <Badge variant="outline" className="text-xs">
 {event.kind}
 </Badge>
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Module Metrics */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold flex items-center gap-xs">
 <BarChart3 className="h-icon-sm w-icon-sm" />
 Module Performance
 </h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-md">
 {Object.entries(data.moduleMetrics).map(([module, metrics]) => (
 <div key={module} className="text-center p-md rounded-lg bg-muted/50">
 <h4 className="font-medium text-sm capitalize mb-2">{module}</h4>
 <p className="text-2xl font-bold">{metrics.total}</p>
 <p className="text-xs text-muted-foreground">
 {metrics.active || metrics.scheduled || 0} active
 </p>
 <div className="mt-2">
 <div className="w-full bg-muted rounded-full h-2">
 <div
 className="bg-primary h-2 rounded-full"
 style={{
 width: `${Math.min(100, (metrics.completion_rate || 0))}%`,
 }}
 />
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 {Math.round(metrics.completion_rate || 0)}% complete
 </p>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
}
