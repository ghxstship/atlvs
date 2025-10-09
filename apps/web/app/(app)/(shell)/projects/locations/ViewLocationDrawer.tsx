"use client";

import Image from 'next/image';
import { Accessibility, Building, Calendar, Car, Clock, Coffee, DollarSign, Edit, Eye, FileText, Mail, MapPin, Monitor, Navigation, Phone, Share2, Tag, Train, Users, Wifi } from 'lucide-react';
import {
  AppDrawer,
  Badge,
  Button,
  Tabs,
  TabsContent
} from "@ghxstship/ui";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import type { Location } from "./LocationsClient";
import type { LucideIcon } from "lucide-react";

interface ViewLocationDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 location: Location;
 onEdit?: () => void;
 onNavigate?: () => void;
 getTypeIcon: (type: string) => LucideIcon;
 getAvailabilityBadgeVariant: (status: string) => any;
 getTypeBadgeVariant: (type: string) => any;
}

export default function ViewLocationDrawer({
 open,
 onOpenChange,
 location,
 onEdit,
 onNavigate,
 getTypeIcon,
 getAvailabilityBadgeVariant,
 getTypeBadgeVariant
}: ViewLocationDrawerProps) {
 const TypeIcon = getTypeIcon(location.type || "other");

 // Custom tabs for location details
 const tabs = [
 {
 id: "overview",
 label: "Overview",
 content: (
 <div className="space-y-md">
 {/* Location Images */}
 {location.images && location.images.length > 0 && (
 <div className="space-y-sm">
 <h4 className="font-semibold flex items-center gap-xs">
 <Eye className="h-icon-xs w-icon-xs" />
 Photos
 </h4>
 <div className="grid grid-cols-2 gap-sm">
 {location.images.slice(0, 4).map((image, index) => (
 <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
 <Image src={image} alt={`${location.name} - Photo ${index + 1}`} width={400} height={300} className="w-full h-full object-cover" />
 </div>
 ))}
 </div>
 {location.images.length > 4 && (
 <p className="text-sm text-muted-foreground">
 +{location.images.length - 4} more photos
 </p>
 )}
 </div>
 )}

 {/* Type and Availability */}
 <div className="grid grid-cols-2 gap-md">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <TypeIcon className="h-icon-xs w-icon-xs" />
 <span>Type</span>
 </div>
 <Badge variant={getTypeBadgeVariant(location.type || "other")}>
 {location.type || "other"}
 </Badge>
 </div>

 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Calendar className="h-icon-xs w-icon-xs" />
 <span>Availability</span>
 </div>
 <Badge variant={getAvailabilityBadgeVariant(location.availability_status || "available")}>
 {location.availability_status || "available"}
 </Badge>
 </div>
 </div>

 {/* Address */}
 {(location.address || location.city) && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <MapPin className="h-icon-xs w-icon-xs" />
 <span>Address</span>
 </div>
 <p className="font-medium">
 {[location.address, location.city, location.state, location.postal_code, location.country]
 .filter(Boolean)
 .join(", ")}
 </p>
 {(location.coordinates || location.address) && (
 <Button
 variant="secondary"
 size="sm"
 onClick={onNavigate}
 className="mt-xs"
 >
 <Navigation className="mr-2 h-icon-xs w-icon-xs" />
 Get Directions
 </Button>
 )}
 </div>
 )}

 {/* Capacity and Size */}
 <div className="grid grid-cols-2 gap-md">
 {location.capacity && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Users className="h-icon-xs w-icon-xs" />
 <span>Capacity</span>
 </div>
 <p className="font-medium">{location.capacity.toLocaleString()} people</p>
 </div>
 )}

 {location.size && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Building className="h-icon-xs w-icon-xs" />
 <span>Size</span>
 </div>
 <p className="font-medium">{location.size.toLocaleString()} sq ft</p>
 </div>
 )}
 </div>

 {/* Rental Rate */}
 {location.rental_rate && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <DollarSign className="h-icon-xs w-icon-xs" />
 <span>Rental Rate</span>
 </div>
 <p className="font-medium text-lg">
 {location.currency || "$"}{location.rental_rate.toLocaleString()} / day
 </p>
 </div>
 )}

 {/* Operating Hours */}
 {location.operating_hours && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Clock className="h-icon-xs w-icon-xs" />
 <span>Operating Hours</span>
 </div>
 <p className="font-medium">{location.operating_hours}</p>
 </div>
 )}

 {/* Project */}
 {location.project && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <FileText className="h-icon-xs w-icon-xs" />
 <span>Project</span>
 </div>
 <p className="font-medium">{location.project.name}</p>
 </div>
 )}

 {/* Notes */}
 {location.notes && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <FileText className="h-icon-xs w-icon-xs" />
 <span>Notes</span>
 </div>
 <p className="text-sm">{location.notes}</p>
 </div>
 )}

 {/* Tags */}
 {location.tags && location.tags.length > 0 && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Tag className="h-icon-xs w-icon-xs" />
 <span>Tags</span>
 </div>
 <div className="flex flex-wrap gap-xs">
 {location.tags.map((tag, index) => (
 <Badge key={index} variant="secondary">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Featured Badge */}
 {location.is_featured && (
 <Badge variant="warning" className="w-fit">
 ⭐ Featured Location
 </Badge>
 )}
 </div>
 )
 },
 {
 id: "amenities",
 label: "Amenities & Access",
 content: (
 <div className="space-y-md">
 {/* Amenities */}
 {location.amenities && location.amenities.length > 0 ? (
 <div className="space-y-sm">
 <h4 className="font-semibold flex items-center gap-xs">
 <Wifi className="h-icon-xs w-icon-xs" />
 Amenities
 </h4>
 <div className="grid grid-cols-2 gap-sm">
 {location.amenities.map((amenity, index) => (
 <div key={index} className="flex items-center gap-xs">
 <div className="w-2 h-2 rounded-full bg-primary" />
 <span className="text-sm">{amenity}</span>
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div className="text-center py-md text-muted-foreground">
 <Coffee className="mx-auto h-icon-lg w-icon-lg mb-sm opacity-50" />
 <p className="text-sm">No amenities listed</p>
 </div>
 )}

 {/* Accessibility Features */}
 {location.accessibility_features && location.accessibility_features.length > 0 && (
 <div className="space-y-sm">
 <h4 className="font-semibold flex items-center gap-xs">
 <Accessibility className="h-icon-xs w-icon-xs" />
 Accessibility Features
 </h4>
 <div className="grid grid-cols-1 gap-sm">
 {location.accessibility_features.map((feature, index) => (
 <div key={index} className="flex items-center gap-xs">
 <div className="w-2 h-2 rounded-full bg-success" />
 <span className="text-sm">{feature}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Parking */}
 <div className="space-y-sm">
 <h4 className="font-semibold flex items-center gap-xs">
 <Car className="h-icon-xs w-icon-xs" />
 Parking
 </h4>
 {location.parking_available ? (
 <div className="space-y-xs">
 <Badge variant="success">Parking Available</Badge>
 {location.parking_capacity && (
 <p className="text-sm">
 Capacity: {location.parking_capacity} vehicles
 </p>
 )}
 </div>
 ) : (
 <Badge variant="secondary">No Parking</Badge>
 )}
 </div>

 {/* Public Transport */}
 {location.public_transport && (
 <div className="space-y-sm">
 <h4 className="font-semibold flex items-center gap-xs">
 <Train className="h-icon-xs w-icon-xs" />
 Public Transport
 </h4>
 <p className="text-sm">{location.public_transport}</p>
 </div>
 )}
 </div>
 )
 },
 {
 id: "contact",
 label: "Contact",
 content: (
 <div className="space-y-md">
 {location.contact_name && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Users className="h-icon-xs w-icon-xs" />
 <span>Contact Person</span>
 </div>
 <p className="font-medium">{location.contact_name}</p>
 </div>
 )}

 {location.contact_phone && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Phone className="h-icon-xs w-icon-xs" />
 <span>Phone</span>
 </div>
 <a
 href={`tel:${location.contact_phone}`}
 className="font-medium text-primary hover:underline"
 >
 {location.contact_phone}
 </a>
 </div>
 )}

 {location.contact_email && (
 <div className="space-y-xs">
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <Mail className="h-icon-xs w-icon-xs" />
 <span>Email</span>
 </div>
 <a
 href={`mailto:${location.contact_email}`}
 className="font-medium text-primary hover:underline"
 >
 {location.contact_email}
 </a>
 </div>
 )}

 {(!location.contact_name && !location.contact_phone && !location.contact_email) && (
 <div className="text-center py-lg text-muted-foreground">
 <Phone className="mx-auto h-icon-lg w-icon-lg mb-sm opacity-50" />
 <p>No contact information available</p>
 </div>
 )}

 {/* Quick Actions */}
 <div className="space-y-sm pt-md border-t">
 <h4 className="font-semibold">Quick Actions</h4>
 <div className="space-y-sm">
 {location.contact_phone && (
 <Button
 variant="secondary"
 className="w-full justify-start"
 onClick={() => window.open(`tel:${location.contact_phone}`, "_blank")}
 >
 <Phone className="mr-2 h-icon-xs w-icon-xs" />
 Call {location.contact_name || "Contact"}
 </Button>
 )}
 {location.contact_email && (
 <Button
 variant="secondary"
 className="w-full justify-start"
 onClick={() => window.open(`mailto:${location.contact_email}`, "_blank")}
 >
 <Mail className="mr-2 h-icon-xs w-icon-xs" />
 Email {location.contact_name || "Contact"}
 </Button>
 )}
 {(location.coordinates || location.address) && (
 <Button
 variant="secondary"
 className="w-full justify-start"
 onClick={onNavigate}
 >
 <Navigation className="mr-2 h-icon-xs w-icon-xs" />
 Get Directions
 </Button>
 )}
 </div>
 </div>
 </div>
 )
 },
 {
 id: "floorplans",
 label: "Floor Plans",
 content: (
 <div className="space-y-md">
 {location.floor_plans && location.floor_plans.length > 0 ? (
 <div className="space-y-sm">
 <h4 className="font-semibold">Available Floor Plans</h4>
 <div className="grid grid-cols-1 gap-sm">
 {location.floor_plans.map((plan, index) => (
 <div key={index} className="border rounded-lg overflow-hidden">
 <Image src={plan} alt={`Floor plan ${index + 1}`} width={400} height={300} className="w-full" />
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div className="text-center py-lg text-muted-foreground">
 <FileText className="mx-auto h-icon-lg w-icon-lg mb-sm opacity-50" />
 <p>No floor plans available</p>
 </div>
 )}
 </div>
 )
 },
 ];

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title={location.name}
 tabs={tabs}
 headerActions={
 <div className="flex items-center gap-xs">
 {onNavigate && (
 <Button
 variant="secondary"
 size="sm"
 onClick={onNavigate}
 title="Navigate"
 >
 <Navigation className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 <Button
 variant="secondary"
 size="sm"
 onClick={async () => {
 const text = `${location.name}\n${location.address || ""}, ${location.city || ""}, ${location.state || ""}`;
 await navigator.clipboard.writeText(text);
 }}
 title="Share"
 >
 <Share2 className="h-icon-xs w-icon-xs" />
 </Button>
 {onEdit && (
 <Button
 variant="secondary"
 size="sm"
 onClick={onEdit}
 title="Edit"
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 </div>
 }
 />
 );
}
