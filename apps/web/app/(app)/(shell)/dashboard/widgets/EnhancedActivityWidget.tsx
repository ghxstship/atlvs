'use client';

import { Activity, Clock, User, FileText, CheckCircle, AlertCircle, Plus, ArrowRight, MoreHorizontal } from "lucide-react";
import React from 'react';
import { Card, Avatar, Badge, Button } from '@ghxstship/ui';
import type { BaseWidgetProps, ActivityItem } from '../types';

interface EnhancedActivityWidgetProps extends BaseWidgetProps {
 activities?: ActivityItem[];
 onViewAll?: () => void;
}

export default function EnhancedActivityWidget({ 
 widget, 
 data, 
 isLoading,
 activities,
 onViewAll
}: EnhancedActivityWidgetProps) {
 if (isLoading) {
 return (
 <Card className="p-lg">
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
 <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
 </div>
 <div className="space-y-md">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="flex items-start space-x-sm">
 <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
 <div className="flex-1 space-y-xs">
 <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
 <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </Card>
 );
 }

 const activityData = activities || data?.data || [];

 const getActivityIcon = (type: string) => {
 switch (type) {
 case 'project':
 return <FileText className="w-4 h-4 text-blue-500" />;
 case 'task':
 return <CheckCircle className="w-4 h-4 text-green-500" />;
 case 'user':
 return <User className="w-4 h-4 text-purple-500" />;
 case 'system':
 return <AlertCircle className="w-4 h-4 text-orange-500" />;
 default:
 return <Activity className="w-4 h-4 text-gray-500" />;
 }
 };

 const getActivityColor = (type: string) => {
 switch (type) {
 case 'project':
 return 'bg-blue-50 border-blue-200';
 case 'task':
 return 'bg-green-50 border-green-200';
 case 'user':
 return 'bg-purple-50 border-purple-200';
 case 'system':
 return 'bg-orange-50 border-orange-200';
 default:
 return 'bg-gray-50 border-gray-200';
 }
 };

 const formatRelativeTime = (timestamp: string) => {
 const now = new Date();
 const time = new Date(timestamp);
 const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

 if (diffInMinutes < 1) return 'Just now';
 if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
 
 const diffInHours = Math.floor(diffInMinutes / 60);
 if (diffInHours < 24) return `${diffInHours}h ago`;
 
 const diffInDays = Math.floor(diffInHours / 24);
 if (diffInDays < 7) return `${diffInDays}d ago`;
 
 return time.toLocaleDateString();
 };

 return (
 <Card className="p-lg">
 <div className="space-y-md">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-sm">
 <Activity className="w-5 h-5 text-blue-500" />
 <h3 className="font-semibold text-foreground">{widget.title}</h3>
 </div>
 {onViewAll && (
 <Button
 variant="ghost"
 size="sm"
 onClick={onViewAll}
 className="text-xs"
 >
 View All
 <ArrowRight className="w-3 h-3 ml-xs" />
 </Button>
 )}
 </div>

 {/* Activity List */}
 <div className="space-y-sm">
 {activityData.length === 0 ? (
 <div className="text-center py-lg text-muted-foreground">
 <Activity className="w-8 h-8 mx-auto mb-sm opacity-50" />
 <p className="text-sm">No recent activity</p>
 </div>
 ) : (
 activityData.slice(0, widget.config.limit || 10).map((activity) => (
 <div
 key={activity.id}
 className={`p-sm rounded-lg border transition-colors hover:bg-muted/50 ${getActivityColor(activity.type)}`}
 >
 <div className="flex items-start space-x-sm">
 {/* Activity Icon */}
 <div className="flex-shrink-0 mt-xs">
 {getActivityIcon(activity.type)}
 </div>

 {/* Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <p className="text-sm font-medium text-foreground truncate">
 {activity.title}
 </p>
 {activity.description && (
 <p className="text-xs text-muted-foreground mt-xs">
 {activity.description}
 </p>
 )}
 </div>
 <div className="flex-shrink-0 ml-sm">
 <span className="text-xs text-muted-foreground">
 {formatRelativeTime(activity.timestamp)}
 </span>
 </div>
 </div>

 {/* User Info */}
 {activity.user_name && (
 <div className="flex items-center space-x-xs mt-xs">
 <Avatar className="w-4 h-4">
 <img 
 src={activity.user_avatar || '/default-avatar.png'} 
 alt={activity.user_name}
 className="w-full h-full object-cover"
 />
 </Avatar>
 <span className="text-xs text-muted-foreground">
 {activity.user_name}
 </span>
 </div>
 )}

 {/* Metadata */}
 {activity.metadata && Object.keys(activity.metadata).length > 0 && (
 <div className="flex flex-wrap gap-xs mt-xs">
 {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
 <Badge key={key} variant="secondary" className="text-xs">
 {key}: {String(value)}
 </Badge>
 ))}
 </div>
 )}

 {/* Action Link */}
 {activity.action_url && (
 <div className="mt-xs">
 <a
 href={activity.action_url as any as any}
 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
 >
 View Details →
 </a>
 </div>
 )}
 </div>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Footer */}
 {data?.metadata && (
 <div className="flex items-center justify-between text-xs text-muted-foreground pt-sm border-t">
 <span>
 {data.metadata.total_count} total activities
 </span>
 <span>
 Updated {new Date(data.metadata.last_updated).toLocaleTimeString()}
 </span>
 </div>
 )}
 </div>
 </Card>
 );
}
