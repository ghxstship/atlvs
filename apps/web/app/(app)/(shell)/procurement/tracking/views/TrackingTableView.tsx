'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Checkbox } from '@ghxstship/ui';
import Link from 'next/link';
import type { TrackingItem, TrackingSort } from '../types';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, getPerformanceColor, calculateDeliveryPerformance } from '../types';

interface TrackingTableViewProps {
 items: TrackingItem[];
 loading?: boolean;
 selectedItems: string[];
 onSelectionChange: (itemIds: string[]) => void;
 onItemClick?: (item: TrackingItem) => void;
 onEditItem?: (item: TrackingItem) => void;
 onViewItem?: (item: TrackingItem) => void;
 onTrackPackage?: (item: TrackingItem) => void;
 sort?: TrackingSort;
 onSortChange?: (sort: TrackingSort) => void;
 visibleFields?: string[];
}

const defaultVisibleFields = [
 'order_number',
 'tracking_number',
 'carrier',
 'status',
 'expected_delivery',
 'actual_delivery',
 'origin',
 'destination',
 'priority',
 'total_value',
 'performance'
];

export default function TrackingTableView({
 items,
 loading = false,
 selectedItems,
 onSelectionChange,
 onItemClick,
 onEditItem,
 onViewItem,
 onTrackPackage,
 sort,
 onSortChange,
 visibleFields = defaultVisibleFields,
}: TrackingTableViewProps) {
 const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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

 const handleSort = (field: string) => {
 if (!onSortChange) return;
 
 const newDirection = sort?.field === field && sort?.direction === 'asc' ? 'desc' : 'asc';
 onSortChange({ field, direction: newDirection });
 };

 const getSortIcon = (field: string) => {
 if (sort?.field !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
 return <ArrowUpDown className={`h-4 w-4 ${sort.direction === 'asc' ? 'rotate-180' : ''}`} />;
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'delivered':
 return <CheckCircle className="h-4 w-4 text-green-500" />;
 case 'in_transit':
 return <Truck className="h-4 w-4 text-blue-500" />;
 case 'shipped':
 return <Package className="h-4 w-4 text-orange-500" />;
 case 'delayed':
 return <AlertCircle className="h-4 w-4 text-red-500" />;
 default:
 return <Clock className="h-4 w-4 text-gray-500" />;
 }
 };

 const renderCell = (item: TrackingItem, field: string) => {
 switch (field) {
 case 'order_number':
 return (
 <div className="flex items-center gap-2">
 <Package className="h-4 w-4 text-gray-500" />
 <Link href={`/procurement/orders/${item.order_id as any as any}`} className="font-medium text-blue-600 hover:underline">
 {item.order_number}
 </Link>
 </div>
 );

 case 'tracking_number':
 return (
 <div className="flex items-center gap-2">
 <span className="font-mono text-sm">{item.tracking_number}</span>
 {onTrackPackage && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onTrackPackage(item)}
 className="h-6 w-6 p-0"
 >
 <ExternalLink className="h-3 w-3" />
 </Button>
 )}
 </div>
 );

 case 'carrier':
 return (
 <div className="flex items-center gap-2">
 <Truck className="h-4 w-4 text-gray-500" />
 <span>{item.carrier}</span>
 </div>
 );

 case 'status':
 return (
 <div className="flex items-center gap-2">
 {getStatusIcon(item.status)}
 <Badge variant={getStatusColor(item.status)}>
 {item.status.replace('_', ' ').toUpperCase()}
 </Badge>
 </div>
 );

 case 'expected_delivery':
 return item.expected_delivery ? (
 <div className="flex items-center gap-2">
 <Calendar className="h-4 w-4 text-gray-500" />
 <span>{formatDate(item.expected_delivery)}</span>
 </div>
 ) : (
 <span className="text-gray-400">—</span>
 );

 case 'actual_delivery':
 return item.actual_delivery ? (
 <div className="flex items-center gap-2">
 <CheckCircle className="h-4 w-4 text-green-500" />
 <span>{formatDate(item.actual_delivery)}</span>
 </div>
 ) : (
 <span className="text-gray-400">—</span>
 );

 case 'origin':
 return item.origin_address ? (
 <div className="flex items-center gap-2">
 <MapPin className="h-4 w-4 text-gray-500" />
 <span className="truncate max-w-32" title={`${item.origin_address.city}, ${item.origin_address.state}`}>
 {item.origin_address.city}, {item.origin_address.state}
 </span>
 </div>
 ) : (
 <span className="text-gray-400">—</span>
 );

 case 'destination':
 return item.destination_address ? (
 <div className="flex items-center gap-2">
 <MapPin className="h-4 w-4 text-blue-500" />
 <span className="truncate max-w-32" title={`${item.destination_address.city}, ${item.destination_address.state}`}>
 {item.destination_address.city}, {item.destination_address.state}
 </span>
 </div>
 ) : (
 <span className="text-gray-400">—</span>
 );

 case 'priority':
 return (
 <Badge variant={getPriorityColor(item.priority)}>
 {item.priority.toUpperCase()}
 </Badge>
 );

 case 'total_value':
 return (
 <span className="font-medium">
 {formatCurrency(item.total_value)}
 </span>
 );

 case 'performance':
 const performance = calculateDeliveryPerformance(item);
 return performance ? (
 <Badge variant={getPerformanceColor(performance.status)}>
 {performance.status === 'on_time' ? 'On Time' : 
 performance.status === 'early' ? `${performance.days_difference}d Early` :
 `${Math.abs(performance.days_difference)}d Late`}
 </Badge>
 ) : (
 <span className="text-gray-400">—</span>
 );

 default:
 return <span className="text-gray-400">—</span>;
 }
 };

 const fieldLabels: Record<string, string> = {
 order_number: 'Order',
 tracking_number: 'Tracking',
 carrier: 'Carrier',
 status: 'Status',
 expected_delivery: 'Expected',
 actual_delivery: 'Delivered',
 origin: 'Origin',
 destination: 'Destination',
 priority: 'Priority',
 total_value: 'Value',
 performance: 'Performance',
 };

 if (loading) {
 return (
 <div className="space-y-4">
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
 ))}
 </div>
 );
 }

 return (
 <div className="border rounded-lg overflow-hidden">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-12">
 <Checkbox
 checked={selectedItems.length === items.length && items.length > 0}
 onCheckedChange={handleSelectAll}
 aria-
 />
 </TableHead>
 {visibleFields.map((field) => (
 <TableHead 
 key={field}
 className="cursor-pointer hover:bg-gray-50"
 onClick={() => handleSort(field)}
 >
 <div className="flex items-center gap-2">
 {fieldLabels[field] || field}
 {getSortIcon(field)}
 </div>
 </TableHead>
 ))}
 <TableHead className="w-24">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {items.map((item) => (
 <TableRow
 key={item.id}
 className={`cursor-pointer hover:bg-gray-50 ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}
 onMouseEnter={() => setHoveredRow(item.id)}
 onMouseLeave={() => setHoveredRow(null)}
 onClick={() => onItemClick?.(item)}
 >
 <TableCell onClick={(e) => e.stopPropagation()}>
 <Checkbox
 checked={selectedItems.includes(item.id)}
 onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
 aria-label={`Select ${item.order_number}`}
 />
 </TableCell>
 {visibleFields.map((field) => (
 <TableCell key={field}>
 {renderCell(item, field)}
 </TableCell>
 ))}
 <TableCell onClick={(e) => e.stopPropagation()}>
 <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === item.id ? 'opacity-100' : 'opacity-0'}`}>
 {onViewItem && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onViewItem(item)}
 className="h-8 w-8 p-0"
 >
 <Eye className="h-4 w-4" />
 </Button>
 )}
 {onEditItem && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEditItem(item)}
 className="h-8 w-8 p-0"
 >
 <Edit className="h-4 w-4" />
 </Button>
 )}
 {onTrackPackage && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onTrackPackage(item)}
 className="h-8 w-8 p-0"
 >
 <ExternalLink className="h-4 w-4" />
 </Button>
 )}
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 
 {items.length === 0 && (
 <div className="text-center py-12">
 <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking items found</h3>
 <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
 </div>
 )}
 </div>
 );
}
