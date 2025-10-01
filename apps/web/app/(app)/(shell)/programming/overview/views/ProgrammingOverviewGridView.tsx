'use client';

import { Calendar, Users, Building, Music, FileText, Clock, MapPin, DollarSign, TrendingUp, ArrowRight, MoreHorizontal } from "lucide-react";
import { Badge, Button, Card, Skeleton } from '@ghxstship/ui';
import Link from 'next/link';
import type { ProgrammingOverviewData } from '../types';

interface ProgrammingOverviewGridViewProps {
 data: ProgrammingOverviewData;
 loading: boolean;
}

export default function ProgrammingOverviewGridView({
 data,
 loading,
}: ProgrammingOverviewGridViewProps) {
 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
 {Array.from({ length: 9 }).map((_, i) => (
 <Card key={i} className="p-lg">
 <Skeleton className="h-icon-xs w-component-lg mb-4" />
 <Skeleton className="h-icon-md w-component-xl mb-2" />
 <Skeleton className="h-icon-xs w-full mb-2" />
 <Skeleton className="h-icon-xs w-3/4" />
 </Card>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Upcoming Events */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm" />
 Upcoming Events
 </h2>
 <Link href="/programming/events">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-icon-xs w-icon-xs" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {data.upcomingEvents.slice(0, 6).map((event) => (
 <Card key={event.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className="text-xs">
 {event.kind}
 </Badge>
 <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0">
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 </div>
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-xs">{event.title}</h3>
 
 <div className="space-y-xs text-xs text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 <span>{new Date(event.start_date).toLocaleDateString()}</span>
 </div>
 
 {event.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-3 w-3" />
 <span className="truncate">{event.location}</span>
 </div>
 )}
 
 {event.participants_count && (
 <div className="flex items-center gap-xs">
 <Users className="h-3 w-3" />
 <span>{event.participants_count} participants</span>
 </div>
 )}
 </div>
 
 {event.project && (
 <div className="mt-3 pt-3 border-t">
 <p className="text-xs text-muted-foreground">
 Project: <span className="font-medium">{event.project.name}</span>
 </p>
 </div>
 )}
 </Card>
 ))}
 </div>
 
 {data.upcomingEvents.length === 0 && (
 <Card className="p-xl text-center">
 <Calendar className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No upcoming events scheduled</p>
 </Card>
 )}
 </div>

 {/* Active Workshops */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-xs">
 <Users className="h-icon-sm w-icon-sm" />
 Active Workshops
 </h2>
 <Link href="/programming/workshops">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-icon-xs w-icon-xs" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {data.activeWorkshops.slice(0, 6).map((workshop) => (
 <Card key={workshop.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className="text-xs">
 {workshop.category}
 </Badge>
 <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0">
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 </div>
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-xs">{workshop.title}</h3>
 
 <div className="space-y-xs text-xs text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 <span>{new Date(workshop.start_date).toLocaleDateString()}</span>
 </div>
 
 {workshop.instructor && (
 <div className="flex items-center gap-xs">
 <Users className="h-3 w-3" />
 <span className="truncate">Instructor: {workshop.instructor}</span>
 </div>
 )}
 
 <div className="flex items-center justify-between">
 <span>{workshop.participants_count} enrolled</span>
 {workshop.max_participants && (
 <span>/ {workshop.max_participants} max</span>
 )}
 </div>
 
 {workshop.price && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-3 w-3" />
 <span>${workshop.price}</span>
 </div>
 )}
 </div>
 
 {workshop.max_participants && (
 <div className="mt-3">
 <div className="w-full bg-muted rounded-full h-1">
 <div
 className="bg-primary h-1 rounded-full transition-all"
 style={{
 width: `${Math.min(100, (workshop.participants_count / workshop.max_participants) * 100)}%`,
 }}
 />
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 {Math.round((workshop.participants_count / workshop.max_participants) * 100)}% full
 </p>
 </div>
 )}
 </Card>
 ))}
 </div>
 
 {data.activeWorkshops.length === 0 && (
 <Card className="p-xl text-center">
 <Users className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No active workshops</p>
 </Card>
 )}
 </div>

 {/* Available Spaces */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-xs">
 <Building className="h-icon-sm w-icon-sm" />
 Available Spaces
 </h2>
 <Link href="/programming/spaces">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-icon-xs w-icon-xs" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {data.availableSpaces.slice(0, 8).map((space) => (
 <Card key={space.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className="text-xs">
 {space.kind}
 </Badge>
 <div className={`w-2 h-2 rounded-full ${
 space.status === 'available' ? 'bg-green-500' : 'bg-red-500'
 }`} />
 </div>
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-xs">{space.name}</h3>
 
 <div className="space-y-xs text-xs text-muted-foreground">
 {space.building && (
 <div className="flex items-center gap-xs">
 <Building className="h-3 w-3" />
 <span className="truncate">{space.building}</span>
 {space.floor && <span>• Floor {space.floor}</span>}
 </div>
 )}
 
 {space.capacity && (
 <div className="flex items-center justify-between">
 <span>Capacity: {space.capacity}</span>
 {space.current_occupancy !== undefined && (
 <span>Used: {space.current_occupancy}</span>
 )}
 </div>
 )}
 </div>
 
 {space.capacity && space.current_occupancy !== undefined && (
 <div className="mt-3">
 <div className="w-full bg-muted rounded-full h-1">
 <div
 className="bg-blue-500 h-1 rounded-full transition-all"
 style={{
 width: `${Math.min(100, (space.current_occupancy / space.capacity) * 100)}%`,
 }}
 />
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 {Math.round((space.current_occupancy / space.capacity) * 100)}% occupied
 </p>
 </div>
 )}
 </Card>
 ))}
 </div>
 
 {data.availableSpaces.length === 0 && (
 <Card className="p-xl text-center">
 <Building className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No spaces available</p>
 </Card>
 )}
 </div>

 {/* Scheduled Performances */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-xs">
 <Music className="h-icon-sm w-icon-sm" />
 Scheduled Performances
 </h2>
 <Link href="/programming/performances">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-icon-xs w-icon-xs" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {data.scheduledPerformances.slice(0, 6).map((performance) => (
 <Card key={performance.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className="text-xs">
 {performance.type}
 </Badge>
 <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0">
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 </div>
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-xs">{performance.title}</h3>
 
 <div className="space-y-xs text-xs text-muted-foreground">
 {performance.scheduled_at && (
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 <span>{new Date(performance.scheduled_at).toLocaleString()}</span>
 </div>
 )}
 
 {performance.venue && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-3 w-3" />
 <span className="truncate">{performance.venue}</span>
 </div>
 )}
 
 {performance.duration_minutes && (
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 <span>{performance.duration_minutes} minutes</span>
 </div>
 )}
 
 {performance.audience_capacity && (
 <div className="flex items-center gap-xs">
 <Users className="h-3 w-3" />
 <span>Capacity: {performance.audience_capacity}</span>
 </div>
 )}
 </div>
 </Card>
 ))}
 </div>
 
 {data.scheduledPerformances.length === 0 && (
 <Card className="p-xl text-center">
 <Music className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No scheduled performances</p>
 </Card>
 )}
 </div>

 {/* Pending Riders */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-xs">
 <FileText className="h-icon-sm w-icon-sm" />
 Pending Riders
 </h2>
 <Link href="/programming/riders">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-icon-xs w-icon-xs" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {data.pendingRiders.slice(0, 8).map((rider) => (
 <Card key={rider.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className="text-xs">
 {rider.kind}
 </Badge>
 <Badge 
 variant={rider.priority === 'high' ? 'destructive' : rider.priority === 'medium' ? 'default' : 'secondary'}
 className="text-xs"
 >
 {rider.priority}
 </Badge>
 </div>
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-xs">{rider.title}</h3>
 
 <div className="space-y-xs text-xs text-muted-foreground">
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 <span>{new Date(rider.created_at).toLocaleDateString()}</span>
 </div>
 
 {rider.event && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 <span className="truncate">{rider.event.title}</span>
 </div>
 )}
 </div>
 </Card>
 ))}
 </div>
 
 {data.pendingRiders.length === 0 && (
 <Card className="p-xl text-center">
 <FileText className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No pending riders</p>
 </Card>
 )}
 </div>
 </div>
 );
}
