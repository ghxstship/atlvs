'use client';

import { Package, Calendar, DollarSign, Edit, Trash2, Eye, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, CheckCircle, Truck } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import type { ProcurementOrder, OrderSort } from '../types';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, getPaymentStatusColor } from '../types';

interface OrderTableViewProps {
 orders: ProcurementOrder[];
 loading?: boolean;
 selectedOrders: string[];
 onSelectionChange: (orderIds: string[]) => void;
 onOrderClick?: (order: ProcurementOrder) => void;
 onEditOrder?: (order: ProcurementOrder) => void;
 onDeleteOrder?: (order: ProcurementOrder) => void;
 onViewOrder?: (order: ProcurementOrder) => void;
 sort?: OrderSort;
 onSortChange?: (sort: OrderSort) => void;
}

export default function OrderTableView({
 orders,
 loading = false,
 selectedOrders,
 onSelectionChange,
 onOrderClick,
 onEditOrder,
 onDeleteOrder,
 onViewOrder,
 sort,
 onSortChange,
}: OrderTableViewProps) {
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

 const handleSort = (field: OrderSort['field']) => {
 if (!onSortChange) return;

 let direction: 'asc' | 'desc' = 'asc';
 if (sort?.field === field && sort.direction === 'asc') {
 direction = 'desc';
 }

 onSortChange({ field, direction });
 };

 const getSortIcon = (field: OrderSort['field']) => {
 if (sort?.field !== field) {
 return <ArrowUpDown className="h-3 w-3 opacity-50" />;
 }
 return sort.direction === 'asc' 
 ? <ArrowUp className="h-3 w-3" />
 : <ArrowDown className="h-3 w-3" />;
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'delivered':
 case 'received':
 return <CheckCircle className="h-3 w-3 text-success" />;
 case 'ordered':
 return <Truck className="h-3 w-3 text-primary" />;
 case 'cancelled':
 case 'rejected':
 return <AlertCircle className="h-3 w-3 text-destructive" />;
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

 const isOverdue = (order: ProcurementOrder) => {
 if (!order.expected_delivery) return false;
 const now = new Date();
 const expectedDate = new Date(order.expected_delivery);
 return expectedDate < now && !['delivered', 'received', 'cancelled'].includes(order.status);
 };

 if (loading) {
 return (
 <Card>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left p-md w-12">
 <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
 </th>
 <th className="text-left p-md">
 <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
 </th>
 <th className="text-right p-md w-32">
 <div className="h-4 bg-muted rounded w-16 ml-auto animate-pulse"></div>
 </th>
 </tr>
 </thead>
 <tbody>
 {Array.from({ length: 8 }).map((_, index) => (
 <tr key={index} className="border-b border-border">
 <td className="p-md">
 <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-6 bg-muted rounded-full w-16 animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-6 bg-muted rounded-full w-12 animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
 </td>
 <td className="p-md">
 <div className="flex justify-end gap-xs">
 <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
 <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
 <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 );
 }

 if (orders.length === 0) {
 return (
 <Card className="p-xl text-center">
 <Package className="h-12 w-12 mx-auto mb-md text-muted-foreground opacity-50" />
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
 {selectedOrders.length > 0 && (
 <div className="flex items-center gap-sm p-sm bg-primary/5 border border-primary/20 rounded-lg">
 <span className="text-sm font-medium">
 {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
 </span>
 <Button
 size="sm"
 variant="outline"
 onClick={() => onSelectionChange([])}
 >
 Clear selection
 </Button>
 </div>
 )}

 {/* Table */}
 <Card>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left p-md w-12">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={handleSelectAll}
 />
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('order_number')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Order Number
 {getSortIcon('order_number')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('vendor_name')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Vendor
 {getSortIcon('vendor_name')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('status')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Status
 {getSortIcon('status')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('priority')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Priority
 {getSortIcon('priority')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('total_amount')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Amount
 {getSortIcon('total_amount')}
 </Button>
 </th>
 <th className="text-left p-md">Payment</th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('order_date')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Order Date
 {getSortIcon('order_date')}
 </Button>
 </th>
 <th className="text-left p-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('expected_delivery')}
 className="h-auto p-0 font-medium hover:bg-transparent"
 >
 Expected Delivery
 {getSortIcon('expected_delivery')}
 </Button>
 </th>
 <th className="text-right p-md w-32">Actions</th>
 </tr>
 </thead>
 <tbody>
 {orders.map((order) => {
 const isSelected = selectedOrders.includes(order.id);
 const overdue = isOverdue(order);

 return (
 <tr
 key={order.id}
 className={`border-b border-border hover:bg-muted/30 transition-colors ${
 isSelected ? 'bg-primary/5' : ''
 } ${overdue ? 'bg-destructive/5' : ''}`}
 >
 <td className="p-md">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleOrderSelection(order.id, checked as boolean)}
 />
 </td>
 <td 
 className="p-md cursor-pointer"
 onClick={() => onOrderClick?.(order)}
 >
 <div className="flex items-center gap-sm">
 {getStatusIcon(order.status)}
 <div className="min-w-0">
 <div className="font-medium truncate">{order.order_number}</div>
 {order.tracking_number && (
 <div className="text-sm text-muted-foreground truncate">
 Tracking: {order.tracking_number}
 </div>
 )}
 </div>
 </div>
 </td>
 <td className="p-md">
 <div className="min-w-0">
 <div className="font-medium truncate">{order.vendor_name}</div>
 {order.description && (
 <div className="text-sm text-muted-foreground truncate max-w-[200px]">
 {order.description}
 </div>
 )}
 </div>
 </td>
 <td className="p-md">
 <Badge variant={getStatusColor(order.status)}>
 {order.status.replace('_', ' ')}
 </Badge>
 {overdue && (
 <Badge variant="destructive" className="ml-xs text-xs">
 Overdue
 </Badge>
 )}
 </td>
 <td className="p-md">
 <div className="flex items-center gap-xs">
 <span className="text-sm">{getPriorityIcon(order.priority)}</span>
 <Badge variant={getPriorityColor(order.priority)} className="text-xs">
 {order.priority}
 </Badge>
 </div>
 </td>
 <td className="p-md">
 <div className="font-medium">
 {formatCurrency(order.total_amount, order.currency)}
 </div>
 </td>
 <td className="p-md">
 <Badge variant={getPaymentStatusColor(order.payment_status)} className="text-xs">
 {order.payment_status.replace('_', ' ')}
 </Badge>
 </td>
 <td className="p-md">
 <span className="text-sm">
 {formatDate(order.order_date)}
 </span>
 </td>
 <td className="p-md">
 {order.expected_delivery ? (
 <span className={`text-sm ${overdue ? 'text-destructive font-medium' : ''}`}>
 {formatDate(order.expected_delivery)}
 </span>
 ) : (
 <span className="text-muted-foreground">-</span>
 )}
 </td>
 <td className="p-md">
 <div className="flex items-center justify-end gap-xs">
 {onViewOrder && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onViewOrder(order);
 }}
 title="View order"
 >
 <Eye className="h-4 w-4" />
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
 title="Edit order"
 >
 <Edit className="h-4 w-4" />
 </Button>
 )}
 {onDeleteOrder && (
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 onDeleteOrder(order);
 }}
 title="Delete order"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 )}
 <Button
 size="sm"
 variant="ghost"
 onClick={(e) => {
 e.stopPropagation();
 // Show more options menu
 }}
 title="More options"
 >
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 );
}
