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
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {Array.from({ length: 9 }).map((_, i) => (
 <Card key={i} className="p-6">
 <Skeleton className="h-4 w-24 mb-4" />
 <Skeleton className="h-6 w-32 mb-2" />
 <Skeleton className="h-4 w-full mb-2" />
 <Skeleton className="h-4 w-3/4" />
 </Card>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Upcoming Events */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-2">
 <Calendar className="h-5 w-5" />
 Upcoming Events
 </h2>
 <Link href="/programming/events">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-4 w-4" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {data.upcomingEvents.slice(0, 6).map((event) => (
 <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className="text-xs">
 {event.kind}
 </Badge>
 <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 </div>
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-2">{event.title}</h3>
 
 <div className="space-y-2 text-xs text-muted-foreground">
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 <span>{new Date(event.start_date).toLocaleDateString()}</span>
 </div>
 
 {event.location && (
 <div className="flex items-center gap-1">
 <MapPin className="h-3 w-3" />
 <span className="truncate">{event.location}</span>
 </div>
 )}
 
 {event.participants_count && (
 <div className="flex items-center gap-1">
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
 <Card className="p-8 text-center">
 <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No upcoming events scheduled</p>
 </Card>
 )}
 </div>

 {/* Active Workshops */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-2">
 <Users className="h-5 w-5" />
 Active Workshops
 </h2>
 <Link href="/programming/workshops">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-4 w-4" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {data.activeWorkshops.slice(0, 6).map((workshop) => (
 <Card key={workshop.id} className="p-4 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className="text-xs">
 {workshop.category}
 </Badge>
 <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 </div>
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-2">{workshop.title}</h3>
 
 <div className="space-y-2 text-xs text-muted-foreground">
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 <span>{new Date(workshop.start_date).toLocaleDateString()}</span>
 </div>
 
 {workshop.instructor && (
 <div className="flex items-center gap-1">
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
 <div className="flex items-center gap-1">
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
 <Card className="p-8 text-center">
 <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No active workshops</p>
 </Card>
 )}
 </div>

 {/* Available Spaces */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-2">
 <Building className="h-5 w-5" />
 Available Spaces
 </h2>
 <Link href="/programming/spaces">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-4 w-4" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {data.availableSpaces.slice(0, 8).map((space) => (
 <Card key={space.id} className="p-4 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className="text-xs">
 {space.kind}
 </Badge>
 <div className={`w-2 h-2 rounded-full ${
 space.status === 'available' ? 'bg-green-500' : 'bg-red-500'
 }`} />
 </div>
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-1">{space.name}</h3>
 
 <div className="space-y-1 text-xs text-muted-foreground">
 {space.building && (
 <div className="flex items-center gap-1">
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
 <Card className="p-8 text-center">
 <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No spaces available</p>
 </Card>
 )}
 </div>

 {/* Scheduled Performances */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-2">
 <Music className="h-5 w-5" />
 Scheduled Performances
 </h2>
 <Link href="/programming/performances">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-4 w-4" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {data.scheduledPerformances.slice(0, 6).map((performance) => (
 <Card key={performance.id} className="p-4 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline" className="text-xs">
 {performance.type}
 </Badge>
 <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
 <MoreHorizontal className="h-3 w-3" />
 </Button>
 </div>
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-2">{performance.title}</h3>
 
 <div className="space-y-2 text-xs text-muted-foreground">
 {performance.scheduled_at && (
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 <span>{new Date(performance.scheduled_at).toLocaleString()}</span>
 </div>
 )}
 
 {performance.venue && (
 <div className="flex items-center gap-1">
 <MapPin className="h-3 w-3" />
 <span className="truncate">{performance.venue}</span>
 </div>
 )}
 
 {performance.duration_minutes && (
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 <span>{performance.duration_minutes} minutes</span>
 </div>
 )}
 
 {performance.audience_capacity && (
 <div className="flex items-center gap-1">
 <Users className="h-3 w-3" />
 <span>Capacity: {performance.audience_capacity}</span>
 </div>
 )}
 </div>
 </Card>
 ))}
 </div>
 
 {data.scheduledPerformances.length === 0 && (
 <Card className="p-8 text-center">
 <Music className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No scheduled performances</p>
 </Card>
 )}
 </div>

 {/* Pending Riders */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-semibold flex items-center gap-2">
 <FileText className="h-5 w-5" />
 Pending Riders
 </h2>
 <Link href="/programming/riders">
 <Button variant="ghost" size="sm">
 View All <ArrowRight className="ml-1 h-4 w-4" />
 </Button>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {data.pendingRiders.slice(0, 8).map((rider) => (
 <Card key={rider.id} className="p-4 hover:shadow-md transition-shadow">
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
 
 <h3 className="font-semibold text-sm mb-2 line-clamp-2">{rider.title}</h3>
 
 <div className="space-y-1 text-xs text-muted-foreground">
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 <span>{new Date(rider.created_at).toLocaleDateString()}</span>
 </div>
 
 {rider.event && (
 <div className="flex items-center gap-1">
 <Calendar className="h-3 w-3" />
 <span className="truncate">{rider.event.title}</span>
 </div>
 )}
 </div>
 </Card>
 ))}
 </div>
 
 {data.pendingRiders.length === 0 && (
 <Card className="p-8 text-center">
 <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
 <p className="text-muted-foreground">No pending riders</p>
 </Card>
 )}
 </div>
 </div>
 );
}
