'use client';

import { MoreHorizontal, Edit, Eye, Trash2, ChevronDown, ChevronRight, MapPin, Users, Square, Wifi, Car, Shield } from "lucide-react";
import { useState } from 'react';
import {
 Badge,
 Button,
 Card,
 Checkbox,
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
 Collapsible,
 CollapsibleContent,
 CollapsibleTrigger,
} from '@ghxstship/ui';

import type { ProgrammingSpace, SpaceSort } from '../types';

interface ProgrammingSpacesListViewProps {
 spaces: ProgrammingSpace[];
 loading: boolean;
 selectedSpaces: string[];
 onSelectionChange: (selected: string[]) => void;
 onEdit: (space: ProgrammingSpace) => void;
 onView: (space: ProgrammingSpace) => void;
 onDelete: (spaceId: string) => void;
 sort: SpaceSort;
 onSortChange: (sort: SpaceSort) => void;
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

export default function ProgrammingSpacesListView({
 spaces,
 loading,
 selectedSpaces,
 onSelectionChange,
 onEdit,
 onView,
 onDelete,
 sort,
 onSortChange,
}: ProgrammingSpacesListViewProps) {
 const [expandedRows, setExpandedRows] = useState<string[]>([]);

 const handleSelectAll = (checked: boolean) => {
 if (checked) {
 onSelectionChange(spaces.map((space) => space.id));
 } else {
 onSelectionChange([]);
 }
 };

 const handleSelectSpace = (spaceId: string, checked: boolean) => {
 if (checked) {
 onSelectionChange([...selectedSpaces, spaceId]);
 } else {
 onSelectionChange(selectedSpaces.filter((id) => id !== spaceId));
 }
 };

 const toggleRowExpansion = (spaceId: string) => {
 setExpandedRows((prev: unknown) =>
 prev.includes(spaceId)
 ? prev.filter((id) => id !== spaceId)
 : [...prev, spaceId]
 );
 };

 const handleSort = (field: keyof ProgrammingSpace) => {
 const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
 onSortChange({ field, direction });
 };

 const getSortIcon = (field: keyof ProgrammingSpace) => {
 if (sort.field !== field) return null;
 return sort.direction === 'asc' ? '↑' : '↓';
 };

 if (loading) {
 return (
 <Card className="p-8">
 <div className="flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
 <span className="ml-2">Loading spaces...</span>
 </div>
 </Card>
 );
 }

 if (spaces.length === 0) {
 return (
 <Card className="p-8">
 <div className="text-center">
 <h3 className="text-lg font-semibold">No spaces found</h3>
 <p className="text-muted-foreground">
 No spaces match your current filters. Try adjusting your search criteria.
 </p>
 </div>
 </Card>
 );
 }

 return (
 <Card>
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-12">
 <Checkbox
 checked={selectedSpaces.length === spaces.length}
 onCheckedChange={handleSelectAll}
 aria-
 />
 </TableHead>
 <TableHead className="w-12"></TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted/50"
 onClick={() => handleSort('name')}
 >
 Name {getSortIcon('name')}
 </TableHead>
 <TableHead>Kind</TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted/50"
 onClick={() => handleSort('status')}
 >
 Status {getSortIcon('status')}
 </TableHead>
 <TableHead>Access Level</TableHead>
 <TableHead 
 className="cursor-pointer hover:bg-muted/50"
 onClick={() => handleSort('capacity')}
 >
 Capacity {getSortIcon('capacity')}
 </TableHead>
 <TableHead>Location</TableHead>
 <TableHead className="w-12"></TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {spaces.map((space) => {
 const isExpanded = expandedRows.includes(space.id);
 const isSelected = selectedSpaces.includes(space.id);

 return (
 <>
 <TableRow key={space.id} className={isSelected ? 'bg-muted/50' : ''}>
 <TableCell>
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => handleSelectSpace(space.id, checked as boolean)}
 aria-label={`Select space ${space.name}`}
 />
 </TableCell>
 <TableCell>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => toggleRowExpansion(space.id)}
 className="h-6 w-6 p-0"
 >
 {isExpanded ? (
 <ChevronDown className="h-4 w-4" />
 ) : (
 <ChevronRight className="h-4 w-4" />
 )}
 </Button>
 </TableCell>
 <TableCell>
 <div className="font-medium">{space.name}</div>
 {space.description && (
 <div className="text-sm text-muted-foreground line-clamp-1">
 {space.description}
 </div>
 )}
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 <span className="text-lg">{SPACE_KIND_CONFIG[space.kind]?.icon}</span>
 <span className="text-sm">{SPACE_KIND_CONFIG[space.kind]?.label}</span>
 </div>
 </TableCell>
 <TableCell>
 <Badge variant={STATUS_BADGE_CONFIG[space.status]?.variant}>
 {STATUS_BADGE_CONFIG[space.status]?.label}
 </Badge>
 </TableCell>
 <TableCell>
 <Badge variant={ACCESS_LEVEL_BADGE_CONFIG[space.access_level]?.variant}>
 {ACCESS_LEVEL_BADGE_CONFIG[space.access_level]?.label}
 </Badge>
 </TableCell>
 <TableCell>
 {space.capacity ? (
 <div className="flex items-center gap-1">
 <Users className="h-4 w-4 text-muted-foreground" />
 <span>{space.capacity}</span>
 {space.max_capacity && space.max_capacity !== space.capacity && (
 <span className="text-muted-foreground">/ {space.max_capacity}</span>
 )}
 </div>
 ) : (
 <span className="text-muted-foreground">—</span>
 )}
 </TableCell>
 <TableCell>
 <div className="space-y-1">
 {space.building && (
 <div className="text-sm font-medium">{space.building}</div>
 )}
 {space.floor && (
 <div className="text-xs text-muted-foreground">Floor {space.floor}</div>
 )}
 {space.room_number && (
 <div className="text-xs text-muted-foreground">Room {space.room_number}</div>
 )}
 {space.location && (
 <div className="text-xs text-muted-foreground flex items-center gap-1">
 <MapPin className="h-3 w-3" />
 {space.location}
 </div>
 )}
 </div>
 </TableCell>
 <TableCell>
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
 </TableCell>
 </TableRow>

 {/* Expanded Row Content */}
 {isExpanded && (
 <TableRow>
 <TableCell colSpan={9} className="bg-muted/25">
 <div className="p-4 space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {/* Dimensions */}
 {(space.area_sqft || space.length || space.width || space.height) && (
 <div>
 <h4 className="font-semibold mb-2">Dimensions</h4>
 <div className="space-y-1 text-sm">
 {space.area_sqft && (
 <div>Area: {space.area_sqft} sq ft</div>
 )}
 {space.length && space.width && (
 <div>Size: {space.length}' × {space.width}'</div>
 )}
 {space.height && (
 <div>Height: {space.height}'</div>
 )}
 </div>
 </div>
 )}

 {/* Project */}
 {space.project && (
 <div>
 <h4 className="font-semibold mb-2">Project</h4>
 <div className="flex items-center gap-2">
 <Badge variant="outline">{space.project.name}</Badge>
 <Badge variant="secondary">{space.project.status}</Badge>
 </div>
 </div>
 )}

 {/* Booking Info */}
 {space.is_bookable && (
 <div>
 <h4 className="font-semibold mb-2">Booking</h4>
 <div className="space-y-1 text-sm">
 <div>Bookable: Yes</div>
 {space.hourly_rate && (
 <div>Hourly: ${space.hourly_rate}</div>
 )}
 {space.daily_rate && (
 <div>Daily: ${space.daily_rate}</div>
 )}
 </div>
 </div>
 )}

 {/* Contact */}
 {(space.contact_person || space.contact_phone || space.contact_email) && (
 <div>
 <h4 className="font-semibold mb-2">Contact</h4>
 <div className="space-y-1 text-sm">
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
 </div>

 {/* Amenities */}
 {space.amenities && Object.values(space.amenities).some(Boolean) && (
 <div>
 <h4 className="font-semibold mb-2">Amenities</h4>
 <div className="flex flex-wrap gap-2">
 {space.amenities.wifi && (
 <Badge variant="outline" className="text-xs">
 <Wifi className="mr-1 h-3 w-3" />
 WiFi
 </Badge>
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
 <Badge variant="outline" className="text-xs">
 <Shield className="mr-1 h-3 w-3" />
 Security
 </Badge>
 )}
 {space.amenities.access_control && (
 <Badge variant="outline" className="text-xs">🔐 Access Control</Badge>
 )}
 </div>
 </div>
 )}

 {/* Technical Specs */}
 {space.technical_specs && Object.values(space.technical_specs).some(Boolean) && (
 <div>
 <h4 className="font-semibold mb-2">Technical Specifications</h4>
 <div className="grid grid-cols-2 gap-2 text-sm">
 {space.technical_specs.audio_inputs && (
 <div>Audio Inputs: {space.technical_specs.audio_inputs}</div>
 )}
 {space.technical_specs.video_inputs && (
 <div>Video Inputs: {space.technical_specs.video_inputs}</div>
 )}
 {space.technical_specs.power_capacity && (
 <div>Power: {space.technical_specs.power_capacity}</div>
 )}
 {space.technical_specs.internet_speed && (
 <div>Internet: {space.technical_specs.internet_speed}</div>
 )}
 </div>
 </div>
 )}

 {/* Tags */}
 {space.tags && space.tags.length > 0 && (
 <div>
 <h4 className="font-semibold mb-2">Tags</h4>
 <div className="flex flex-wrap gap-1">
 {space.tags.map((tag, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}
 </div>
 </TableCell>
 </TableRow>
 )}
 </>
 );
 })}
 </TableBody>
 </Table>
 </Card>
 );
}
