"use client";

import Image from 'next/image';
import { Card, Badge, Button, Checkbox } from "@ghxstship/ui";
import type { Location } from "../LocationsClient";
import type { LucideIcon } from "lucide-react";
import { ImageOff, MapPin, Users, Phone, Mail, Navigation, Eye, Edit, Trash2 } from "lucide-react";

interface LocationGalleryViewProps {
 locations: Location[];
 selectedLocations: Set<string>;
 onSelectLocation: (id: string) => void;
 onView: (location: Location) => void;
 onEdit: (location: Location) => void;
 onDelete: (location: Location) => void;
 onNavigate: (location: Location) => void;
 getTypeIcon: (type: string) => LucideIcon;
 getAvailabilityBadgeVariant: (status: string) => any;
}

export default function LocationGalleryView({
 locations,
 selectedLocations,
 onSelectLocation,
 onView,
 onEdit,
 onDelete,
 onNavigate,
 getTypeIcon,
 getAvailabilityBadgeVariant
}: LocationGalleryViewProps) {
 // Filter locations with images for gallery view
 const locationsWithImages = locations.filter(l => l.images && l.images.length > 0);
 const locationsWithoutImages = locations.filter(l => !l.images || l.images.length === 0);

 if (locationsWithImages.length === 0) {
 return (
 <div className="text-center py-xl">
 <ImageOff className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No Location Images</h3>
 <p className="text-muted-foreground mb-md">
 Upload images to your locations to see them in gallery view
 </p>
 {locationsWithoutImages.length > 0 && (
 <p className="text-sm text-muted-foreground">
 {locationsWithoutImages.length} location{locationsWithoutImages.length > 1 ? "s" : ""} without images
 </p>
 )}
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Gallery Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {locationsWithImages.map((location) => {
 const TypeIcon = getTypeIcon(location.type || "other");
 
 return (
 <Card
 key={location.id}
 className={`overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
 selectedLocations.has(location.id) ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onView(location)}
 >
 {/* Image Gallery */}
 <div className="relative h-container-xs bg-muted">
 {location.images && location.images[0] && (
 <Image src={location.images[0]} alt={location.name} width={48} height={48} className="w-full h-full object-cover" />
 )}
 
 {/* Selection Checkbox */}
 <div className="absolute top-sm left-sm">
 <Checkbox
 checked={selectedLocations.has(location.id)}
 onChange={() => onSelectLocation(location.id)}
 onClick={(e: React.MouseEvent) => e.stopPropagation()}
 className="bg-white/90"
 />
 </div>

 {/* Image Count Badge */}
 {location.images && location.images.length > 1 && (
 <div className="absolute bottom-sm right-sm">
 <Badge variant="secondary" className="bg-black/50 text-white">
 +{location.images.length - 1} photos
 </Badge>
 </div>
 )}

 {/* Featured Badge */}
 {location.is_featured && (
 <div className="absolute top-sm right-sm">
 <Badge variant="warning">Featured</Badge>
 </div>
 )}
 </div>

 {/* Content */}
 <div className="p-md space-y-sm">
 {/* Title and Type */}
 <div>
 <h3 className="font-semibold text-lg line-clamp-xs">{location.name}</h3>
 <div className="flex items-center gap-xs mt-xs">
 <TypeIcon className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="text-sm text-muted-foreground">{location.type || "other"}</span>
 <Badge 
 variant={getAvailabilityBadgeVariant(location.availability_status || "available")}
 className="ml-auto"
 >
 {location.availability_status || "available"}
 </Badge>
 </div>
 </div>

 {/* Address */}
 {(location.address || location.city) && (
 <div className="flex items-start gap-xs text-sm text-muted-foreground">
 <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
 <span className="line-clamp-xs">
 {[location.address, location.city, location.state, location.country]
 .filter(Boolean)
 .join(", ")}
 </span>
 </div>
 )}

 {/* Details Grid */}
 <div className="grid grid-cols-2 gap-sm text-sm">
 {location.capacity && (
 <div className="flex items-center gap-xs">
 <Users className="h-3 w-3 text-muted-foreground" />
 <span>{location.capacity} capacity</span>
 </div>
 )}
 {location.size && (
 <div>
 {location.size.toLocaleString()} sq ft
 </div>
 )}
 {location.rental_rate && (
 <div className="font-medium">
 {location.currency || "$"}{location.rental_rate.toLocaleString()}/day
 </div>
 )}
 {location.parking_available && (
 <div className="text-muted-foreground">
 Parking available
 </div>
 )}
 </div>

 {/* Contact */}
 {location.contact_name && (
 <div className="flex items-center gap-md text-sm text-muted-foreground border-t pt-sm">
 <div className="flex items-center gap-xs">
 <Phone className="h-3 w-3" />
 <span className="truncate">{location.contact_name}</span>
 </div>
 {location.contact_email && (
 <div className="flex items-center gap-xs">
 <Mail className="h-3 w-3" />
 <span className="truncate">{location.contact_email}</span>
 </div>
 )}
 </div>
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
 onView(location);
 }}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(location);
 }}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(location);
 }}
 >
 <Trash2 className="h-icon-xs w-icon-xs text-destructive" />
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>

 {/* Locations without images */}
 {locationsWithoutImages.length > 0 && (
 <div className="space-y-sm">
 <h3 className="text-sm font-medium text-muted-foreground">
 Locations without images ({locationsWithoutImages.length})
 </h3>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm">
 {locationsWithoutImages.map((location) => {
 const TypeIcon = getTypeIcon(location.type || "other");
 
 return (
 <Card
 key={location.id}
 className={`p-sm cursor-pointer hover:shadow-md transition-shadow ${
 selectedLocations.has(location.id) ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onView(location)}
 >
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={selectedLocations.has(location.id)}
 onChange={() => onSelectLocation(location.id)}
 onClick={(e: React.MouseEvent) => e.stopPropagation()}
 />
 <TypeIcon className="h-icon-xs w-icon-xs text-muted-foreground" />
 <div className="flex-1 min-w-0">
 <p className="font-medium text-sm truncate">{location.name}</p>
 <p className="text-xs text-muted-foreground truncate">
 {location.city || location.address || "No address"}
 </p>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(location);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 )}
 </div>
 );
}
