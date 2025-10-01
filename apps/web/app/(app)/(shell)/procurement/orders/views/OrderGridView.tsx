'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import type { ProcurementOrder } from '../types';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, getPaymentStatusColor } from '../types';

interface OrderGridViewProps {
 orders: ProcurementOrder[];
 loading?: boolean;
 selectedOrders: string[];
 onSelectionChange: (orderIds: string[]) => void;
 onOrderClick?: (order: ProcurementOrder) => void;
 onEditOrder?: (order: ProcurementOrder) => void;
 onDeleteOrder?: (order: ProcurementOrder) => void;
 onViewOrder?: (order: ProcurementOrder) => void;
}

export default function OrderGridView({
 orders,
 loading = false,
 selectedOrders,
 onSelectionChange,
 onOrderClick,
 onEditOrder,
 onDeleteOrder,
 onViewOrder,
}: OrderGridViewProps) {
 const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);

 const handleOrderSelection = (orderId: string, checked: boolean) => {
 if (checked) {
 onSelectionChange([...selectedOrders, orderId]);
 } else {
 onSelectionChange(selectedOrders.filter(id => id !== orderId));
 }
 };

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelectionChange(orders.map(order => order.id));
 } else {
 onSelectionChange([]);
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'delivered':
 case 'received':
 return <CheckCircle className="h-3 w-3" />;
 case 'ordered':
 return <Truck className="h-3 w-3" />;
 case 'cancelled':
 case 'rejected':
 return <AlertCircle className="h-3 w-3" />;
 default:
 return <Package className="h-3 w-3" />;
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

 const isOverdue = (order: ProcurementOrder) => {
 if (!order.expected_delivery) return false;
 const now = new Date();
 const expectedDate = new Date(order.expected_delivery);
 return expectedDate < now && !['delivered', 'received', 'cancelled'].includes(order.status);
 };

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {Array.from({ length: 8 }).map((_, index) => (
 <Card key={index} className="p-md">
 <div className="animate-pulse">
 <div className="flex items-center justify-between mb-sm">
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 <div className="h-icon-md bg-muted rounded-full w-component-md"></div>
 </div>
 <div className="h-3 bg-muted rounded w-1/2 mb-sm"></div>
 <div className="h-3 bg-muted rounded w-full mb-sm"></div>
 <div className="h-3 bg-muted rounded w-2/3 mb-md"></div>
 <div className="flex justify-between items-center">
 <div className="h-icon-sm bg-muted rounded w-component-lg"></div>
 <div className="flex gap-xs">
 <div className="h-icon-lg w-icon-lg bg-muted rounded"></div>
 <div className="h-icon-lg w-icon-lg bg-muted rounded"></div>
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (orders.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Package className="h-icon-2xl w-icon-2xl mx-auto mb-md text-muted-foreground opacity-50" />
 <h3 className="text-lg font-medium mb-sm">No orders found</h3>
 <p className="text-muted-foreground">
 No orders match your current filters. Try adjusting your search criteria.
 </p>
 </Card>
 );
 }

 const allSelected = orders.length > 0 && selectedOrders.length === orders.length;
 const someSelected = selectedOrders.length > 0 && selectedOrders.length < orders.length;

 return (
 <div className="space-y-md">
 {/* Selection header */}
 {orders.length > 0 && (
 <div className="flex items-center gap-sm p-sm bg-muted/30 rounded-lg">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={handleSelectAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedOrders.length > 0 
 ? `${selectedOrders.length} of ${orders.length} orders selected`
 : `Select all ${orders.length} orders`
 }
 </span>
 </div>
 )}

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {orders.map((order) => {
 const isSelected = selectedOrders.includes(order.id);
 const isHovered = hoveredOrder === order.id;
 const overdue = isOverdue(order);

 return (
 <Card
 key={order.id}
 className={`relative transition-all duration-200 cursor-pointer hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${overdue ? 'border-destructive/50' : ''}`}
 onMouseEnter={() => setHoveredOrder(order.id)}
 onMouseLeave={() => setHoveredOrder(null)}
 onClick={() => onOrderClick?.(order)}
 >
 {/* Selection checkbox */}
 <div className="absolute top-sm left-sm z-10">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleOrderSelection(order.id, checked as boolean)}
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
 {onViewOrder && (
 <Button
 size="sm"
 variant="secondary"
 onClick={(e) => {
 e.stopPropagation();
 onViewOrder(order);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEditOrder && (
 <Button
 size="sm"
 variant="secondary"
 onClick={(e) => {
 e.stopPropagation();
 onEditOrder(order);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 {onDeleteOrder && (
 <Button
 size="sm"
 variant="destructive"
 onClick={(e) => {
 e.stopPropagation();
 onDeleteOrder(order);
 }}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 )}

 <div className="p-md pt-lg">
 {/* Header */}
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm min-w-0 flex-1">
 <div className="p-sm bg-primary/10 rounded-lg">
 <Package className="h-icon-xs w-icon-xs text-primary flex-shrink-0" />
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="font-medium truncate">{order.order_number}</h4>
 <p className="text-sm text-muted-foreground truncate">{order.vendor_name}</p>
 </div>
 </div>
 {!overdue && (
 <Badge variant={getStatusColor(order.status)} className="ml-sm">
 {getStatusIcon(order.status)}
 <span className="ml-xs capitalize">{order.status}</span>
 </Badge>
 )}
 </div>

 {/* Priority and Payment Status */}
 <div className="flex items-center gap-sm mb-sm">
 <div className="flex items-center gap-xs">
 <span className="text-sm">{getPriorityIcon(order.priority)}</span>
 <Badge variant={getPriorityColor(order.priority)} className="text-xs">
 {order.priority}
 </Badge>
 </div>
 <Badge variant={getPaymentStatusColor(order.payment_status)} className="text-xs">
 {order.payment_status.replace('_', ' ')}
 </Badge>
 </div>

 {/* Description */}
 {order.description && (
 <p className="text-sm text-muted-foreground line-clamp-xs mb-sm">
 {order.description}
 </p>
 )}

 {/* Amount */}
 <div className="flex items-center justify-between mb-sm">
 <div className="text-lg font-semibold">
 {formatCurrency(order.total_amount, order.currency)}
 </div>
 </div>

 {/* Dates */}
 <div className="space-y-xs text-xs text-muted-foreground mb-sm">
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3 flex-shrink-0" />
 <span>Ordered: {formatDate(order.order_date)}</span>
 </div>
 {order.expected_delivery && (
 <div className="flex items-center gap-xs">
 <Truck className="h-3 w-3 flex-shrink-0" />
 <span className={overdue ? 'text-destructive' : ''}>
 Expected: {formatDate(order.expected_delivery)}
 </span>
 </div>
 )}
 {order.actual_delivery && (
 <div className="flex items-center gap-xs">
 <CheckCircle className="h-3 w-3 flex-shrink-0 text-success" />
 <span>Delivered: {formatDate(order.actual_delivery)}</span>
 </div>
 )}
 </div>

 {/* Tags */}
 {order.tags && order.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs mb-sm">
 {order.tags.slice(0, 3).map((tag, index) => (
 <span
 key={index}
 className="px-xs py-xs bg-muted rounded text-xs"
 >
 {tag}
 </span>
 ))}
 {order.tags.length > 3 && (
 <span className="px-xs py-xs bg-muted rounded text-xs">
 +{order.tags.length - 3} more
 </span>
 )}
 </div>
 )}

 {/* Approval status */}
 {order.approval_required && (
 <div className="mb-sm">
 {order.approved_by ? (
 <div className="flex items-center gap-xs text-xs text-success">
 <CheckCircle className="h-3 w-3" />
 <span>Approved</span>
 </div>
 ) : (
 <div className="flex items-center gap-xs text-xs text-warning">
 <AlertCircle className="h-3 w-3" />
 <span>Approval Required</span>
 </div>
 )}
 </div>
 )}

 {/* Tracking */}
 {order.tracking_number && (
 <div className="text-xs text-muted-foreground mb-sm">
 <strong>Tracking:</strong> {order.tracking_number}
 {order.carrier && <span> ({order.carrier})</span>}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between mt-md pt-sm border-t border-border">
 <span className="text-xs text-muted-foreground">
 {formatDate(order.created_at)}
 </span>
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 // Show more options menu
 }}
 >
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
