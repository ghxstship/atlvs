'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useState } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import Link from 'next/link';
import type { TrackingItem, TrackingEvent } from '../types';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getPriorityColor, getPerformanceColor, calculateDeliveryPerformance } from '../types';

interface TrackingTimelineViewProps {
 items: TrackingItem[];
 loading?: boolean;
 selectedItems: string[];
 onSelectionChange: (itemIds: string[]) => void;
 onItemClick?: (item: TrackingItem) => void;
 onEditItem?: (item: TrackingItem) => void;
 onViewItem?: (item: TrackingItem) => void;
 onTrackPackage?: (item: TrackingItem) => void;
}

export default function TrackingTimelineView({
 items,
 loading = false,
 selectedItems,
 onSelectionChange,
 onItemClick,
 onEditItem,
 onViewItem,
 onTrackPackage,
}: TrackingTimelineViewProps) {
 const [expandedItems, setExpandedItems] = useState<Set<string>(new Set());

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

 const toggleExpanded = (itemId: string) => {
 const newExpanded = new Set(expandedItems);
 if (newExpanded.has(itemId)) {
 newExpanded.delete(itemId);
 } else {
 newExpanded.add(itemId);
 }
 setExpandedItems(newExpanded);
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'delivered':
 return <CheckCircle className="h-5 w-5 text-green-500" />;
 case 'in_transit':
 return <Truck className="h-5 w-5 text-blue-500" />;
 case 'shipped':
 return <Package className="h-5 w-5 text-orange-500" />;
 case 'delayed':
 return <AlertCircle className="h-5 w-5 text-red-500" />;
 default:
 return <Clock className="h-5 w-5 text-gray-500" />;
 }
 };

 const getEventIcon = (eventType: string) => {
 switch (eventType) {
 case 'shipped':
 return <Package className="h-4 w-4 text-orange-500" />;
 case 'in_transit':
 return <Truck className="h-4 w-4 text-blue-500" />;
 case 'out_for_delivery':
 return <Truck className="h-4 w-4 text-green-500" />;
 case 'delivered':
 return <CheckCircle className="h-4 w-4 text-green-500" />;
 case 'exception':
 return <AlertCircle className="h-4 w-4 text-red-500" />;
 default:
 return <Clock className="h-4 w-4 text-gray-500" />;
 }
 };

 const sortedItems = [...items].sort((a, b) => {
 // Sort by most recent activity first
 const aLatest = a.events?.[0]?.timestamp || a.updated_at;
 const bLatest = b.events?.[0]?.timestamp || b.updated_at;
 return new Date(bLatest).getTime() - new Date(aLatest).getTime();
 });

 if (loading) {
 return (
 <div className="space-y-6">
 {Array.from({ length: 3 }).map((_, i) => (
 <Card key={i} className="p-6">
 <div className="animate-pulse">
 <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
 <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
 <div className="h-4 bg-gray-200 rounded w-2/3" />
 </div>
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Header Controls */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <Checkbox
 checked={selectedItems.length === items.length && items.length > 0}
 onCheckedChange={handleSelectAll}
 aria-
 />
 <span className="text-sm text-gray-600">
 {selectedItems.length > 0 ? `${selectedItems.length} selected` : `${items.length} items`}
 </span>
 </div>
 </div>

 {/* Timeline Items */}
 <div className="relative">
 {/* Timeline Line */}
 <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

 <div className="space-y-8">
 {sortedItems.map((item, index) => {
 const isExpanded = expandedItems.has(item.id);
 const isSelected = selectedItems.includes(item.id);
 const performance = calculateDeliveryPerformance(item);
 const latestEvent = item.events?.[0];

 return (
 <div key={item.id} className="relative">
 {/* Timeline Node */}
 <div className="absolute left-6 w-4 h-4 bg-white border-2 border-gray-300 rounded-full z-10">
 <div className="absolute inset-0.5 rounded-full bg-blue-500" />
 </div>

 <Card className={`ml-16 p-6 transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}>
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-4 flex-1">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
 aria-label={`Select ${item.order_number}`}
 onClick={(e) => e.stopPropagation()}
 />

 <div className="flex-1 min-w-0">
 {/* Header */}
 <div className="flex items-center gap-3 mb-3">
 {getStatusIcon(item.status)}
 <div>
 <div className="flex items-center gap-2">
 <Link 
 href={`/procurement/orders/${item.order_id as any as any}`}
 className="font-semibold text-lg text-blue-600 hover:underline"
 >
 {item.order_number}
 </Link>
 <Badge variant={getStatusColor(item.status)}>
 {item.status.replace('_', ' ').toUpperCase()}
 </Badge>
 <Badge variant={getPriorityColor(item.priority)}>
 {item.priority.toUpperCase()}
 </Badge>
 </div>
 <p className="text-sm text-gray-600 mt-1">
 {item.vendor_name} • {formatCurrency(item.total_value)}
 </p>
 </div>
 </div>

 {/* Tracking Info */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
 <div className="flex items-center gap-2">
 <Truck className="h-4 w-4 text-gray-500" />
 <div>
 <p className="text-sm font-medium">{item.carrier}</p>
 <p className="text-xs text-gray-500 font-mono">{item.tracking_number}</p>
 </div>
 </div>

 {item.expected_delivery && (
 <div className="flex items-center gap-2">
 <Calendar className="h-4 w-4 text-gray-500" />
 <div>
 <p className="text-sm font-medium">Expected</p>
 <p className="text-xs text-gray-500">{formatDate(item.expected_delivery)}</p>
 </div>
 </div>
 )}

 {item.actual_delivery && (
 <div className="flex items-center gap-2">
 <CheckCircle className="h-4 w-4 text-green-500" />
 <div>
 <p className="text-sm font-medium">Delivered</p>
 <p className="text-xs text-gray-500">{formatDate(item.actual_delivery)}</p>
 </div>
 </div>
 )}

 {performance && (
 <div className="flex items-center gap-2">
 <Clock className="h-4 w-4 text-gray-500" />
 <div>
 <p className="text-sm font-medium">Performance</p>
 <Badge variant={getPerformanceColor(performance.status)} className="text-xs">
 {performance.status === 'on_time' ? 'On Time' : 
 performance.status === 'early' ? `${performance.days_difference}d Early` :
 `${Math.abs(performance.days_difference)}d Late`}
 </Badge>
 </div>
 </div>
 )}
 </div>

 {/* Latest Event */}
 {latestEvent && (
 <div className="bg-gray-50 rounded-lg p-3 mb-4">
 <div className="flex items-center gap-2 mb-1">
 {getEventIcon(latestEvent.event_type)}
 <span className="font-medium text-sm">Latest Update</span>
 <span className="text-xs text-gray-500">{formatDateTime(latestEvent.timestamp)}</span>
 </div>
 <p className="text-sm text-gray-700">{latestEvent.description}</p>
 {latestEvent.location && (
 <div className="flex items-center gap-1 mt-1">
 <MapPin className="h-3 w-3 text-gray-400" />
 <span className="text-xs text-gray-500">{latestEvent.location}</span>
 </div>
 )}
 </div>
 )}

 {/* Expandable Events */}
 {item.events && item.events.length > 1 && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => toggleExpanded(item.id)}
 className="mb-4"
 >
 <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
 {isExpanded ? 'Hide' : 'Show'} tracking history ({item.events.length - 1} more events)
 </Button>
 )}

 {isExpanded && item.events && (
 <div className="space-y-3 mb-4 pl-4 border-l-2 border-gray-200">
 {item.events.slice(1).map((event, eventIndex) => (
 <div key={eventIndex} className="flex items-start gap-3">
 <div className="mt-0.5">
 {getEventIcon(event.event_type)}
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="font-medium text-sm capitalize">
 {event.event_type.replace('_', ' ')}
 </span>
 <span className="text-xs text-gray-500">
 {formatDateTime(event.timestamp)}
 </span>
 </div>
 <p className="text-sm text-gray-700">{event.description}</p>
 {event.location && (
 <div className="flex items-center gap-1 mt-1">
 <MapPin className="h-3 w-3 text-gray-400" />
 <span className="text-xs text-gray-500">{event.location}</span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Route Info */}
 {(item.origin_address || item.destination_address) && (
 <div className="flex items-center gap-4 text-sm text-gray-600">
 {item.origin_address && (
 <div className="flex items-center gap-1">
 <MapPin className="h-4 w-4 text-gray-400" />
 <span>From: {item.origin_address.city}, {item.origin_address.state}</span>
 </div>
 )}
 {item.origin_address && item.destination_address && (
 <ChevronRight className="h-4 w-4 text-gray-400" />
 )}
 {item.destination_address && (
 <div className="flex items-center gap-1">
 <MapPin className="h-4 w-4 text-blue-500" />
 <span>To: {item.destination_address.city}, {item.destination_address.state}</span>
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2 ml-4">
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
 </div>
 </Card>
 </div>
 );
 })}
 </div>
 </div>

 {items.length === 0 && (
 <div className="text-center py-12">
 <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking timeline available</h3>
 <p className="text-gray-500">Tracking events will appear here as they occur.</p>
 </div>
 )}
 </div>
 );
}
