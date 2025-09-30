"use client";

import Image from "next/image";
import { Card, Badge, Button, Checkbox } from "@ghxstship/ui";
import type { Location } from "../LocationsClient";
import type { LucideIcon } from "lucide-react";
import { Copy, Edit, MapPin, Navigation, Phone, Trash2, Users } from "lucide-react";

interface LocationGridViewProps {
 locations: Location[];
 selectedLocations: Set<string>;
 onSelectLocation: (id: string) => void;
 onView: (location: Location) => void;
 onEdit: (location: Location) => void;
 onDelete: (location: Location) => void;
 onDuplicate: (location: Location) => void;
 onNavigate: (location: Location) => void;
 getTypeIcon: (type: string) => LucideIcon;
 getAvailabilityBadgeVariant: (status: string) => any;
 getTypeBadgeVariant: (type: string) => any;
}

export default function LocationGridView({
 locations,
 selectedLocations,
 onSelectLocation,
 onView,
 onEdit,
 onDelete,
 onDuplicate,
 onNavigate,
 getTypeIcon,
 getAvailabilityBadgeVariant,
 getTypeBadgeVariant,
}: LocationGridViewProps) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {locations.map((location) => {
 const TypeIcon = getTypeIcon(location.type || "other");
 
 return (
 <Card
 key={location.id}
 className={`p-md cursor-pointer hover:shadow-lg transition-shadow ${
 selectedLocations.has(location.id) ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onView(location)}
 >
 <div className="flex items-start justify-between mb-sm">
 <Checkbox
 checked={selectedLocations.has(location.id)}
 onChange={() => onSelectLocation(location.id)}
 onClick={(e: React.MouseEvent) => e.stopPropagation()}
 />
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(location);
 }}
 >
 <Edit className="h-4 w-4" />
 </Button>

 </div>

 <div className="space-y-sm">
 {/* Location Image or Icon */}
 {location.images && location.images.length > 0 ? (
 <div className="h-32 bg-muted rounded-md overflow-hidden">
 <Image
 src={location.images[0]}
 alt={location.name}
 width={512}
 height={256}
 className="h-full w-full object-cover"
 unoptimized
 />
 </div>
 ) : (
 <div className="h-32 bg-muted rounded-md flex items-center justify-center">
 <TypeIcon className="h-12 w-12 text-muted-foreground" />
 </div>
 )}
 <div>
 <h3 className="font-semibold line-clamp-1">{location.name}</h3>
 <div className="flex items-center gap-xs mt-xs">
 <Badge variant={getTypeBadgeVariant(location.type || "other")}>
 {location.type || "other"}
 </Badge>
 <Badge variant={getAvailabilityBadgeVariant(location.availability_status || "available")}>
 {location.availability_status || "available"}
 </Badge>
 </div>
 </div>

 {/* Address */}
 {(location.address || location.city) && (
 <div className="flex items-start gap-xs text-sm text-muted-foreground">
 <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
 <span className="line-clamp-2">
 {[location.address, location.city, location.state]
 .filter(Boolean)
 .join(", ")}
 </span>
 </div>
 )}

 {/* Capacity */}
 {location.capacity && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Users className="h-3 w-3" />
 <span>Capacity: {location.capacity}</span>
 </div>
 )}

 {/* Size */}
 {location.size && (
 <div className="text-sm text-muted-foreground">
 {location.size.toLocaleString()} sq ft
 </div>
 )}

 {/* Rental Rate */}
 {location.rental_rate && (
 <div className="text-sm font-medium">
 {location.currency || "$"}{location.rental_rate.toLocaleString()}/day
 </div>
 )}

 {/* Project */}
 {location.project && (
 <div className="text-sm text-muted-foreground truncate">
 Project: {location.project.name}
 </div>
 )}

 {/* Contact */}
 {location.contact_name && (
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Phone className="h-3 w-3" />
 <span className="truncate">{location.contact_name}</span>
 </div>
 )}

 {/* Featured Badge */}
 {location.is_featured && (
 <Badge variant="warning">Featured</Badge>
 )}

 {/* Actions */}
 <div className="flex items-center gap-xs pt-sm border-t">
 <Button
 variant="outline"
 size="sm"
 className="flex-1"
 onClick={(e) => {
 e.stopPropagation();
 onNavigate(location);
 }}
 >
 <Navigation className="h-3 w-3 mr-1" />
 Navigate
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDuplicate(location);
 }}
 >
 <Copy className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(location);
 }}
 >
 <Trash2 className="h-4 w-4 text-destructive" />
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 );
}
