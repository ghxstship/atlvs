'use client';

import { Edit, User, Eye, Award, AlertTriangle, Briefcase, Phone, Heart, Plane, Shirt, Star, ThumbsUp, Clock, Calendar } from "lucide-react";
import { useMemo } from 'react';
import { Badge, Card, Skeleton } from '@ghxstship/ui';
import type { ActivityRecord } from '../types';
import { ACTIVITY_TYPE_CONFIG } from '../types';

interface ActivityTimelineViewProps {
 activities: ActivityRecord[];
 loading: boolean;
}

const iconMap = {
 Edit,
 User,
 Eye,
 Award,
 AlertTriangle,
 Briefcase,
 Phone,
 Heart,
 Plane,
 Shirt,
 Star,
 ThumbsUp,
};

export default function ActivityTimelineView({
 activities,
 loading,
}: ActivityTimelineViewProps) {
 const groupedActivities = useMemo(() => {
 const groups: Record<string, ActivityRecord[]> = {};
 
 activities.forEach((activity) => {
 const date = new Date(activity.created_at).toDateString();
 if (!groups[date]) {
 groups[date] = [];
 }
 groups[date].push(activity);
 });

 return Object.entries(groups)
 .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
 .map(([date, items]) => ({
 date,
 items: items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
 }));
 }, [activities]);

 if (loading) {
 return (
 <div className="space-y-lg">
 {Array.from({ length: 3 }).map((_, i) => (
 <Card key={i} className="p-lg">
 <Skeleton className="h-icon-xs w-component-xl mb-4" />
 <div className="space-y-md">
 {Array.from({ length: 3 }).map((_, j) => (
 <div key={j} className="flex items-start gap-md">
 <Skeleton className="h-icon-lg w-icon-lg rounded-full" />
 <div className="flex-1 space-y-xs">
 <Skeleton className="h-icon-xs w-3/4" />
 <Skeleton className="h-3 w-1/2" />
 </div>
 </div>
 ))}
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (activities.length === 0) {
 return (
 <Card className="p-xsxl text-center">
 <Clock className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">No Activity Timeline</h3>
 <p className="text-muted-foreground">
 Activity will appear here as it happens.
 </p>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 {groupedActivities.map(({ date, items }) => (
 <Card key={date} className="p-lg">
 <div className="flex items-center gap-xs mb-6">
 <Calendar className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="font-semibold text-lg">
 {new Date(date).toLocaleDateString('en-US', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 })}
 </h3>
 <Badge variant="secondary" className="ml-auto">
 {items.length} {items.length === 1 ? 'activity' : 'activities'}
 </Badge>
 </div>

 <div className="relative">
 {/* Timeline line */}
 <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
 
 <div className="space-y-lg">
 {items.map((activity, index) => {
 const config = ACTIVITY_TYPE_CONFIG[activity.activity_type] || ACTIVITY_TYPE_CONFIG.profile_updated;
 const IconComponent = iconMap[config.icon as keyof typeof iconMap] || User;
 
 return (
 <div key={activity.id} className="relative flex items-start gap-md">
 {/* Timeline dot */}
 <div className={`relative z-10 p-xs rounded-full bg-background border-2 border-current ${config.color}`}>
 <IconComponent className="h-icon-xs w-icon-xs" />
 </div>

 {/* Content */}
 <div className="flex-1 min-w-0 pb-6">
 <div className="flex items-start justify-between gap-xs mb-2">
 <div className="flex-1">
 <h4 className="font-medium text-sm mb-1">
 {activity.activity_description}
 </h4>
 <div className="flex items-center gap-xs">
 <Badge variant="outline" className={`text-xs ${config.color}`}>
 {config.label}
 </Badge>
 <span className="text-xs text-muted-foreground">
 by {activity.performed_by_name || 'System'}
 </span>
 </div>
 </div>
 
 <div className="text-xs text-muted-foreground">
 {new Date(activity.created_at).toLocaleTimeString('en-US', {
 hour: '2-digit',
 minute: '2-digit',
 })}
 </div>
 </div>

 <p className="text-xs text-muted-foreground mb-3">
 {config.description}
 </p>

 {activity.metadata && Object.keys(activity.metadata).length > 0 && (
 <details className="mt-3">
 <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
 View details
 </summary>
 <div className="mt-2 p-sm bg-muted/50 rounded-lg">
 <div className="space-y-xs">
 {Object.entries(activity.metadata).map(([key, value]) => (
 <div key={key} className="flex items-start gap-xs text-xs">
 <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
 {key}:
 </span>
 <span className="text-foreground break-words">
 {typeof value === 'object' 
 ? JSON.stringify(value, null, 2)
 : String(value)
 }
 </span>
 </div>
 ))}
 </div>
 </div>
 </details>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </Card>
 ))}

 {/* Load more indicator */}
 {activities.length >= 50 && (
 <Card className="p-lg text-center">
 <p className="text-sm text-muted-foreground">
 Showing recent 50 activities. Use filters to see more specific results.
 </p>
 </Card>
 )}
 </div>
 );
}
