'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import Link from 'next/link';
import type { TrackingItem } from '../types';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, getPerformanceColor, calculateDeliveryPerformance } from '../types';

interface TrackingGridViewProps {
 items: TrackingItem[];
 loading?: boolean;
 selectedItems: string[];
 onSelectionChange: (itemIds: string[]) => void;
 onItemClick?: (item: TrackingItem) => void;
 onEditItem?: (item: TrackingItem) => void;
 onViewItem?: (item: TrackingItem) => void;
 onTrackPackage?: (item: TrackingItem) => void;
}

export default function TrackingGridView({
 items,
 loading = false,
 selectedItems,
 onSelectionChange,
 onItemClick,
 onEditItem,
 onViewItem,
 onTrackPackage,
}: TrackingGridViewProps) {
 const [hoveredItem, setHoveredItem] = useState<string | null>(null);

 const handleItemSelection = (itemId: string, checked: boolean) => {
 if (checked) {
 onSelectionChange([...selectedItems, itemId]);
 } else {
 onSelectionChange(selectedItems.filter(id => id !== itemId));
 }
 };

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelectionChange(items.map(item => item.id));
 } else {
 onSelectionChange([]);
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'delivered':
 return <CheckCircle className="h-4 w-4 text-success" />;
 case 'shipped':
 case 'in_transit':
 case 'out_for_delivery':
 return <Truck className="h-4 w-4 text-primary" />;
 case 'cancelled':
 case 'returned':
 return <AlertCircle className="h-4 w-4 text-destructive" />;
 default:
 return <Package className="h-4 w-4 text-muted-foreground" />;
 }
 };

 const getPriorityIcon = (priority: string) => {
 switch (priority) {
 case 'urgent':
 return '🔴';
 case 'high':
 return '🟡';
 case 'medium':
 return '🟢';
 case 'low':
 return '🔵';
 default:
 return '⚪';
 }
 };

 const isOverdue = (item: TrackingItem) => {
 if (!item.expected_delivery) return false;
 const now = new Date();
 const expectedDate = new Date(item.expected_delivery);
 return expectedDate < now && !['delivered', 'cancelled'].includes(item.status);
 };

 const getDaysUntilDelivery = (item: TrackingItem) => {
 if (!item.expected_delivery) return null;
 const now = new Date();
 const expectedDate = new Date(item.expected_delivery);
 const diffTime = expectedDate.getTime() - now.getTime();
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 return diffDays;
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {Array.from({ length: 8 }).map((_, index) => (
 <Card key={index} className="p-md">
 <div className="animate-pulse">
 <div className="flex items-center justify-between mb-sm">
 <div className="h-4 bg-muted rounded w-3/4"></div>
 <div className="h-6 bg-muted rounded-full w-16"></div>
 </div>
 <div className="h-3 bg-muted rounded w-1/2 mb-sm"></div>
 <div className="h-3 bg-muted rounded w-full mb-sm"></div>
 <div className="h-3 bg-muted rounded w-2/3 mb-md"></div>
 <div className="flex justify-between items-center">
 <div className="h-5 bg-muted rounded w-20"></div>
 <div className="flex gap-xs">
 <div className="h-8 w-8 bg-muted rounded"></div>
 <div className="h-8 w-8 bg-muted rounded"></div>
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (items.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Package className="h-12 w-12 mx-auto mb-md text-muted-foreground opacity-50" />
 <h3 className="text-lg font-medium mb-sm">No tracking items found</h3>
 <p className="text-muted-foreground">
 No items match your current filters. Try adjusting your search criteria.
 </p>
 </Card>
 );
 }

 const allSelected = items.length > 0 && selectedItems.length === items.length;
 const someSelected = selectedItems.length > 0 && selectedItems.length < items.length;

 return (
 <div className="space-y-md">
 {/* Selection header */}
 {items.length > 0 && (
 <div className="flex items-center gap-sm p-sm bg-muted/30 rounded-lg">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={handleSelectAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedItems.length > 0 
 ? `${selectedItems.length} of ${items.length} items selected`
 : `Select all ${items.length} items`
 }
 </span>
 </div>
 )}

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {items.map((item) => {
 const isSelected = selectedItems.includes(item.id);
 const isHovered = hoveredItem === item.id;
 const overdue = isOverdue(item);
 const daysUntilDelivery = getDaysUntilDelivery(item);
 const performance = calculateDeliveryPerformance(item.expected_delivery, item.actual_delivery);

 return (
 <Card
 key={item.id}
 className={`relative transition-all duration-200 cursor-pointer hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${overdue ? 'border-destructive/50' : ''}`}
 onMouseEnter={() => setHoveredItem(item.id)}
 onMouseLeave={() => setHoveredItem(null)}
 onClick={() => onItemClick?.(item)}
 >
 {/* Selection checkbox */}
 <div className="absolute top-sm left-sm z-10">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
 onClick={(e) => e.stopPropagation()}
 />
 </div>

 {/* Overdue indicator */}
 {overdue && (
 <div className="absolute top-sm right-sm z-10">
 <Badge variant="destructive" className="text-xs">
 Overdue
 </Badge>
 </div>
 )}

 {/* Action buttons */}
 {isHovered && !overdue && (
 <div className="absolute top-sm right-sm z-10 flex gap-xs">
 {item.tracking_number && onTrackPackage && (
 <Button
 size="sm"
 variant="secondary"
 onClick={(e) => {
 e.stopPropagation();
 onTrackPackage(item);
 }}
 title="Track package"
 >
 <MapPin className="h-3 w-3" />
 </Button>
 )}
 {onViewItem && (
 <Button
 size="sm"
 variant="secondary"
 onClick={(e) => {
 e.stopPropagation();
 onViewItem(item);
 }}
 title="View details"
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEditItem && (
 <Button
 size="sm"
 variant="secondary"
 onClick={(e) => {
 e.stopPropagation();
 onEditItem(item);
 }}
 title="Edit item"
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 </div>
 )}

 <div className="p-md pt-lg">
 {/* Header */}
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm min-w-0 flex-1">
 <div className="p-sm bg-primary/10 rounded-lg">
 {getStatusIcon(item.status)}
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="font-medium truncate">{item.order_number}</h4>
 <p className="text-sm text-muted-foreground truncate">{item.vendor_name}</p>
 </div>
 </div>
 {!overdue && (
 <Badge variant={getStatusColor(item.status)} className="ml-sm">
 <span className="capitalize">{item.status.replace('_', ' ')}</span>
 </Badge>
 )}
 </div>

 {/* Priority and Performance */}
 <div className="flex items-center gap-sm mb-sm">
 <div className="flex items-center gap-xs">
 <span className="text-sm">{getPriorityIcon(item.priority)}</span>
 <Badge variant={getPriorityColor(item.priority)} className="text-xs">
 {item.priority}
 </Badge>
 </div>
 {item.actual_delivery && (
 <Badge variant={getPerformanceColor(performance)} className="text-xs">
 {performance.replace('_', ' ')}
 </Badge>
 )}
 </div>

 {/* Description */}
 {item.description && (
 <p className="text-sm text-muted-foreground line-clamp-2 mb-sm">
 {item.description}
 </p>
 )}

 {/* Amount */}
 <div className="flex items-center justify-between mb-sm">
 <div className="text-lg font-semibold">
 {formatCurrency(item.total_amount, item.currency)}
 </div>
 </div>

 {/* Tracking Information */}
 {item.tracking_number && (
 <div className="mb-sm p-xs bg-muted/30 rounded text-xs">
 <div className="flex items-center gap-xs">
 <Truck className="h-3 w-3" />
 <span className="font-medium">{item.tracking_number}</span>
 </div>
 {item.shipping_carrier && (
 <div className="text-muted-foreground mt-xs">
 via {item.shipping_carrier}
 </div>
 )}
 </div>
 )}

 {/* Dates */}
 <div className="space-y-xs text-xs text-muted-foreground mb-sm">
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3 flex-shrink-0" />
 <span>Ordered: {formatDate(item.order_date)}</span>
 </div>
 {item.expected_delivery && (
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3 flex-shrink-0" />
 <span className={overdue ? 'text-destructive' : ''}>
 Expected: {formatDate(item.expected_delivery)}
 {daysUntilDelivery !== null && daysUntilDelivery > 0 && (
 <span className="ml-xs">({daysUntilDelivery} days)</span>
 )}
 </span>
 </div>
 )}
 {item.actual_delivery && (
 <div className="flex items-center gap-xs">
 <CheckCircle className="h-3 w-3 flex-shrink-0 text-success" />
 <span>Delivered: {formatDate(item.actual_delivery)}</span>
 </div>
 )}
 </div>

 {/* Tags */}
 {item.tags && item.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs mb-sm">
 {item.tags.slice(0, 3).map((tag, index) => (
 <span
 key={index}
 className="px-xs py-xs bg-muted rounded text-xs"
 >
 {tag}
 </span>
 ))}
 {item.tags.length > 3 && (
 <span className="px-xs py-xs bg-muted rounded text-xs">
 +{item.tags.length - 3} more
 </span>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between mt-md pt-sm border-t border-border">
 <span className="text-xs text-muted-foreground">
 {formatDate(item.created_at)}
 </span>
 {item.tracking_number && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onTrackPackage?.(item);
 }}
 className="text-xs"
 >
 <ExternalLink className="h-3 w-3 mr-xs" />
 Track
 </Button>
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
