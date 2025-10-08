'use client';

import { Clock, Calendar, Users, Building, Music, FileText, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { useMemo } from 'react';
import { Badge, Card, Skeleton } from '@ghxstship/ui';
import type { ActivityItem } from '../types';

interface ProgrammingOverviewTimelineViewProps {
 activity: ActivityItem[];
 loading: boolean;
}

const actionIcons = {
 created: Plus,
 updated: Edit,
 deleted: Trash2,
 approved: CheckCircle,
 cancelled: XCircle,
 completed: CheckCircle
};

const actionColors = {
 created: 'text-green-600 bg-green-50',
 updated: 'text-blue-600 bg-blue-50',
 deleted: 'text-red-600 bg-red-50',
 approved: 'text-green-600 bg-green-50',
 cancelled: 'text-red-600 bg-red-50',
 completed: 'text-purple-600 bg-purple-50'
};

const typeIcons = {
 event: Calendar,
 workshop: Users,
 performance: Music,
 rider: FileText,
 space: Building,
 lineup: Music,
 call_sheet: FileText,
 itinerary: Calendar
};

const typeColors = {
 event: 'bg-blue-100 text-blue-800',
 workshop: 'bg-green-100 text-green-800',
 performance: 'bg-red-100 text-red-800',
 rider: 'bg-yellow-100 text-yellow-800',
 space: 'bg-purple-100 text-purple-800',
 lineup: 'bg-pink-100 text-pink-800',
 call_sheet: 'bg-indigo-100 text-indigo-800',
 itinerary: 'bg-teal-100 text-teal-800'
};

export default function ProgrammingOverviewTimelineView({
 activity,
 loading
}: ProgrammingOverviewTimelineViewProps) {
 const groupedActivity = useMemo(() => {
 const groups: Record<string, ActivityItem[]> = {};
 
 activity.forEach((item) => {
 const date = new Date(item.timestamp).toDateString();
 if (!groups[date]) {
 groups[date] = [];
 }
 groups[date].push(item);
 });

 return Object.entries(groups)
 .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
 .map(([date, items]) => ({
 date,
 items: items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
 }));
 }, [activity]);

 if (loading) {
 return (
 <div className="space-y-lg">
 {Array.from({ length: 3 }).map((_, i) => (
 <Card key={i} className="p-lg">
 <Skeleton className="h-icon-xs w-component-xl mb-4" />
 <div className="space-y-sm">
 {Array.from({ length: 4 }).map((_, j) => (
 <div key={j} className="flex items-start gap-sm">
 <Skeleton className="h-icon-lg w-icon-lg rounded-full" />
 <div className="flex-1">
 <Skeleton className="h-icon-xs w-container-xs mb-2" />
 <Skeleton className="h-3 w-component-xl" />
 </div>
 </div>
 ))}
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (activity.length === 0) {
 return (
 <Card className="p-xsxl text-center">
 <Clock className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
 <p className="text-muted-foreground">
 Activity across programming modules will appear here as it happens.
 </p>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 {groupedActivity.map(({ date, items }) => (
 <Card key={date} className="p-lg">
 <div className="flex items-center gap-xs mb-4">
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="font-semibold text-lg">
 {new Date(date).toLocaleDateString('en-US', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 })}
 </h3>
 <Badge variant="secondary" className="ml-auto">
 {items.length} {items.length === 1 ? 'activity' : 'activities'}
 </Badge>
 </div>

 <div className="space-y-md">
 {items.map((item, index) => {
 const ActionIcon = actionIcons[item.action] || AlertCircle;
 const TypeIcon = typeIcons[item.type] || Calendar;
 const actionColorClass = actionColors[item.action] || 'text-gray-600 bg-gray-50';
 const typeColorClass = typeColors[item.type] || 'bg-gray-100 text-gray-800';
 
 return (
 <div key={item.id} className="flex items-start gap-md relative">
 {/* Timeline connector */}
 {index < items.length - 1 && (
 <div className="absolute left-4 top-xl w-px h-icon-2xl bg-border" />
 )}
 
 {/* Action icon */}
 <div className={`p-xs rounded-full ${actionColorClass} flex-shrink-0`}>
 <ActionIcon className="h-icon-xs w-icon-xs" />
 </div>

 {/* Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-xs">
 <div className="flex-1">
 <div className="flex items-center gap-xs mb-1">
 <h4 className="font-medium text-sm truncate">{item.title}</h4>
 <Badge variant="outline" className={`text-xs ${typeColorClass}`}>
 <TypeIcon className="h-3 w-3 mr-1" />
 {item.type}
 </Badge>
 </div>
 
 <p className="text-sm text-muted-foreground mb-1">
 <span className="capitalize">{item.action}</span> by{' '}
 <span className="font-medium">{item.user_name || 'Unknown User'}</span>
 </p>
 
 {item.description && (
 <p className="text-sm text-muted-foreground mb-2 line-clamp-xs">
 {item.description}
 </p>
 )}

 {/* Metadata */}
 {item.metadata && Object.keys(item.metadata).length > 0 && (
 <div className="flex flex-wrap gap-xs mt-2">
 {Object.entries(item.metadata)
 .slice(0, 3)
 .map(([key, value]) => (
 <Badge key={key} variant="secondary" className="text-xs">
 {key}: {String(value).substring(0, 20)}
 {String(value).length > 20 ? '...' : ''}
 </Badge>
 ))}
 </div>
 )}
 </div>

 <div className="text-right flex-shrink-0">
 <p className="text-xs text-muted-foreground">
 {new Date(item.timestamp).toLocaleTimeString('en-US', {
 hour: '2-digit',
 minute: '2-digit'
 })}
 </p>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 ))}

 {/* Load more indicator */}
 {activity.length >= 50 && (
 <Card className="p-lg text-center">
 <p className="text-sm text-muted-foreground">
 Showing recent 50 activities. Use filters to see more specific results.
 </p>
 </Card>
 )}
 </div>
 );
}
