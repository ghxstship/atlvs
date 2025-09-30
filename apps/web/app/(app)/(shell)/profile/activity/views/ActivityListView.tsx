'use client';

import { Edit, User, Eye, Award, AlertTriangle, Briefcase, Phone, Heart, Plane, Shirt, Star, ThumbsUp, Clock, MoreHorizontal } from "lucide-react";
import { useMemo } from 'react';
import { Badge, Button, Card, Checkbox, Skeleton } from '@ghxstship/ui';
import type { ActivityRecord } from '../types';
import { ACTIVITY_TYPE_CONFIG } from '../types';

interface ActivityListViewProps {
 activities: ActivityRecord[];
 loading: boolean;
 selectedItems: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (ids: string[], selected: boolean) => void;
 onViewActivity?: (activity: ActivityRecord) => void;
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

export default function ActivityListView({
 activities,
 loading,
 selectedItems,
 onSelectItem,
 onSelectAll,
 onViewActivity,
}: ActivityListViewProps) {
 const allSelected = activities.length > 0 && activities.every(activity => selectedItems.includes(activity.id));
 const someSelected = activities.some(activity => selectedItems.includes(activity.id));

 const handleSelectAll = () => {
 const activityIds = activities.map(activity => activity.id);
 onSelectAll(activityIds, !allSelected);
 };

 if (loading) {
 return (
 <div className="space-y-4">
 {Array.from({ length: 5 }).map((_, i) => (
 <Card key={i} className="p-4">
 <div className="flex items-start gap-4">
 <Skeleton className="h-10 w-10 rounded-full" />
 <div className="flex-1 space-y-2">
 <Skeleton className="h-4 w-3/4" />
 <Skeleton className="h-3 w-1/2" />
 <Skeleton className="h-3 w-1/4" />
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (activities.length === 0) {
 return (
 <Card className="p-12 text-center">
 <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-semibold mb-2">No Activity Found</h3>
 <p className="text-muted-foreground">
 No profile activity has been recorded yet.
 </p>
 </Card>
 );
 }

 return (
 <div className="space-y-4">
 {/* Header with bulk selection */}
 <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
 <input
 type="checkbox"
 checked={allSelected}
 ref={(input) => {
 if (input) input.indeterminate = someSelected && !allSelected;
 }}
 onChange={handleSelectAll}
 className="h-4 w-4 rounded border-border"
 />
 <span className="text-sm text-muted-foreground">
 {selectedItems.length > 0 
 ? `${selectedItems.length} of ${activities.length} selected`
 : `${activities.length} activities`
 }
 </span>
 </div>

 {/* Activity List */}
 <div className="space-y-3">
 {activities.map((activity) => {
 const config = ACTIVITY_TYPE_CONFIG[activity.activity_type] || ACTIVITY_TYPE_CONFIG.profile_updated;
 const IconComponent = iconMap[config.icon as keyof typeof iconMap] || User;
 const isSelected = selectedItems.includes(activity.id);

 return (
 <Card key={activity.id} className={`p-4 transition-colors ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}>
 <div className="flex items-start gap-4">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={(e) => onSelectItem(activity.id, e.target.checked)}
 className="h-4 w-4 rounded border-border mt-1"
 />
 
 <div className={`p-2 rounded-full ${config.color}`}>
 <IconComponent className="h-4 w-4" />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2 mb-2">
 <div className="flex-1">
 <h4 className="font-medium text-sm line-clamp-2">
 {activity.activity_description}
 </h4>
 <div className="flex items-center gap-2 mt-1">
 <Badge variant="secondary" className="text-xs">
 {config.label}
 </Badge>
 <span className="text-xs text-muted-foreground">
 by {activity.performed_by_name || 'System'}
 </span>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-1 text-xs text-muted-foreground">
 <Clock className="h-3 w-3" />
 <span>{new Date(activity.created_at).toLocaleDateString()}</span>
 </div>
 
 {onViewActivity && (
 <Button
 variant="ghost"
 size="sm"
 className="h-6 w-6 p-0"
 onClick={() => onViewActivity(activity)}
 >
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 )}
 </div>
 </div>

 <p className="text-xs text-muted-foreground mb-2">
 {config.description}
 </p>

 <div className="flex items-center gap-1 text-xs text-muted-foreground">
 <Clock className="h-3 w-3" />
 <span>{new Date(activity.created_at).toLocaleTimeString()}</span>
 </div>

 {activity.metadata && Object.keys(activity.metadata).length > 0 && (
 <details className="mt-3">
 <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
 View metadata
 </summary>
 <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
 <pre className="whitespace-pre-wrap text-xs">
 {JSON.stringify(activity.metadata, null, 2)}
 </pre>
 </div>
 </details>
 )}
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
