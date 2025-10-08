'use client';

import { MoreHorizontal, Edit, Eye, Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
 Badge,
 Button,
 Card,
 CardContent,
 CardHeader,
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger
} from '@ghxstship/ui';

import type { ProgrammingRider } from '../types';

interface ProgrammingRidersTimelineViewProps {
 riders: ProgrammingRider[];
 loading: boolean;
 onEdit: (rider: ProgrammingRider) => void;
 onView: (rider: ProgrammingRider) => void;
}

const STATUS_BADGE_CONFIG = {
 draft: { label: 'Draft', variant: 'default' as const },
 pending_review: { label: 'Pending Review', variant: 'warning' as const },
 under_review: { label: 'Under Review', variant: 'info' as const },
 approved: { label: 'Approved', variant: 'success' as const },
 rejected: { label: 'Rejected', variant: 'destructive' as const },
 fulfilled: { label: 'Fulfilled', variant: 'success' as const },
 cancelled: { label: 'Cancelled', variant: 'secondary' as const }
};

const PRIORITY_BADGE_CONFIG = {
 low: { label: 'Low', variant: 'secondary' as const },
 medium: { label: 'Medium', variant: 'default' as const },
 high: { label: 'High', variant: 'warning' as const },
 critical: { label: 'Critical', variant: 'destructive' as const },
 urgent: { label: 'Urgent', variant: 'destructive' as const }
};

const RIDER_KIND_CONFIG = {
 technical: { label: 'Technical', icon: '🔧' },
 hospitality: { label: 'Hospitality', icon: '🍽️' },
 stage_plot: { label: 'Stage Plot', icon: '📋' },
 security: { label: 'Security', icon: '🛡️' },
 catering: { label: 'Catering', icon: '🍴' },
 transportation: { label: 'Transportation', icon: '🚐' },
 accommodation: { label: 'Accommodation', icon: '🏨' },
 production: { label: 'Production', icon: '🎬' },
 artist: { label: 'Artist', icon: '🎤' },
 crew: { label: 'Crew', icon: '👥' }
};

interface GroupedRiders {
 [key: string]: ProgrammingRider[];
}

export default function ProgrammingRidersTimelineView({
 riders,
 loading,
 onEdit,
 onView
}: ProgrammingRidersTimelineViewProps) {
 // Group riders by event and date
 const groupedRiders: GroupedRiders = riders.reduce((groups, rider) => {
 let key: string;
 
 if (rider.event) {
 const eventDate = new Date(rider.event.start_at).toLocaleDateString();
 key = `${rider.event.title} - ${eventDate}`;
 } else {
 key = 'No Event Assigned';
 }
 
 if (!groups[key]) {
 groups[key] = [];
 }
 groups[key].push(rider);
 return groups;
 }, {} as GroupedRiders);

 // Sort groups by date
 const sortedGroups = Object.entries(groupedRiders).sort(([keyA], [keyB]) => {
 if (keyA === 'No Event Assigned') return 1;
 if (keyB === 'No Event Assigned') return -1;
 
 const riderA = groupedRiders[keyA][0];
 const riderB = groupedRiders[keyB][0];
 
 if (!riderA.event) return 1;
 if (!riderB.event) return -1;
 
 return new Date(riderA.event.start_at).getTime() - new Date(riderB.event.start_at).getTime();
 });

 if (loading) {
 return (
 <div className="space-y-xl">
 {Array.from({ length: 3 }).map((_, index) => (
 <div key={index} className="space-y-md">
 <div className="h-icon-md bg-muted rounded w-1/3 animate-pulse"></div>
 <div className="space-y-sm">
 {Array.from({ length: 2 }).map((_, riderIndex) => (
 <Card key={riderIndex} className="animate-pulse">
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

 if (riders.length === 0) {
 return (
 <Card className="p-xl">
 <div className="text-center">
 <Calendar className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold">No riders found</h3>
 <p className="text-muted-foreground">
 No riders match your current filters. Try adjusting your search criteria.
 </p>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-xl">
 {sortedGroups.map(([groupKey, groupRiders]) => {
 const firstRider = groupRiders[0];
 const eventInfo = firstRider.event;

 return (
 <div key={groupKey} className="space-y-md">
 {/* Group Header */}
 <div className="flex items-center gap-md">
 <div className="flex-1">
 <h3 className="text-lg font-semibold">{groupKey}</h3>
 {eventInfo && (
 <div className="flex items-center gap-md text-sm text-muted-foreground mt-1">
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs" />
 {new Date(eventInfo.start_at).toLocaleDateString()} - {new Date(eventInfo.end_at || eventInfo.start_at).toLocaleDateString()}
 </div>
 {eventInfo.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 {eventInfo.location}
 </div>
 )}
 </div>
 )}
 </div>
 <Badge variant="outline">
 {groupRiders.length} rider{groupRiders.length !== 1 ? 's' : ''}
 </Badge>
 </div>

 {/* Timeline Items */}
 <div className="relative">
 {/* Timeline Line */}
 <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

 <div className="space-y-lg">
 {groupRiders
 .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
 .map((rider, index) => {
 const kindConfig = RIDER_KIND_CONFIG[rider.kind];
 const statusConfig = STATUS_BADGE_CONFIG[rider.status];
 const priorityConfig = PRIORITY_BADGE_CONFIG[rider.priority];

 return (
 <div key={rider.id} className="relative flex gap-md">
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
 <Badge variant={priorityConfig.variant} className="text-xs">
 {priorityConfig.label}
 </Badge>
 </div>
 <h4 className="font-semibold">{rider.title}</h4>
 {rider.description && (
 <p className="text-sm text-muted-foreground mt-1">
 {rider.description}
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
 <DropdownMenuItem onClick={() => onView(rider)}>
 <Eye className="mr-2 h-icon-xs w-icon-xs" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEdit(rider)}>
 <Edit className="mr-2 h-icon-xs w-icon-xs" />
 Edit
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </CardHeader>

 <CardContent>
 <div className="space-y-sm">
 {/* Requirements */}
 <div>
 <h5 className="text-sm font-medium mb-1">Requirements</h5>
 <p className="text-sm text-muted-foreground line-clamp-xs">
 {rider.requirements}
 </p>
 </div>

 {/* Additional Info */}
 <div className="flex items-center gap-md text-sm text-muted-foreground">
 {rider.project && (
 <div className="flex items-center gap-xs">
 <User className="h-icon-xs w-icon-xs" />
 <span>Project: {rider.project.name}</span>
 </div>
 )}
 
 <div className="flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 <span>Created {new Date(rider.created_at).toLocaleDateString()}</span>
 </div>

 {/* Fulfillment Status */}
 <div className="flex items-center gap-xs">
 {rider.fulfilled_at ? (
 <>
 <CheckCircle className="h-icon-xs w-icon-xs text-green-600" />
 <span className="text-green-600">Fulfilled</span>
 </>
 ) : rider.approved_at ? (
 <>
 <AlertCircle className="h-icon-xs w-icon-xs text-yellow-600" />
 <span className="text-yellow-600">Approved</span>
 </>
 ) : (
 <>
 <XCircle className="h-icon-xs w-icon-xs text-gray-400" />
 <span className="text-gray-400">Pending</span>
 </>
 )}
 </div>
 </div>

 {/* Tags */}
 {rider.tags && rider.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {rider.tags.slice(0, 5).map((tag, tagIndex) => (
 <Badge key={tagIndex} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 {rider.tags.length > 5 && (
 <Badge variant="outline" className="text-xs">
 +{rider.tags.length - 5} more
 </Badge>
 )}
 </div>
 )}

 {/* Notes */}
 {rider.notes && (
 <div>
 <h5 className="text-sm font-medium mb-1">Notes</h5>
 <p className="text-sm text-muted-foreground line-clamp-xs">
 {rider.notes}
 </p>
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
