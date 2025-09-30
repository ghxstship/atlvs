'use client';

import { Card, Badge, Button } from '@ghxstship/ui';
import type { DashboardListItem } from '../types';
import { BarChart3, Copy, Edit, Eye, MoreHorizontal } from 'lucide-react';

interface DashboardGridViewProps {
 dashboards: DashboardListItem[];
 onView?: (dashboard: DashboardListItem) => void;
 onEdit?: (dashboard: DashboardListItem) => void;
 onDelete?: (dashboard: DashboardListItem) => void;
 onShare?: (dashboard: DashboardListItem) => void;
 onDuplicate?: (dashboard: DashboardListItem) => void;
 selectedIds?: string[];
 onSelectionChange?: (ids: string[]) => void;
}

export default function DashboardGridView({
 dashboards,
 onView,
 onEdit,
 onDelete,
 onShare,
 onDuplicate,
 selectedIds = [],
 onSelectionChange
}: DashboardGridViewProps) {
 const handleCardClick = (dashboard: DashboardListItem, event: React.MouseEvent) => {
 // Prevent selection when clicking action buttons
 if ((event.target as HTMLElement).closest('button')) {
 return;
 }

 if (onView) {
 onView(dashboard);
 }
 };

 const handleSelectionToggle = (dashboardId: string) => {
 if (!onSelectionChange) return;

 const newSelection = selectedIds.includes(dashboardId)
 ? selectedIds.filter(id => id !== dashboardId)
 : [...selectedIds, dashboardId];

 onSelectionChange(newSelection);
 };

 const getTypeColor = (type: string) => {
 switch (type) {
 case 'system':
 return 'bg-blue-100 text-blue-800';
 case 'custom':
 return 'bg-green-100 text-green-800';
 case 'template':
 return 'bg-purple-100 text-purple-800';
 default:
 return 'bg-gray-100 text-gray-600';
 }
 };

 const getAccessLevelColor = (level: string) => {
 switch (level) {
 case 'private':
 return 'bg-red-100 text-red-800';
 case 'team':
 return 'bg-blue-100 text-blue-800';
 case 'organization':
 return 'bg-green-100 text-green-800';
 case 'public':
 return 'bg-purple-100 text-purple-800';
 default:
 return 'bg-gray-100 text-gray-600';
 }
 };

 if (dashboards.length === 0) {
 return (
 <div className="text-center py-2xl">
 <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-md" />
 <h3 className="text-heading-4 font-semibold mb-sm">No dashboards found</h3>
 <p className="text-body-sm text-muted-foreground">
 Create your first dashboard to start visualizing your data.
 </p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
 {dashboards.map((dashboard) => (
 <Card
 key={dashboard.id}
 className={`p-lg cursor-pointer transition-all hover:shadow-md ${
 selectedIds.includes(dashboard.id) ? 'ring-2 ring-primary' : ''
 }`}
 onClick={(e) => handleCardClick(dashboard, e)}
 >
 <div className="space-y-md">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <h3 className="text-body font-semibold truncate">
 {dashboard.name}
 </h3>
 {dashboard.description && (
 <p className="text-body-sm text-muted-foreground mt-xs line-clamp-2">
 {dashboard.description}
 </p>
 )}
 </div>

 <div className="flex items-center gap-xs ml-sm">
 <input
 type="checkbox"
 checked={selectedIds.includes(dashboard.id)}
 onChange={() => handleSelectionToggle(dashboard.id)}
 className="rounded border-gray-300"
 onClick={(e) => e.stopPropagation()}
 />

 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 // Show context menu or actions
 }}
 >
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </div>
 </div>

 {/* Badges */}
 <div className="flex flex-wrap gap-xs">
 <Badge className={getTypeColor(dashboard.type)}>
 {dashboard.type}
 </Badge>

 <Badge className={getAccessLevelColor(dashboard.access_level)}>
 {dashboard.access_level}
 </Badge>

 {dashboard.is_default && (
 <Badge className="bg-yellow-100 text-yellow-800">
 Default
 </Badge>
 )}

 {dashboard.is_public && (
 <Badge className="bg-indigo-100 text-indigo-800">
 Public
 </Badge>
 )}
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 gap-md text-center">
 <div>
 <div className="text-heading-4 font-semibold">
 {dashboard.widget_count || 0}
 </div>
 <div className="text-body-xs text-muted-foreground">
 Widgets
 </div>
 </div>

 <div>
 <div className="text-heading-4 font-semibold">
 {dashboard.share_count || 0}
 </div>
 <div className="text-body-xs text-muted-foreground">
 Shares
 </div>
 </div>
 </div>

 {/* Tags */}
 {dashboard.tags && dashboard.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {dashboard.tags.slice(0, 3).map((tag, index) => (
 <span
 key={index}
 className="inline-flex items-center px-xs py-xs rounded-full text-xs font-medium bg-gray-100 text-gray-700"
 >
 {tag}
 </span>
 ))}
 {dashboard.tags.length > 3 && (
 <span className="text-body-xs text-muted-foreground">
 +{dashboard.tags.length - 3} more
 </span>
 )}
 </div>
 )}

 {/* Actions */}
 <div className="flex items-center justify-between pt-sm border-t">
 <div className="text-body-xs text-muted-foreground">
 {dashboard.created_at && new Date(dashboard.created_at).toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric'
 })}
 </div>

 <div className="flex items-center gap-xs">
 {onView && (
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(dashboard);
 }}
 >
 <Eye className="h-4 w-4" />
 </Button>
 )}

 {onEdit && (
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(dashboard);
 }}
 >
 <Edit className="h-4 w-4" />
 </Button>
 )}

 {onShare && (
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onShare(dashboard);
 }}
 >
 <Copy className="h-4 w-4" />
 </Button>
 )}

 {onDuplicate && (
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDuplicate(dashboard);
 }}
 >
 <Copy className="h-4 w-4" />
 </Button>
 )}
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
}
