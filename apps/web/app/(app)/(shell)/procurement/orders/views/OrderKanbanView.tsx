'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { ProcurementOrder } from '../types';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '../types';

interface OrderKanbanViewProps {
 orders: ProcurementOrder[];
 loading?: boolean;
 selectedOrders: string[];
 onSelectionChange: (orderIds: string[]) => void;
 onOrderClick?: (order: ProcurementOrder) => void;
 onEditOrder?: (order: ProcurementOrder) => void;
 onDeleteOrder?: (order: ProcurementOrder) => void;
 onViewOrder?: (order: ProcurementOrder) => void;
 onStatusChange?: (order: ProcurementOrder, newStatus: string) => void;
}

const statusColumns = [
 { key: 'draft', label: 'Draft', color: 'bg-secondary/10 border-secondary/20' },
 { key: 'pending', label: 'Pending', color: 'bg-warning/10 border-warning/20' },
 { key: 'approved', label: 'Approved', color: 'bg-success/10 border-success/20' },
 { key: 'ordered', label: 'Ordered', color: 'bg-primary/10 border-primary/20' },
 { key: 'delivered', label: 'Delivered', color: 'bg-success/10 border-success/20' },
 { key: 'cancelled', label: 'Cancelled', color: 'bg-destructive/10 border-destructive/20' },
];

export default function OrderKanbanView({
 orders,
 loading = false,
 selectedOrders,
 onSelectionChange,
 onOrderClick,
 onEditOrder,
 onDeleteOrder,
 onViewOrder,
 onStatusChange,
}: OrderKanbanViewProps) {
 const [draggedOrder, setDraggedOrder] = useState<ProcurementOrder | null>(null);

 const handleDragStart = (e: React.DragEvent, order: ProcurementOrder) => {
 setDraggedOrder(order);
 e.dataTransfer.effectAllowed = 'move';
 };

 const handleDragEnd = () => {
 setDraggedOrder(null);
 };

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 e.dataTransfer.dropEffect = 'move';
 };

 const handleDrop = (e: React.DragEvent, status: string) => {
 e.preventDefault();
 if (draggedOrder && draggedOrder.status !== status) {
 onStatusChange?.(draggedOrder, status);
 }
 setDraggedOrder(null);
 };

 const getOrdersByStatus = (status: string) => {
 return orders.filter(order => order.status === status);
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
 <div className="flex gap-md h-[600px]">
 {statusColumns.map((column) => (
 <div key={column.key} className="flex-1">
 <Card className={`h-full ${column.color}`}>
 <div className="p-md border-b border-border">
 <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
 </div>
 <div className="p-md space-y-md">
 {Array.from({ length: 3 }).map((_, index) => (
 <Card key={index} className="p-md">
 <div className="animate-pulse space-y-sm">
 <div className="flex items-center gap-sm">
 <div className="h-4 w-4 bg-muted rounded"></div>
 <div className="h-4 bg-muted rounded w-3/4"></div>
 </div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 <div className="h-3 bg-muted rounded w-full"></div>
 <div className="h-5 bg-muted rounded w-16"></div>
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
 <div className="flex gap-md h-[600px] overflow-x-auto">
 {statusColumns.map((column) => {
 const columnOrders = getOrdersByStatus(column.key);
 
 return (
 <div key={column.key} className="flex-1 min-w-[320px]">
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
 {columnOrders.length}
 </Badge>
 </div>
 </div>

 {/* Column content */}
 <div className="flex-1 p-md space-y-md overflow-y-auto">
 {columnOrders.length === 0 ? (
 <div className="text-center py-lg text-muted-foreground">
 <div className="text-sm">No {column.label.toLowerCase()} orders</div>
 </div>
 ) : (
 columnOrders.map((order) => {
 const isSelected = selectedOrders.includes(order.id);
 const isDragging = draggedOrder?.id === order.id;
 const overdue = isOverdue(order);

 return (
 <Card
 key={order.id}
 className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary' : ''
 } ${isDragging ? 'opacity-50 rotate-2' : ''} ${
 overdue ? 'border-destructive/50' : ''
 }`}
 draggable
 onDragStart={(e) => handleDragStart(e, order)}
 onDragEnd={handleDragEnd}
 onClick={() => onOrderClick?.(order)}
 >
 <div className="p-md">
 {/* Header */}
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm min-w-0 flex-1">
 <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
 <div className="min-w-0 flex-1">
 <h4 className="font-medium text-sm truncate">{order.order_number}</h4>
 <p className="text-xs text-muted-foreground truncate">{order.vendor_name}</p>
 </div>
 </div>
 <div className="flex items-center gap-xs ml-sm">
 {overdue && (
 <Badge variant="destructive" className="text-xs">
 Overdue
 </Badge>
 )}
 {onViewOrder && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onViewOrder(order);
 }}
 className="h-6 w-6 p-0"
 >
 <Eye className="h-3 w-3" />
 </Button>
 )}
 {onEditOrder && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onEditOrder(order);
 }}
 className="h-6 w-6 p-0"
 >
 <Edit className="h-3 w-3" />
 </Button>
 )}
 </div>
 </div>

 {/* Priority and Payment */}
 <div className="flex items-center gap-sm mb-sm">
 <div className="flex items-center gap-xs">
 <span className="text-xs">{getPriorityIcon(order.priority)}</span>
 <Badge variant={getPriorityColor(order.priority)} className="text-xs">
 {order.priority}
 </Badge>
 </div>
 </div>

 {/* Description */}
 {order.description && (
 <p className="text-xs text-muted-foreground line-clamp-2 mb-sm">
 {order.description}
 </p>
 )}

 {/* Amount */}
 <div className="flex items-center justify-between mb-sm">
 <div className="font-semibold text-sm">
 {formatCurrency(order.total_amount, order.currency)}
 </div>
 </div>

 {/* Dates */}
 <div className="space-y-xs text-xs text-muted-foreground mb-sm">
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3 flex-shrink-0" />
 <span>{formatDate(order.order_date)}</span>
 </div>
 {order.expected_delivery && (
 <div className="flex items-center gap-xs">
 <Truck className="h-3 w-3 flex-shrink-0" />
 <span className={overdue ? 'text-destructive' : ''}>
 {formatDate(order.expected_delivery)}
 </span>
 </div>
 )}
 </div>

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
 <span>Needs Approval</span>
 </div>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between pt-sm border-t border-border text-xs text-muted-foreground">
 <span>{formatDate(order.created_at)}</span>
 <div className="flex items-center gap-xs">
 <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
 <span>{order.id.slice(-6)}</span>
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
