import { useState, useEffect } from 'react';
import { Card, Badge, Button } from "@ghxstship/ui";
import type { Location } from "../LocationsClient";
import type { LucideIcon } from "lucide-react";
import { MapPin, Navigation, Eye } from "lucide-react";

interface LocationMapViewProps {
 locations: Location[];
 onView: (location: Location) => void;
 getTypeIcon: (type: string) => LucideIcon;
 getAvailabilityBadgeVariant: (status: string) => any;
}

export default function LocationMapView({
 locations,
 onView,
 getTypeIcon,
 getAvailabilityBadgeVariant
}: LocationMapViewProps) {
 const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
 const [mapError, setMapError] = useState(false);

 // For a real implementation, you would integrate with a mapping library like Mapbox or Google Maps
 // This is a placeholder implementation
 const hasCoordinates = locations.some(l => l.coordinates);

 if (!hasCoordinates) {
 return (
 <div className="text-center py-xl">
 <MapPin className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No Location Coordinates</h3>
 <p className="text-muted-foreground">
 Location coordinates are needed to display the map view.
 Add coordinates to your locations to see them on the map.
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-md">
 {/* Map Container */}
 <div className="relative h-content-xl bg-muted rounded-lg overflow-hidden">
 {/* Placeholder Map */}
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="text-center">
 <MapPin className="mx-auto h-component-md w-component-md text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">Interactive Map</h3>
 <p className="text-muted-foreground mb-md">
 To enable the interactive map, integrate with Google Maps or Mapbox API
 </p>
 <div className="flex items-center gap-sm justify-center">
 <Button
 variant="outline"
 onClick={() => {
 // Open Google Maps with all locations
 const validLocations = locations.filter(l => l.coordinates || l.address);
 if (validLocations.length > 0) {
 const firstLoc = validLocations[0];
 if (firstLoc.coordinates) {
 window.open(`https://maps.google.com/?q=${firstLoc.coordinates.y},${firstLoc.coordinates.x}`, "_blank");
 } else if (firstLoc.address) {
 const query = encodeURIComponent(`${firstLoc.address}, ${firstLoc.city}, ${firstLoc.state}`);
 window.open(`https://maps.google.com/?q=${query}`, "_blank");
 }
 }
 }}
 >
 <Navigation className="mr-2 h-icon-xs w-icon-xs" />
 Open in Google Maps
 </Button>
 </div>
 </div>
 </div>

 {/* Location Markers (Overlay) */}
 {locations.map((location, index) => {
 if (!location.coordinates) return null;
 
 // Simple positioning for demo (would use real lat/lng conversion)
 const left = `${20 + (index % 4) * 20}%`;
 const top = `${20 + Math.floor(index / 4) * 20}%`;
 
 const TypeIcon = getTypeIcon(location.type || "other");
 
 return (
 <div
 key={location.id}
 className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
 style={{ left, top }}
 onClick={() => setSelectedLocation(location)}
 >
 <div className="relative">
 <div className="bg-primary text-primary-foreground rounded-full p-sm shadow-lg hover:scale-110 transition-transform">
 <TypeIcon className="h-icon-xs w-icon-xs" />
 </div>
 {selectedLocation?.id === location.id && (
 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-sm">
 <Card className="p-sm shadow-xl min-w-content-narrow">
 <h4 className="font-semibold text-sm">{location.name}</h4>
 <p className="text-xs text-muted-foreground mt-xs">
 {location.address}
 </p>
 <div className="flex items-center gap-xs mt-xs">
 <Badge 
 variant={getAvailabilityBadgeVariant(location.availability_status || "available")}
 className="text-xs"
 >
 {location.availability_status || "available"}
 </Badge>
 </div>
 <Button
 size="sm"
 className="w-full mt-sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(location);
 }}
 >
 <Eye className="mr-1 h-3 w-3" />
 View Details
 </Button>
 </Card>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>

 {/* Location List Sidebar */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
 {locations.slice(0, 6).map((location) => {
 const TypeIcon = getTypeIcon(location.type || "other");
 
 return (
 <Card
 key={location.id}
 className={`p-sm cursor-pointer hover:shadow-md transition-shadow ${
 selectedLocation?.id === location.id ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => {
 setSelectedLocation(location);
 // In a real implementation, pan map to location
 }}
 >
 <div className="flex items-start gap-sm">
 <div className="bg-muted rounded-md p-xs">
 <TypeIcon className="h-icon-xs w-icon-xs" />
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="font-medium text-sm truncate">{location.name}</h4>
 <p className="text-xs text-muted-foreground truncate">
 {location.address || location.city}
 </p>
 <div className="flex items-center gap-xs mt-xs">
 <Badge 
 variant={getAvailabilityBadgeVariant(location.availability_status || "available")}
 className="text-xs"
 >
 {location.availability_status || "available"}
 </Badge>
 {location.capacity && (
 <span className="text-xs text-muted-foreground">
 Cap: {location.capacity}
 </span>
 )}
 </div>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(location);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 </div>
 </Card>
 );
 })}
 </div>

 {locations.length > 6 && (
 <div className="text-center text-sm text-muted-foreground">
 Showing 6 of {locations.length} locations on map
 </div>
 )}
 </div>
 );
}
