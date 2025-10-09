'use client';

import { MoreHorizontal, Edit, Eye, MapPin, Users, Square, Building, Calendar, Clock } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@ghxstship/ui";

import type { ProgrammingSpace } from '../types';

interface ProgrammingSpacesTimelineViewProps {
 spaces: ProgrammingSpace[];
 loading: boolean;
 onEdit: (space: ProgrammingSpace) => void;
 onView: (space: ProgrammingSpace) => void;
}

const STATUS_BADGE_CONFIG = {
 available: { label: 'Available', variant: 'success' as const },
 occupied: { label: 'Occupied', variant: 'destructive' as const },
 reserved: { label: 'Reserved', variant: 'warning' as const },
 maintenance: { label: 'Maintenance', variant: 'secondary' as const },
 cleaning: { label: 'Cleaning', variant: 'info' as const },
 setup: { label: 'Setup', variant: 'warning' as const },
 breakdown: { label: 'Breakdown', variant: 'warning' as const },
 out_of_service: { label: 'Out of Service', variant: 'destructive' as const }
};

const ACCESS_LEVEL_BADGE_CONFIG = {
 public: { label: 'Public', variant: 'success' as const },
 restricted: { label: 'Restricted', variant: 'warning' as const },
 staff_only: { label: 'Staff Only', variant: 'secondary' as const },
 talent_only: { label: 'Talent Only', variant: 'info' as const },
 vip: { label: 'VIP', variant: 'destructive' as const },
 crew_only: { label: 'Crew Only', variant: 'default' as const },
 private: { label: 'Private', variant: 'destructive' as const }
};

const SPACE_KIND_CONFIG = {
 room: { label: 'Room', icon: '🏠' },
 green_room: { label: 'Green Room', icon: '🌿' },
 dressing_room: { label: 'Dressing Room', icon: '👗' },
 meeting_room: { label: 'Meeting Room', icon: '🤝' },
 classroom: { label: 'Classroom', icon: '🎓' },
 studio: { label: 'Studio', icon: '🎬' },
 rehearsal_room: { label: 'Rehearsal Room', icon: '🎭' },
 storage: { label: 'Storage', icon: '📦' },
 office: { label: 'Office', icon: '💼' },
 lounge: { label: 'Lounge', icon: '🛋️' },
 kitchen: { label: 'Kitchen', icon: '🍳' },
 bathroom: { label: 'Bathroom', icon: '🚿' },
 corridor: { label: 'Corridor', icon: '🚪' },
 lobby: { label: 'Lobby', icon: '🏛️' },
 stage: { label: 'Stage', icon: '🎪' },
 backstage: { label: 'Backstage', icon: '🎭' },
 loading_dock: { label: 'Loading Dock', icon: '🚛' },
 parking: { label: 'Parking', icon: '🅿️' },
 outdoor: { label: 'Outdoor', icon: '🌳' },
 other: { label: 'Other', icon: '📍' }
};

interface GroupedSpaces {
 [key: string]: ProgrammingSpace[];
}

export default function ProgrammingSpacesTimelineView({
 spaces,
 loading,
 onEdit,
 onView
}: ProgrammingSpacesTimelineViewProps) {
 // Group spaces by building and floor
 const groupedSpaces: GroupedSpaces = spaces.reduce((groups, space) => {
 let key: string;
 
 if (space.building) {
 if (space.floor) {
 key = `${space.building} - Floor ${space.floor}`;
 } else {
 key = space.building;
 }
 } else if (space.floor) {
 key = `Floor ${space.floor}`;
 } else {
 key = 'Unspecified Location';
 }
 
 if (!groups[key]) {
 groups[key] = [];
 }
 groups[key].push(space);
 return groups;
 }, {} as GroupedSpaces);

 // Sort groups by building and floor
 const sortedGroups = Object.entries(groupedSpaces).sort(([keyA], [keyB]) => {
 if (keyA === 'Unspecified Location') return 1;
 if (keyB === 'Unspecified Location') return -1;
 return keyA.localeCompare(keyB);
 });

 if (loading) {
 return (
 <div className="space-y-xl">
 {Array.from({ length: 3 }).map((_, index) => (
 <div key={index} className="space-y-md">
 <div className="h-icon-md bg-muted rounded w-1/3 animate-pulse"></div>
 <div className="space-y-sm">
 {Array.from({ length: 2 }).map((_, spaceIndex) => (
 <Card key={spaceIndex} className="animate-pulse">
 <CardHeader>
 <div className="h-icon-xs bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </CardHeader>
 <CardContent>
 <div className="h-3 bg-muted rounded"></div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 ))}
 </div>
 );
 }

 if (spaces.length === 0) {
 return (
 <Card className="p-xl">
 <div className="text-center">
 <Building className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold">No spaces found</h3>
 <p className="text-muted-foreground">
 No spaces match your current filters. Try adjusting your search criteria.
 </p>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-xl">
 {sortedGroups.map(([groupKey, groupSpaces]) => {
 return (
 <div key={groupKey} className="space-y-md">
 {/* Group Header */}
 <div className="flex items-center gap-md">
 <div className="flex-1">
 <h3 className="text-lg font-semibold flex items-center gap-xs">
 <Building className="h-icon-sm w-icon-sm" />
 {groupKey}
 </h3>
 <p className="text-sm text-muted-foreground mt-1">
 {groupSpaces.length} space{groupSpaces.length !== 1 ? 's' : ''} • 
 Total capacity: {groupSpaces.reduce((sum, space) => sum + (space.capacity || 0), 0)} people
 </p>
 </div>
 <Badge variant="outline">
 {groupSpaces.length} space{groupSpaces.length !== 1 ? 's' : ''}
 </Badge>
 </div>

 {/* Timeline Items */}
 <div className="relative">
 {/* Timeline Line */}
 <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

 <div className="space-y-lg">
 {groupSpaces
 .sort((a, b) => {
 // Sort by room number if available, then by name
 if (a.room_number && b.room_number) {
 return a.room_number.localeCompare(b.room_number);
 }
 return a.name.localeCompare(b.name);
 })
 .map((space, index) => {
 const kindConfig = SPACE_KIND_CONFIG[space.kind];
 const statusConfig = STATUS_BADGE_CONFIG[space.status];
 const accessConfig = ACCESS_LEVEL_BADGE_CONFIG[space.access_level];

 return (
 <div key={space.id} className="relative flex gap-md">
 {/* Timeline Dot */}
 <div className="relative z-10">
 <div className="flex h-icon-2xl w-icon-2xl items-center justify-center rounded-full border-2 border-background bg-card shadow">
 <span className="text-lg">{kindConfig.icon}</span>
 </div>
 </div>

 {/* Content */}
 <Card className="flex-1">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-xs mb-2">
 <Badge variant="outline" className="text-xs">
 {kindConfig.label}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 <Badge variant={accessConfig.variant} className="text-xs">
 {accessConfig.label}
 </Badge>
 </div>
 <h4 className="font-semibold">{space.name}</h4>
 {space.description && (
 <p className="text-sm text-muted-foreground mt-1">
 {space.description}
 </p>
 )}
 </div>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="sm" className="h-icon-lg w-icon-lg p-0">
 <MoreHorizontal className="h-icon-xs w-icon-xs" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onView(space)}>
 <Eye className="mr-2 h-icon-xs w-icon-xs" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(space)}>
 <Edit className="mr-2 h-icon-xs w-icon-xs" />
 Edit
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </CardHeader>

 <CardContent>
 <div className="space-y-sm">
 {/* Room Details */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md text-sm">
 {/* Location Details */}
 <div className="space-y-xs">
 {space.room_number && (
 <div className="flex items-center gap-xs">
 <span className="font-medium">Room:</span>
 <span>{space.room_number}</span>
 </div>
 )}
 {space.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span>{space.location}</span>
 </div>
 )}
 </div>

 {/* Capacity and Size */}
 <div className="space-y-xs">
 {space.capacity && (
 <div className="flex items-center gap-xs">
 <Users className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span>{space.capacity}</span>
 {space.max_capacity && space.max_capacity !== space.capacity && (
 <span className="text-muted-foreground">/ {space.max_capacity}</span>
 )}
 <span className="text-muted-foreground">people</span>
 </div>
 )}
 {space.area_sqft && (
 <div className="flex items-center gap-xs">
 <Square className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span>{space.area_sqft} sq ft</span>
 </div>
 )}
 </div>

 {/* Project and Booking */}
 <div className="space-y-xs">
 {space.project && (
 <div>
 <span className="text-muted-foreground">Project: </span>
 <Badge variant="outline" className="text-xs">
 {space.project.name}
 </Badge>
 </div>
 )}
 {space.is_bookable && (
 <div className="flex items-center gap-xs text-green-600">
 <Calendar className="h-icon-xs w-icon-xs" />
 <span>Bookable</span>
 {(space.hourly_rate || space.daily_rate) && (
 <span className="text-muted-foreground">
 • ${space.hourly_rate ? `${space.hourly_rate}/hr` : `${space.daily_rate}/day`}
 </span>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Amenities */}
 {space.amenities && Object.values(space.amenities).some(Boolean) && (
 <div>
 <h5 className="text-sm font-medium mb-1">Amenities</h5>
 <div className="flex flex-wrap gap-xs">
 {space.amenities.wifi && (
 <Badge variant="outline" className="text-xs">📶 WiFi</Badge>
 )}
 {space.amenities.air_conditioning && (
 <Badge variant="outline" className="text-xs">❄️ AC</Badge>
 )}
 {space.amenities.heating && (
 <Badge variant="outline" className="text-xs">🔥 Heating</Badge>
 )}
 {space.amenities.sound_system && (
 <Badge variant="outline" className="text-xs">🔊 Sound</Badge>
 )}
 {space.amenities.projection && (
 <Badge variant="outline" className="text-xs">📽️ Projection</Badge>
 )}
 {space.amenities.security_camera && (
 <Badge variant="outline" className="text-xs">📹 Security</Badge>
 )}
 {Object.values(space.amenities).filter(Boolean).length > 6 && (
 <Badge variant="outline" className="text-xs">
 +{Object.values(space.amenities).filter(Boolean).length - 6} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Contact Information */}
 {(space.contact_person || space.contact_phone || space.contact_email) && (
 <div>
 <h5 className="text-sm font-medium mb-1">Contact</h5>
 <div className="text-sm text-muted-foreground space-y-xs">
 {space.contact_person && (
 <div>Person: {space.contact_person}</div>
 )}
 {space.contact_phone && (
 <div>Phone: {space.contact_phone}</div>
 )}
 {space.contact_email && (
 <div>Email: {space.contact_email}</div>
 )}
 </div>
 </div>
 )}

 {/* Maintenance */}
 {(space.last_maintenance || space.next_maintenance) && (
 <div>
 <h5 className="text-sm font-medium mb-1">Maintenance</h5>
 <div className="text-sm text-muted-foreground space-y-xs">
 {space.last_maintenance && (
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 Last: {new Date(space.last_maintenance).toLocaleDateString()}
 </div>
 )}
 {space.next_maintenance && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 Next: {new Date(space.next_maintenance).toLocaleDateString()}
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 );
}
