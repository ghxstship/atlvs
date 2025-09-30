'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Checkbox } from '@ghxstship/ui';
import type { TrackingItem } from '../types';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '../types';
import { Check, Edit, Eye, Filter, X } from 'lucide-react';

interface TrackingMapViewProps {
 items: TrackingItem[];
 loading?: boolean;
 selectedItems: string[];
 onSelectionChange: (itemIds: string[]) => void;
 onItemClick?: (item: TrackingItem) => void;
 onEditItem?: (item: TrackingItem) => void;
 onViewItem?: (item: TrackingItem) => void;
}

interface MapMarker {
 id: string;
 lat: number;
 lng: number;
 type: 'origin' | 'destination' | 'current';
 item: TrackingItem;
 title: string;
 description: string;
}

export default function TrackingMapView({
 items,
 loading = false,
 selectedItems,
 onSelectionChange,
 onItemClick,
 onEditItem,
 onViewItem,
}: TrackingMapViewProps) {
 const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
 const [mapExpanded, setMapExpanded] = useState(false);
 const [showFilters, setShowFilters] = useState(false);
 const [statusFilter, setStatusFilter] = useState<string>('all');
 const mapRef = useRef<HTMLDivElement>(null);

 // Mock coordinates for demonstration - in real implementation, you'd geocode addresses
 const generateMockCoordinates = (address: unknown, type: 'origin' | 'destination'): { lat: number; lng: number } => {
 if (!address) return { lat: 0, lng: 0 };
 
 // Mock coordinates based on state (simplified for demo)
 const stateCoords: Record<string, { lat: number; lng: number }> = {
 'CA': { lat: 36.7783, lng: -119.4179 },
 'NY': { lat: 42.1657, lng: -74.9481 },
 'TX': { lat: 31.9686, lng: -99.9018 },
 'FL': { lat: 27.8333, lng: -81.7170 },
 'IL': { lat: 40.3363, lng: -89.0022 },
 'PA': { lat: 41.2033, lng: -77.1945 },
 'OH': { lat: 40.3736, lng: -82.7755 },
 'GA': { lat: 33.76, lng: -84.39 },
 'NC': { lat: 35.771, lng: -78.638 },
 'MI': { lat: 43.3266, lng: -84.5361 },
 };

 const baseCoord = stateCoords[address.state] || { lat: 39.8283, lng: -98.5795 };
 
 // Add some random offset to simulate different cities
 const offset = type === 'origin' ? -0.5 : 0.5;
 return {
 lat: baseCoord.lat + (Math.random() - 0.5) * 2 + offset,
 lng: baseCoord.lng + (Math.random() - 0.5) * 4 + offset,
 };
 };

 const markers: MapMarker[] = items.flatMap(item => {
 const markers: MapMarker[] = [];
 
 if (item.origin_address) {
 const coords = generateMockCoordinates(item.origin_address, 'origin');
 markers.push({
 id: `${item.id}-origin`,
 lat: coords.lat,
 lng: coords.lng,
 type: 'origin',
 item,
 title: `Origin: ${item.order_number}`,
 description: `${item.origin_address.city}, ${item.origin_address.state}`,
 });
 }

 if (item.destination_address) {
 const coords = generateMockCoordinates(item.destination_address, 'destination');
 markers.push({
 id: `${item.id}-destination`,
 lat: coords.lat,
 lng: coords.lng,
 type: 'destination',
 item,
 title: `Destination: ${item.order_number}`,
 description: `${item.destination_address.city}, ${item.destination_address.state}`,
 });
 }

 return markers;
 });

 const filteredMarkers = statusFilter === 'all' 
 ? markers 
 : markers.filter(marker => marker.item.status === statusFilter);

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

 const getMarkerColor = (marker: MapMarker) => {
 if (marker.type === 'origin') return '#10b981'; // green
 if (marker.type === 'destination') return '#3b82f6'; // blue
 return '#f59e0b'; // amber for current location
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'delivered':
 return '✓';
 case 'in_transit':
 return '🚛';
 case 'shipped':
 return '📦';
 case 'delayed':
 return '⚠️';
 default:
 return '⏱️';
 }
 };

 if (loading) {
 return (
 <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
 <div className="text-center">
 <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-500">Loading map...</p>
 </div>
 </div>
 );
 }

 return (
 <div className={`space-y-4 ${mapExpanded ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
 {/* Controls */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <Checkbox
 checked={selectedItems.length === items.length && items.length > 0}
 onCheckedChange={handleSelectAll}
 aria-
 />
 <span className="text-sm text-gray-600">
 {selectedItems.length > 0 ? `${selectedItems.length} selected` : `${filteredMarkers.length} locations`}
 </span>
 </div>

 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setShowFilters(!showFilters)}
 className="flex items-center gap-2"
 >
 <Filter className="h-4 w-4" />
 Filters
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setMapExpanded(!mapExpanded)}
 className="flex items-center gap-2"
 >
 {mapExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
 {mapExpanded ? 'Exit Fullscreen' : 'Fullscreen'}
 </Button>
 </div>
 </div>

 {/* Filters */}
 {showFilters && (
 <Card className="p-4">
 <div className="flex items-center gap-4">
 <label className="text-sm font-medium">Status:</label>
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="px-3 py-1 border rounded-md text-sm"
 >
 <option value="all">All Statuses</option>
 <option value="ordered">Ordered</option>
 <option value="shipped">Shipped</option>
 <option value="in_transit">In Transit</option>
 <option value="out_for_delivery">Out for Delivery</option>
 <option value="delivered">Delivered</option>
 <option value="delayed">Delayed</option>
 </select>
 </div>
 </Card>
 )}

 <div className="flex gap-4 h-full">
 {/* Map Container */}
 <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${mapExpanded ? 'flex-1' : 'flex-1 h-96'}`}>
 {/* Mock Map Interface */}
 <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
 {/* Map Grid */}
 <div className="absolute inset-0 opacity-10">
 <div className="grid grid-cols-12 grid-rows-8 h-full">
 {Array.from({ length: 96 }).map((_, i) => (
 <div key={i} className="border border-gray-300" />
 ))}
 </div>
 </div>

 {/* Markers */}
 {filteredMarkers.map((marker) => (
 <div
 key={marker.id}
 className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
 style={{
 left: `${((marker.lng + 180) / 360) * 100}%`,
 top: `${((90 - marker.lat) / 180) * 100}%`,
 }}
 onClick={() => setSelectedMarker(marker)}
 >
 <div
 className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
 style={{ backgroundColor: getMarkerColor(marker) }}
 >
 {marker.type === 'origin' ? 'O' : marker.type === 'destination' ? 'D' : 'C'}
 </div>
 </div>
 ))}

 {/* Routes (simplified lines between origin and destination) */}
 {items.map((item) => {
 const originMarker = markers.find(m => m.id === `${item.id}-origin`);
 const destMarker = markers.find(m => m.id === `${item.id}-destination`);
 
 if (!originMarker || !destMarker) return null;

 const x1 = ((originMarker.lng + 180) / 360) * 100;
 const y1 = ((90 - originMarker.lat) / 180) * 100;
 const x2 = ((destMarker.lng + 180) / 360) * 100;
 const y2 = ((90 - destMarker.lat) / 180) * 100;

 const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
 const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

 return (
 <div
 key={`route-${item.id}`}
 className="absolute border-t-2 border-dashed border-gray-400 opacity-50"
 style={{
 left: `${x1}%`,
 top: `${y1}%`,
 width: `${length}%`,
 transformOrigin: '0 0',
 transform: `rotate(${angle}deg)`,
 }}
 />
 );
 })}

 {/* Map Controls */}
 <div className="absolute top-4 right-4 flex flex-col gap-2">
 <Button variant="outline" size="sm" className="w-10 h-10 p-0">
 +
 </Button>
 <Button variant="outline" size="sm" className="w-10 h-10 p-0">
 −
 </Button>
 <Button variant="outline" size="sm" className="w-10 h-10 p-0">
 <Navigation className="h-4 w-4" />
 </Button>
 </div>

 {/* Legend */}
 <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
 <h4 className="font-medium text-sm mb-2">Legend</h4>
 <div className="space-y-1 text-xs">
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">O</div>
 <span>Origin</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">D</div>
 <span>Destination</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="border-t-2 border-dashed border-gray-400 w-4"></div>
 <span>Route</span>
 </div>
 </div>
 </div>
 </div>

 {/* Selected Marker Popup */}
 {selectedMarker && (
 <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
 <div className="flex items-start justify-between mb-3">
 <div>
 <h3 className="font-medium">{selectedMarker.title}</h3>
 <p className="text-sm text-gray-600">{selectedMarker.description}</p>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => setSelectedMarker(null)}
 className="h-6 w-6 p-0"
 >
 ×
 </Button>
 </div>

 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <Badge variant={getStatusColor(selectedMarker.item.status)}>
 {selectedMarker.item.status.replace('_', ' ').toUpperCase()}
 </Badge>
 <Badge variant={getPriorityColor(selectedMarker.item.priority)}>
 {selectedMarker.item.priority.toUpperCase()}
 </Badge>
 </div>

 <div className="text-sm space-y-1">
 <p><strong>Carrier:</strong> {selectedMarker.item.carrier}</p>
 <p><strong>Tracking:</strong> <code className="text-xs">{selectedMarker.item.tracking_number}</code></p>
 <p><strong>Value:</strong> {formatCurrency(selectedMarker.item.total_value)}</p>
 {selectedMarker.item.expected_delivery && (
 <p><strong>Expected:</strong> {formatDate(selectedMarker.item.expected_delivery)}</p>
 )}
 </div>

 <div className="flex gap-2 pt-2">
 {onViewItem && (
 <Button
 variant="outline"
 size="sm"
 onClick={() => onViewItem(selectedMarker.item)}
 className="flex items-center gap-1"
 >
 <Eye className="h-3 w-3" />
 View
 </Button>
 )}
 {onEditItem && (
 <Button
 variant="outline"
 size="sm"
 onClick={() => onEditItem(selectedMarker.item)}
 className="flex items-center gap-1"
 >
 <Edit className="h-3 w-3" />
 Edit
 </Button>
 )}
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Sidebar - Item List */}
 {!mapExpanded && (
 <div className="w-80 space-y-4">
 <h3 className="font-medium">Tracking Items</h3>
 <div className="space-y-2 max-h-96 overflow-y-auto">
 {items.map((item) => (
 <Card
 key={item.id}
 className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
 selectedItems.includes(item.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
 }`}
 onClick={() => onItemClick?.(item)}
 >
 <div className="flex items-start gap-3">
 <Checkbox
 checked={selectedItems.includes(item.id)}
 onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
 aria-label={`Select ${item.order_number}`}
 onClick={(e) => e.stopPropagation()}
 />

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <span className="font-medium text-sm">{item.order_number}</span>
 <span className="text-lg">{getStatusIcon(item.status)}</span>
 </div>
 
 <p className="text-xs text-gray-600 mb-2">{item.vendor_name}</p>
 
 <div className="space-y-1 text-xs">
 <div className="flex items-center gap-1">
 <Truck className="h-3 w-3 text-gray-400" />
 <span>{item.carrier}</span>
 </div>
 {item.destination_address && (
 <div className="flex items-center gap-1">
 <MapPin className="h-3 w-3 text-gray-400" />
 <span className="truncate">
 {item.destination_address.city}, {item.destination_address.state}
 </span>
 </div>
 )}
 </div>

 <div className="flex gap-1 mt-2">
 <Badge variant={getStatusColor(item.status)} className="text-xs">
 {item.status.replace('_', ' ').toUpperCase()}
 </Badge>
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 </div>
 )}
 </div>

 {items.length === 0 && (
 <div className="text-center py-12">
 <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking locations found</h3>
 <p className="text-gray-500">Items with address information will appear on the map.</p>
 </div>
 )}
 </div>
 );
}
