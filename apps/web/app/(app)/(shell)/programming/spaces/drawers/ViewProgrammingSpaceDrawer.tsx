'use client';

import { Edit, Trash2, MapPin, Users, Square, Calendar, Clock, Shield } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from '@ghxstship/ui';
import AppDrawer, { type DrawerAction } from '@ghxstship/ui';

import type { ProgrammingSpace } from '../types';

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

interface ViewProgrammingSpaceDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 space: ProgrammingSpace;
 users: User[];
 onEdit: () => void;
 onDelete: () => void;
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
 other: { label: 'Other', icon: '📍' },
};

export default function ViewProgrammingSpaceDrawer({
 open,
 onOpenChange,
 space,
 users,
 onEdit,
 onDelete,
}: ViewProgrammingSpaceDrawerProps) {
 const getUserName = (userId: string | undefined | null) => {
 if (!userId) return 'Unknown';
 const user = users.find((u) => u.id === userId);
 return user?.full_name || user?.email || 'Unknown';
 };

 const kindConfig = SPACE_KIND_CONFIG[space.kind];
 const statusConfig = STATUS_BADGE_CONFIG[space.status];
 const accessConfig = ACCESS_LEVEL_BADGE_CONFIG[space.access_level];

 const actions: DrawerAction[] = [
 {
 key: 'edit',
 label: 'Edit',
 icon: <Edit className="h-4 w-4" />,
 variant: 'outline',
 onClick: () => onEdit(),
 },
 {
 key: 'delete',
 label: 'Delete',
 icon: <Trash2 className="h-4 w-4" />,
 variant: 'destructive',
 onClick: () => onDelete(),
 },
 ];

 const content = (
 <div className="space-y-6">
 {/* Basic Information */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <span className="text-2xl">{kindConfig.icon}</span>
 {space.name}
 </CardTitle>
 <div className="flex flex-wrap gap-2 mt-2">
 <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
 <Badge variant={accessConfig.variant}>{accessConfig.label}</Badge>
 <Badge variant="outline">{kindConfig.label}</Badge>
 </div>
 </CardHeader>
 <CardContent className="space-y-3 text-sm text-muted-foreground">
 {space.description && <p>{space.description}</p>}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div className="space-y-1">
 {space.location && (
 <div className="flex items-center gap-2">
 <MapPin className="h-4 w-4" />
 <span>{space.location}</span>
 </div>
 )}
 {space.building && (
 <div>
 <span className="font-medium">Building:</span> {space.building}
 </div>
 )}
 {space.floor && (
 <div>
 <span className="font-medium">Floor:</span> {space.floor}
 </div>
 )}
 {space.room_number && (
 <div>
 <span className="font-medium">Room:</span> {space.room_number}
 </div>
 )}
 </div>
 <div className="space-y-1">
 {space.capacity && (
 <div className="flex items-center gap-2">
 <Users className="h-4 w-4" />
 <span>
 {space.capacity}
 {space.max_capacity && space.max_capacity !== space.capacity
 ? ` / ${space.max_capacity}`
 : ''}
 {' '}people
 </span>
 </div>
 )}
 {space.area_sqft && (
 <div className="flex items-center gap-2">
 <Square className="h-4 w-4" />
 <span>{space.area_sqft} sq ft</span>
 </div>
 )}
 {space.length && space.width && (
 <div>
 <span className="font-medium">Dimensions:</span> {space.length}' × {space.width}'
 </div>
 )}
 {space.height && (
 <div>
 <span className="font-medium">Height:</span> {space.height}'
 </div>
 )}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Booking & Pricing */}
 <Card>
 <CardHeader>
 <CardTitle>Booking & Operations</CardTitle>
 </CardHeader>
 <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
 <div className="space-y-2">
 <div>
 <span className="font-medium">Bookable:</span> {space.is_bookable ? 'Yes' : 'No'}
 </div>
 {space.hourly_rate && (
 <div>
 <span className="font-medium">Hourly Rate:</span> ${space.hourly_rate}/hr
 </div>
 )}
 {space.daily_rate && (
 <div>
 <span className="font-medium">Daily Rate:</span> ${space.daily_rate}/day
 </div>
 )}
 {space.booking_advance_days && (
 <div>
 <span className="font-medium">Advance Booking:</span> {space.booking_advance_days} days
 </div>
 )}
 </div>
 <div className="space-y-2">
 {space.setup_time && (
 <div>
 <span className="font-medium">Setup Time:</span> {space.setup_time} minutes
 </div>
 )}
 {space.breakdown_time && (
 <div>
 <span className="font-medium">Breakdown Time:</span> {space.breakdown_time} minutes
 </div>
 )}
 {space.cleaning_time && (
 <div>
 <span className="font-medium">Cleaning Time:</span> {space.cleaning_time} minutes
 </div>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Amenities */}
 {space.amenities && Object.values(space.amenities).some(Boolean) && (
 <Card>
 <CardHeader>
 <CardTitle>Amenities</CardTitle>
 </CardHeader>
 <CardContent className="flex flex-wrap gap-2">
 {Object.entries(space.amenities)
 .filter(([_, value]) => Boolean(value))
 .map(([key]) => (
 <Badge key={key} variant="outline" className="text-xs">
 {key.replace(/_/g, ' ')}
 </Badge>
 ))}
 </CardContent>
 </Card>
 )}

 {/* Contact Information */}
 {(space.contact_person || space.contact_phone || space.contact_email) && (
 <Card>
 <CardHeader>
 <CardTitle>Contact Information</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-sm text-muted-foreground">
 {space.contact_person && (
 <div>
 <span className="font-medium">Person:</span> {space.contact_person}
 </div>
 )}
 {space.contact_phone && (
 <div>
 <span className="font-medium">Phone:</span> {space.contact_phone}
 </div>
 )}
 {space.contact_email && (
 <div>
 <span className="font-medium">Email:</span> {space.contact_email}
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Maintenance */}
 {(space.last_maintenance || space.next_maintenance || space.maintenance_notes) && (
 <Card>
 <CardHeader>
 <CardTitle>Maintenance</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-sm text-muted-foreground">
 {space.last_maintenance && (
 <div className="flex items-center gap-2">
 <Clock className="h-4 w-4" />
 <span>Last maintenance: {new Date(space.last_maintenance).toLocaleDateString()}</span>
 </div>
 )}
 {space.next_maintenance && (
 <div className="flex items-center gap-2">
 <Calendar className="h-4 w-4" />
 <span>Next maintenance: {new Date(space.next_maintenance).toLocaleDateString()}</span>
 </div>
 )}
 {space.maintenance_notes && <p>{space.maintenance_notes}</p>}
 </CardContent>
 </Card>
 )}

 {space.tags && space.tags.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle>Tags</CardTitle>
 </CardHeader>
 <CardContent className="flex flex-wrap gap-2">
 {space.tags.map((tag) => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </CardContent>
 </Card>
 )}

 <Card>
 <CardHeader>
 <CardTitle>Metadata</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-sm text-muted-foreground">
 <div className="flex justify-between">
 <span>Created</span>
 <span>{new Date(space.created_at).toLocaleString()}</span>
 </div>
 <div className="flex justify-between">
 <span>Updated</span>
 <span>{new Date(space.updated_at).toLocaleString()}</span>
 </div>
 <div className="flex justify-between">
 <span>Created by</span>
 <span>{getUserName(space.created_by)}</span>
 </div>
 <div className="flex justify-between">
 <span>Updated by</span>
 <span>{getUserName(space.updated_by)}</span>
 </div>
 </CardContent>
 </Card>
 </div>
 );

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title={space.name}
 mode="view"
 actions={actions}
 >
 {content}
 </AppDrawer>
 );
}
