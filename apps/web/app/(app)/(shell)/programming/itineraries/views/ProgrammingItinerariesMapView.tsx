"use client";

import { MapPin, Edit, Eye, Trash2, Search, Filter, Users, DollarSign, Calendar, Navigation } from "lucide-react";
import { useState, useMemo } from "react";
import {
 Badge,
 Button,
 Card,
 Input,
} from "@ghxstship/ui";
import type { ProgrammingItinerary, ItinerarySort } from "../types";
import { STATUS_BADGE, TYPE_BADGE, TRANSPORTATION_TYPE_LABEL } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingItinerariesMapViewProps = {
 itineraries: ProgrammingItinerary[];
 loading: boolean;
 selectedItineraries: Set<string>;
 onSelectionChange: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onEdit: (itinerary: ProgrammingItinerary) => void;
 onView: (itinerary: ProgrammingItinerary) => void;
 onDelete: (itinerary: ProgrammingItinerary) => void;
 sortConfig: ItinerarySort;
 onSort: (sort: ItinerarySort) => void;
 users: User[];
};

interface LocationGroup {
 location: string;
 coordinates?: { lat: number; lng: number };
 itineraries: ProgrammingItinerary[];
}

export default function ProgrammingItinerariesMapView({
 itineraries,
 loading,
 selectedItineraries,
 onSelectionChange,
 onSelectAll,
 onEdit,
 onView,
 onDelete,
 sortConfig,
 onSort,
 users,
}: ProgrammingItinerariesMapViewProps) {
 const [searchLocation, setSearchLocation] = useState("");
 const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

 const locationGroups = useMemo(() => {
 const groups: { [key: string]: ProgrammingItinerary[] } = {};
 
 itineraries.forEach((itinerary) => {
 // Group by primary location
 const location = itinerary.location || "Unknown Location";
 if (!groups[location]) {
 groups[location] = [];
 }
 groups[location].push(itinerary);

 // Also group by destinations
 itinerary.destinations.forEach((destination) => {
 const destLocation = destination.name;
 if (!groups[destLocation]) {
 groups[destLocation] = [];
 }
 if (!groups[destLocation].includes(itinerary)) {
 groups[destLocation].push(itinerary);
 }
 });
 });

 return Object.entries(groups)
 .map(([location, items]) => ({
 location,
 itineraries: items,
 coordinates: undefined, // In a real implementation, you'd geocode these
 }))
 .filter(group => 
 group.location.toLowerCase().includes(searchLocation.toLowerCase())
 )
 .sort((a, b) => b.itineraries.length - a.itineraries.length);
 }, [itineraries, searchLocation]);

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString();
 };

 const formatCurrency = (amount: number | null, currency: string | null) => {
 if (!amount || !currency) return null;
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency,
 }).format(amount);
 };

 const getUserName = (userId: string) => {
 const user = users.find((u) => u.id === userId);
 return user?.full_name || user?.email || "Unknown User";
 };

 const getLocationStats = (locationGroup: LocationGroup) => {
 const totalCost = locationGroup.itineraries.reduce((sum, itinerary) => {
 return sum + (itinerary.total_cost || 0);
 }, 0);

 const totalParticipants = locationGroup.itineraries.reduce((sum, itinerary) => {
 return sum + (itinerary.participants_count || 0);
 }, 0);

 const statusCounts = locationGroup.itineraries.reduce((counts, itinerary) => {
 counts[itinerary.status] = (counts[itinerary.status] || 0) + 1;
 return counts;
 }, {} as Record<string, number>);

 return { totalCost, totalParticipants, statusCounts };
 };

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-xsxl">
 <div className="text-center">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading map data...</p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Map Controls */}
 <Card className="p-md">
 <div className="flex items-center gap-md">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search locations..."
 value={searchLocation}
 onChange={(e) => setSearchLocation(e.target.value)}
 className="pl-10"
 />
 </div>
 
 <div className="flex items-center gap-sm text-sm text-muted-foreground">
 <MapPin className="h-icon-xs w-icon-xs" />
 <span>{locationGroups.length} locations</span>
 </div>
 </div>
 </Card>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
 {/* Map Placeholder */}
 <div className="lg:col-span-2">
 <Card className="p-lg">
 <div className="aspect-[16/10] bg-muted/30 rounded-lg flex items-center justify-center">
 <div className="text-center">
 <MapPin className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-medium mb-2">Interactive Map</h3>
 <p className="text-muted-foreground mb-4">
 Map integration would display itinerary locations and routes
 </p>
 <div className="grid grid-cols-2 gap-md text-sm">
 <div className="text-center">
 <div className="font-medium">{itineraries.length}</div>
 <div className="text-muted-foreground">Total Itineraries</div>
 </div>
 <div className="text-center">
 <div className="font-medium">{locationGroups.length}</div>
 <div className="text-muted-foreground">Unique Locations</div>
 </div>
 </div>
 </div>
 </div>
 </Card>
 </div>

 {/* Location List */}
 <div className="space-y-md">
 <h3 className="text-lg font-medium">Locations</h3>
 
 {locationGroups.length === 0 ? (
 <Card className="p-md">
 <div className="text-center py-xl">
 <MapPin className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No locations found</p>
 </div>
 </Card>
 ) : (
 <div className="space-y-sm max-h-content-xl overflow-y-auto">
 {locationGroups.map((locationGroup) => {
 const stats = getLocationStats(locationGroup);
 const isSelected = selectedLocation === locationGroup.location;

 return (
 <Card
 key={locationGroup.location}
 className={`p-md cursor-pointer transition-all hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
 }`}
 onClick={() => setSelectedLocation(
 isSelected ? null : locationGroup.location
 )}
 >
 <div className="space-y-sm">
 {/* Location Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-sm">
 <MapPin className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h4 className="font-medium">{locationGroup.location}</h4>
 </div>
 <div className="text-sm text-muted-foreground mt-1">
 {locationGroup.itineraries.length} itinerary{locationGroup.itineraries.length !== 1 ? 'ies' : ''}
 </div>
 </div>
 
 <Button variant="ghost" size="sm">
 <Navigation className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 {/* Location Stats */}
 <div className="grid grid-cols-2 gap-md text-xs">
 {stats.totalParticipants > 0 && (
 <div className="flex items-center gap-xs">
 <Users className="h-3 w-3" />
 <span>{stats.totalParticipants} participants</span>
 </div>
 )}
 
 {stats.totalCost > 0 && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-3 w-3" />
 <span>${stats.totalCost.toLocaleString()}</span>
 </div>
 )}
 </div>

 {/* Status Distribution */}
 <div className="flex flex-wrap gap-xs">
 {Object.entries(stats.statusCounts).map(([status, count]) => {
 const statusConfig = STATUS_BADGE[status as keyof typeof STATUS_BADGE];
 return (
 <Badge key={status} variant={statusConfig.variant} className="text-xs">
 {count} {statusConfig.label}
 </Badge>
 );
 })}
 </div>

 {/* Expanded Details */}
 {isSelected && (
 <div className="pt-sm border-t space-y-sm">
 {locationGroup.itineraries.map((itinerary) => {
 const statusConfig = STATUS_BADGE[itinerary.status];
 const typeConfig = TYPE_BADGE[itinerary.type];
 const isItinerarySelected = selectedItineraries.has(itinerary.id);

 return (
 <div
 key={itinerary.id}
 className={`p-sm rounded border transition-all ${
 isItinerarySelected ? 'bg-primary/10 border-primary/20' : 'bg-muted/30'
 }`}
 >
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <div className="font-medium text-sm truncate">
 {itinerary.name}
 </div>
 <div className="flex items-center gap-xs mt-1">
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>
 
 <div className="flex items-center gap-xs mt-1 text-xs text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 {formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
 </div>
 </div>

 {/* Transportation */}
 {itinerary.transportation_type && (
 <div className="text-xs text-muted-foreground mt-1">
 Transport: {TRANSPORTATION_TYPE_LABEL[itinerary.transportation_type]}
 </div>
 )}

 {/* Destinations */}
 {itinerary.destinations.length > 0 && (
 <div className="mt-1">
 <div className="text-xs text-muted-foreground">Destinations:</div>
 <div className="flex flex-wrap gap-xs mt-0.5">
 {itinerary.destinations.slice(0, 3).map((dest, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {dest.name}
 </Badge>
 ))}
 {itinerary.destinations.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{itinerary.destinations.length - 3} more
 </Badge>
 )}
 </div>
 </div>
 )}
 </div>

 <div className="flex items-center gap-xs ml-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(itinerary);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(itinerary);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(itinerary);
 }}
 >
 <Trash2 className="h-3 w-3 text-destructive" />
 </Button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
