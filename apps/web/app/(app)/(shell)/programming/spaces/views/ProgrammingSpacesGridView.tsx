'use client';

import { MoreHorizontal, Edit, Eye, Trash2, MapPin, Users, Square, Wifi, Shield, DollarSign, Calendar } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 CardContent,
 CardFooter,
 CardHeader,
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from '@ghxstship/ui';

import type { ProgrammingSpace } from '../types';

interface ProgrammingSpacesGridViewProps {
 spaces: ProgrammingSpace[];
 loading: boolean;
 onEdit: (space: ProgrammingSpace) => void;
 onView: (space: ProgrammingSpace) => void;
 onDelete: (spaceId: string) => void;
}

const STATUS_BADGE_CONFIG = {
 available: { label: 'Available', variant: 'success' as const },
 occupied: { label: 'Occupied', variant: 'destructive' as const },
 reserved: { label: 'Reserved', variant: 'warning' as const },
 maintenance: { label: 'Maintenance', variant: 'secondary' as const },
 cleaning: { label: 'Cleaning', variant: 'info' as const },
 setup: { label: 'Setup', variant: 'warning' as const },
 breakdown: { label: 'Breakdown', variant: 'warning' as const },
 out_of_service: { label: 'Out of Service', variant: 'destructive' as const },
};

const ACCESS_LEVEL_BADGE_CONFIG = {
 public: { label: 'Public', variant: 'success' as const },
 restricted: { label: 'Restricted', variant: 'warning' as const },
 staff_only: { label: 'Staff Only', variant: 'secondary' as const },
 talent_only: { label: 'Talent Only', variant: 'info' as const },
 vip: { label: 'VIP', variant: 'destructive' as const },
 crew_only: { label: 'Crew Only', variant: 'default' as const },
 private: { label: 'Private', variant: 'destructive' as const },
};

const SPACE_KIND_CONFIG = {
 room: { label: 'Room', icon: '🏠', color: 'bg-blue-100 text-blue-800' },
 green_room: { label: 'Green Room', icon: '🌿', color: 'bg-green-100 text-green-800' },
 dressing_room: { label: 'Dressing Room', icon: '👗', color: 'bg-pink-100 text-pink-800' },
 meeting_room: { label: 'Meeting Room', icon: '🤝', color: 'bg-purple-100 text-purple-800' },
 classroom: { label: 'Classroom', icon: '🎓', color: 'bg-indigo-100 text-indigo-800' },
 studio: { label: 'Studio', icon: '🎬', color: 'bg-red-100 text-red-800' },
 rehearsal_room: { label: 'Rehearsal Room', icon: '🎭', color: 'bg-yellow-100 text-yellow-800' },
 storage: { label: 'Storage', icon: '📦', color: 'bg-gray-100 text-gray-800' },
 office: { label: 'Office', icon: '💼', color: 'bg-blue-100 text-blue-800' },
 lounge: { label: 'Lounge', icon: '🛋️', color: 'bg-orange-100 text-orange-800' },
 kitchen: { label: 'Kitchen', icon: '🍳', color: 'bg-red-100 text-red-800' },
 bathroom: { label: 'Bathroom', icon: '🚿', color: 'bg-cyan-100 text-cyan-800' },
 corridor: { label: 'Corridor', icon: '🚪', color: 'bg-gray-100 text-gray-800' },
 lobby: { label: 'Lobby', icon: '🏛️', color: 'bg-stone-100 text-stone-800' },
 stage: { label: 'Stage', icon: '🎪', color: 'bg-purple-100 text-purple-800' },
 backstage: { label: 'Backstage', icon: '🎭', color: 'bg-indigo-100 text-indigo-800' },
 loading_dock: { label: 'Loading Dock', icon: '🚛', color: 'bg-slate-100 text-slate-800' },
 parking: { label: 'Parking', icon: '🅿️', color: 'bg-blue-100 text-blue-800' },
 outdoor: { label: 'Outdoor', icon: '🌳', color: 'bg-green-100 text-green-800' },
 other: { label: 'Other', icon: '📍', color: 'bg-gray-100 text-gray-800' },
};

export default function ProgrammingSpacesGridView({
 spaces,
 loading,
 onEdit,
 onView,
 onDelete,
}: ProgrammingSpacesGridViewProps) {
 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {Array.from({ length: 8 }).map((_, index) => (
 <Card key={index} className="animate-pulse">
 <CardHeader>
 <div className="h-4 bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 <div className="h-3 bg-muted rounded"></div>
 <div className="h-3 bg-muted rounded w-2/3"></div>
 </div>
 </CardContent>
 <CardFooter>
 <div className="h-8 bg-muted rounded w-full"></div>
 </CardFooter>
 </Card>
 ))}
 </div>
 );
 }

 if (spaces.length === 0) {
 return (
 <Card className="p-8">
 <div className="text-center">
 <Square className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold">No spaces found</h3>
 <p className="text-muted-foreground">
 No spaces match your current filters. Try adjusting your search criteria.
 </p>
 </div>
 </Card>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {spaces.map((space) => {
 const kindConfig = SPACE_KIND_CONFIG[space.kind];
 const statusConfig = STATUS_BADGE_CONFIG[space.status];
 const accessConfig = ACCESS_LEVEL_BADGE_CONFIG[space.access_level];

 return (
 <Card key={space.id} className="hover:shadow-md transition-shadow">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <div className={`px-2 py-1 rounded-full text-xs font-medium ${kindConfig.color}`}>
 <span className="mr-1">{kindConfig.icon}</span>
 {kindConfig.label}
 </div>
 </div>
 <h3 className="font-semibold text-sm line-clamp-2">{space.name}</h3>
 {space.description && (
 <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
 {space.description}
 </p>
 )}
 </div>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onView(space)}>
 <Eye className="mr-2 h-4 w-4" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(space)}>
 <Edit className="mr-2 h-4 w-4" />
 Edit
 </DropdownMenuItem>
 <DropdownMenuItem
 onClick={() => onDelete(space.id)}
 className="text-destructive"
 >
 <Trash2 className="mr-2 h-4 w-4" />
 Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </CardHeader>

 <CardContent className="py-3">
 <div className="space-y-3">
 {/* Status and Access Level */}
 <div className="flex items-center gap-2">
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 <Badge variant={accessConfig.variant} className="text-xs">
 {accessConfig.label}
 </Badge>
 </div>

 {/* Capacity */}
 {space.capacity && (
 <div className="flex items-center gap-1 text-xs">
 <Users className="h-3 w-3 text-muted-foreground" />
 <span>{space.capacity}</span>
 {space.max_capacity && space.max_capacity !== space.capacity && (
 <span className="text-muted-foreground">/ {space.max_capacity}</span>
 )}
 <span className="text-muted-foreground">people</span>
 </div>
 )}

 {/* Dimensions */}
 {space.area_sqft && (
 <div className="flex items-center gap-1 text-xs">
 <Square className="h-3 w-3 text-muted-foreground" />
 <span>{space.area_sqft} sq ft</span>
 </div>
 )}

 {/* Location */}
 <div className="space-y-1">
 {space.building && (
 <div className="text-xs font-medium">{space.building}</div>
 )}
 {space.floor && (
 <div className="text-xs text-muted-foreground">Floor {space.floor}</div>
 )}
 {space.room_number && (
 <div className="text-xs text-muted-foreground">Room {space.room_number}</div>
 )}
 {space.location && (
 <div className="flex items-center gap-1 text-xs text-muted-foreground">
 <MapPin className="h-3 w-3" />
 {space.location}
 </div>
 )}
 </div>

 {/* Project */}
 {space.project && (
 <div className="flex items-center gap-1 text-xs">
 <span className="text-muted-foreground">Project:</span>
 <Badge variant="outline" className="text-xs">
 {space.project.name}
 </Badge>
 </div>
 )}

 {/* Pricing */}
 {(space.hourly_rate || space.daily_rate) && (
 <div className="flex items-center gap-1 text-xs">
 <DollarSign className="h-3 w-3 text-muted-foreground" />
 {space.hourly_rate && <span>${space.hourly_rate}/hr</span>}
 {space.hourly_rate && space.daily_rate && <span>•</span>}
 {space.daily_rate && <span>${space.daily_rate}/day</span>}
 </div>
 )}

 {/* Amenities */}
 {space.amenities && Object.values(space.amenities).some(Boolean) && (
 <div className="flex flex-wrap gap-1">
 {space.amenities.wifi && (
 <Badge variant="outline" className="text-xs px-1 py-0">
 <Wifi className="h-3 w-3" />
 </Badge>
 )}
 {space.amenities.air_conditioning && (
 <Badge variant="outline" className="text-xs px-1 py-0">❄️</Badge>
 )}
 {space.amenities.sound_system && (
 <Badge variant="outline" className="text-xs px-1 py-0">🔊</Badge>
 )}
 {space.amenities.projection && (
 <Badge variant="outline" className="text-xs px-1 py-0">📽️</Badge>
 )}
 {space.amenities.security_camera && (
 <Badge variant="outline" className="text-xs px-1 py-0">
 <Shield className="h-3 w-3" />
 </Badge>
 )}
 {Object.values(space.amenities).filter(Boolean).length > 5 && (
 <Badge variant="outline" className="text-xs px-1 py-0">
 +{Object.values(space.amenities).filter(Boolean).length - 5}
 </Badge>
 )}
 </div>
 )}

 {/* Booking Status */}
 {space.is_bookable && (
 <div className="flex items-center gap-1 text-xs text-green-600">
 <Calendar className="h-3 w-3" />
 <span>Bookable</span>
 </div>
 )}
 </div>
 </CardContent>

 <CardFooter className="pt-3">
 <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
 <span>Updated {new Date(space.updated_at).toLocaleDateString()}</span>
 <div className="flex gap-1">
 <Button
 variant="outline"
 size="sm"
 onClick={() => onView(space)}
 className="h-7 px-2 text-xs"
 >
 <Eye className="h-3 w-3 mr-1" />
 View
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onEdit(space)}
 className="h-7 px-2 text-xs"
 >
 <Edit className="h-3 w-3 mr-1" />
 Edit
 </Button>
 </div>
 </div>
 </CardFooter>
 </Card>
 );
 })}
 </div>
 );
}
