'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { TrackingItem } from '../types';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '../types';

interface TrackingKanbanViewProps {
 items: TrackingItem[];
 loading?: boolean;
 selectedItems: string[];
 onSelectionChange: (itemIds: string[]) => void;
 onItemClick?: (item: TrackingItem) => void;
 onEditItem?: (item: TrackingItem) => void;
 onViewItem?: (item: TrackingItem) => void;
 onStatusChange?: (item: TrackingItem, newStatus: string) => void;
}

const statusColumns = [
 { key: 'ordered', label: 'Ordered', color: 'bg-secondary/10 border-secondary/20' },
 { key: 'shipped', label: 'Shipped', color: 'bg-primary/10 border-primary/20' },
 { key: 'in_transit', label: 'In Transit', color: 'bg-primary/10 border-primary/20' },
 { key: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-warning/10 border-warning/20' },
 { key: 'delivered', label: 'Delivered', color: 'bg-success/10 border-success/20' },
];

export default function TrackingKanbanView({
 items,
 loading = false,
 selectedItems,
 onSelectionChange,
 onItemClick,
 onEditItem,
 onViewItem,
 onStatusChange,
}: TrackingKanbanViewProps) {
 const [draggedItem, setDraggedItem] = useState<TrackingItem | null>(null);

 const handleDragStart = (e: React.DragEvent, item: TrackingItem) => {
 setDraggedItem(item);
 e.dataTransfer.effectAllowed = 'move';
 };

 const handleDragEnd = () => {
 setDraggedItem(null);
 };

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 e.dataTransfer.dropEffect = 'move';
 };

 const handleDrop = (e: React.DragEvent, status: string) => {
 e.preventDefault();
 if (draggedItem && draggedItem.status !== status) {
 onStatusChange?.(draggedItem, status);
 }
 setDraggedItem(null);
 };

 const getItemsByStatus = (status: string) => {
 return items.filter(item => item.status === status);
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'delivered':
 return <CheckCircle className="h-3 w-3 text-success" />;
 case 'shipped':
 case 'in_transit':
 case 'out_for_delivery':
 return <Truck className="h-3 w-3 text-primary" />;
 default:
 return <Package className="h-3 w-3 text-muted-foreground" />;
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

 if (loading) {
 return (
 <div className="flex gap-md h-content-xl">
 {statusColumns.map((column) => (
 <div key={column.key} className="flex-1">
 <Card className={`h-full ${column.color}`}>
 <div className="p-md border-b border-border">
 <div className="h-icon-md bg-muted rounded w-component-lg animate-pulse"></div>
 </div>
 <div className="p-md space-y-md">
 {Array.from({ length: 3 }).map((_, index) => (
 <Card key={index} className="p-md">
 <div className="animate-pulse space-y-sm">
 <div className="flex items-center gap-sm">
 <div className="h-icon-xs w-icon-xs bg-muted rounded"></div>
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 </div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 <div className="h-3 bg-muted rounded w-full"></div>
 <div className="h-icon-sm bg-muted rounded w-component-md"></div>
 </div>
 </Card>
 ))}
 </div>
 </Card>
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="flex gap-md h-content-xl overflow-x-auto">
 {statusColumns.map((column) => {
 const columnItems = getItemsByStatus(column.key);
 
 return (
 <div key={column.key} className="flex-1 min-w-container-md">
 <Card 
 className={`h-full ${column.color} flex flex-col`}
 onDragOver={handleDragOver}
 onDrop={(e) => handleDrop(e, column.key)}
 >
 {/* Column header */}
 <div className="p-md border-b border-border flex-shrink-0">
 <div className="flex items-center justify-between">
 <h3 className="font-medium">{column.label}</h3>
 <Badge variant="secondary">
 {columnItems.length}
 </Badge>
 </div>
 </div>

 {/* Column content */}
 <div className="flex-1 p-md space-y-md overflow-y-auto">
 {columnItems.length === 0 ? (
 <div className="text-center py-lg text-muted-foreground">
 <div className="text-sm">No {column.label.toLowerCase()} items</div>
 </div>
 ) : (
 columnItems.map((item) => {
 const isSelected = selectedItems.includes(item.id);
 const isDragging = draggedItem?.id === item.id;
 const overdue = isOverdue(item);

 return (
 <Card
 key={item.id}
 className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${isDragging ? 'opacity-50 rotate-2' : ''} ${
 overdue ? 'border-destructive/50' : ''
 }`}
 draggable
 onDragStart={(e) => handleDragStart(e, item)}
 onDragEnd={handleDragEnd}
 onClick={() => onItemClick?.(item)}
 >
 <div className="p-md">
 {/* Header */}
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm min-w-0 flex-1">
 {getStatusIcon(item.status)}
 <div className="min-w-0 flex-1">
 <h4 className="font-medium text-sm truncate">{item.order_number}</h4>
 <p className="text-xs text-muted-foreground truncate">{item.vendor_name}</p>
 </div>
 </div>
 <div className="flex items-center gap-xs ml-sm">
 {overdue && (
 <Badge variant="destructive" className="text-xs">
 Overdue
 </Badge>
 )}
 {onViewItem && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onViewItem(item);
 }}
 className="h-icon-md w-icon-md p-0"
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEditItem && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onEditItem(item);
 }}
 className="h-icon-md w-icon-md p-0"
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 </div>
 </div>

 {/* Priority */}
 <div className="flex items-center gap-sm mb-sm">
 <div className="flex items-center gap-xs">
 <span className="text-xs">{getPriorityIcon(item.priority)}</span>
 <Badge variant={getPriorityColor(item.priority)} className="text-xs">
 {item.priority}
 </Badge>
 </div>
 </div>

 {/* Description */}
 {item.description && (
 <p className="text-xs text-muted-foreground line-clamp-xs mb-sm">
 {item.description}
 </p>
 )}

 {/* Amount */}
 <div className="flex items-center justify-between mb-sm">
 <div className="font-semibold text-sm">
 {formatCurrency(item.total_amount, item.currency)}
 </div>
 </div>

 {/* Tracking Info */}
 {item.tracking_number && (
 <div className="mb-sm p-xs bg-muted/30 rounded text-xs">
 <div className="flex items-center gap-xs">
 <Truck className="h-3 w-3" />
 <span className="font-medium truncate">{item.tracking_number}</span>
 </div>
 {item.shipping_carrier && (
 <div className="text-muted-foreground mt-xs truncate">
 {item.shipping_carrier}
 </div>
 )}
 </div>
 )}

 {/* Dates */}
 <div className="space-y-xs text-xs text-muted-foreground mb-sm">
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3 flex-shrink-0" />
 <span>{formatDate(item.order_date)}</span>
 </div>
 {item.expected_delivery && (
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3 flex-shrink-0" />
 <span className={overdue ? 'text-destructive' : ''}>
 {formatDate(item.expected_delivery)}
 </span>
 </div>
 )}
 {item.actual_delivery && (
 <div className="flex items-center gap-xs">
 <CheckCircle className="h-3 w-3 flex-shrink-0 text-success" />
 <span>{formatDate(item.actual_delivery)}</span>
 </div>
 )}
 </div>

 {/* Tags */}
 {item.tags && item.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs mb-sm">
 {item.tags.slice(0, 2).map((tag, index) => (
 <span
 key={index}
 className="px-xs py-xs bg-muted rounded text-xs truncate"
 >
 {tag}
 </span>
 ))}
 {item.tags.length > 2 && (
 <span className="px-xs py-xs bg-muted rounded text-xs">
 +{item.tags.length - 2}
 </span>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between pt-sm border-t border-border text-xs text-muted-foreground">
 <span>{formatDate(item.created_at)}</span>
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
 <span>{item.id.slice(-6)}</span>
 </div>
 </div>
 </div>
 </Card>
 );
 })
 )}
 </div>
 </Card>
 </div>
 );
 })}
 </div>
 );
}
