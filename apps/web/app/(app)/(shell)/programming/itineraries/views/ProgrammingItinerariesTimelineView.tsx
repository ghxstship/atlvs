"use client";

import { Edit, Eye, Trash2, MapPin, Calendar, Users, DollarSign, Clock } from "lucide-react";
import { useMemo } from "react";
import {
 Badge,
 Button,
 Card,
} from "@ghxstship/ui";
import type { ProgrammingItinerary, ItinerarySort } from "../types";
import { STATUS_BADGE, TYPE_BADGE, TRANSPORTATION_TYPE_LABEL } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingItinerariesTimelineViewProps = {
 itineraries: ProgrammingItinerary[];
 loading: boolean;
 selectedItineraries: Set<string>;
 onSelectionChange: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onEdit: (itinerary: ProgrammingItinerary) => void;
 onView: (itinerary: ProgrammingItinerary) => void;
 onDelete: (itinerary: ProgrammingItinerary) => void;
 sortConfig: ItinerarySort;
 onSort: (sort: ItinerarySort) => void;
 users: User[];
};

interface TimelineGroup {
 date: string;
 itineraries: ProgrammingItinerary[];
}

export default function ProgrammingItinerariesTimelineView({
 itineraries,
 loading,
 selectedItineraries,
 onSelectionChange,
 onSelectAll,
 onEdit,
 onView,
 onDelete,
 sortConfig,
 onSort,
 users,
}: ProgrammingItinerariesTimelineViewProps) {
 
 const timelineGroups = useMemo(() => {
 const groups: { [key: string]: ProgrammingItinerary[] } = {};
 
 itineraries.forEach((itinerary) => {
 const date = new Date(itinerary.start_date).toDateString();
 if (!groups[date]) {
 groups[date] = [];
 }
 groups[date].push(itinerary);
 });

 return Object.entries(groups)
 .map(([date, items]) => ({
 date,
 itineraries: items.sort((a, b) => 
 new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
 ),
 }))
 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
 }, [itineraries]);

 const formatDate = (dateString: string) => {
 const date = new Date(dateString);
 return date.toLocaleDateString("en-US", {
 weekday: "long",
 year: "numeric",
 month: "long",
 day: "numeric",
 });
 };

 const formatTime = (dateString: string) => {
 return new Date(dateString).toLocaleTimeString("en-US", {
 hour: "2-digit",
 minute: "2-digit",
 });
 };

 const formatCurrency = (amount: number | null, currency: string | null) => {
 if (!amount || !currency) return null;
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency,
 }).format(amount);
 };

 const getUserName = (userId: string) => {
 const user = users.find((u) => u.id === userId);
 return user?.full_name || user?.email || "Unknown User";
 };

 const getDaysDifference = (startDate: string, endDate: string) => {
 const start = new Date(startDate);
 const end = new Date(endDate);
 const diffTime = Math.abs(end.getTime() - start.getTime());
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 return diffDays;
 };

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-xsxl">
 <div className="text-center">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading timeline...</p>
 </div>
 </div>
 </Card>
 );
 }

 if (timelineGroups.length === 0) {
 return (
 <Card className="p-lg">
 <div className="text-center py-xsxl">
 <Calendar className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-medium mb-2">No itineraries found</h3>
 <p className="text-muted-foreground">Create your first itinerary to see it on the timeline</p>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 {timelineGroups.map((group, groupIndex) => (
 <div key={group.date} className="relative">
 {/* Date Header */}
 <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-sm mb-md">
 <div className="flex items-center gap-md">
 <div className="h-px bg-border flex-1" />
 <div className="bg-background border rounded-full px-md py-sm">
 <h3 className="text-sm font-medium">{formatDate(group.date)}</h3>
 </div>
 <div className="h-px bg-border flex-1" />
 </div>
 </div>

 {/* Timeline Items */}
 <div className="relative pl-8">
 {/* Timeline Line */}
 <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

 <div className="space-y-md">
 {group.itineraries.map((itinerary, index) => {
 const statusConfig = STATUS_BADGE[itinerary.status];
 const typeConfig = TYPE_BADGE[itinerary.type];
 const isSelected = selectedItineraries.has(itinerary.id);
 const duration = getDaysDifference(itinerary.start_date, itinerary.end_date);
 const cost = formatCurrency(itinerary.total_cost, itinerary.currency);

 return (
 <div key={itinerary.id} className="relative">
 {/* Timeline Dot */}
 <div className={`absolute -left-6 top-sm w-3 h-3 rounded-full border-2 ${
 isSelected ? 'bg-primary border-primary' : 'bg-background border-border'
 }`} />

 {/* Itinerary Card */}
 <Card className={`p-md transition-all hover:shadow-md ${
 isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
 }`}>
 <div className="flex items-start justify-between mb-sm">
 <div className="flex-1">
 <div className="flex items-center gap-sm mb-1">
 <h4 className="font-medium">{itinerary.name}</h4>
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon} {typeConfig.label}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>
 
 {itinerary.description && (
 <p className="text-sm text-muted-foreground mb-sm">
 {itinerary.description}
 </p>
 )}
 </div>

 <div className="flex items-center gap-xs ml-md">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(itinerary)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(itinerary)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(itinerary)}
 >
 <Trash2 className="h-icon-xs w-icon-xs text-destructive" />
 </Button>
 </div>
 </div>

 {/* Timeline Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md text-sm">
 {/* Duration */}
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Duration:</span>
 <span>{duration} {duration === 1 ? 'day' : 'days'}</span>
 </div>

 {/* Time Range */}
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Time:</span>
 <span>
 {formatTime(itinerary.start_date)} - {formatTime(itinerary.end_date)}
 </span>
 </div>

 {/* Location */}
 {itinerary.location && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Location:</span>
 <span className="truncate">{itinerary.location}</span>
 </div>
 )}

 {/* Cost */}
 {cost && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Cost:</span>
 <span>{cost}</span>
 </div>
 )}

 {/* Participants */}
 {itinerary.participants_count && (
 <div className="flex items-center gap-xs">
 <Users className="h-3 w-3 text-muted-foreground" />
 <span className="text-muted-foreground">Participants:</span>
 <span>{itinerary.participants_count}</span>
 </div>
 )}

 {/* Transportation */}
 {itinerary.transportation_type && (
 <div className="flex items-center gap-xs">
 <span className="text-muted-foreground">Transport:</span>
 <span>{TRANSPORTATION_TYPE_LABEL[itinerary.transportation_type]}</span>
 </div>
 )}

 {/* Project */}
 {itinerary.project && (
 <div className="flex items-center gap-xs">
 <span className="text-muted-foreground">Project:</span>
 <span className="truncate">{itinerary.project.name}</span>
 </div>
 )}

 {/* Event */}
 {itinerary.event && (
 <div className="flex items-center gap-xs">
 <span className="text-muted-foreground">Event:</span>
 <span className="truncate">{itinerary.event.title}</span>
 </div>
 )}
 </div>

 {/* Destinations */}
 {itinerary.destinations.length > 0 && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Destinations:</div>
 <div className="flex flex-wrap gap-xs">
 {itinerary.destinations.slice(0, 5).map((destination, destIndex) => (
 <Badge key={destIndex} variant="outline" className="text-xs">
 <MapPin className="h-2 w-2 mr-1" />
 {destination.name}
 </Badge>
 ))}
 {itinerary.destinations.length > 5 && (
 <Badge variant="outline" className="text-xs">
 +{itinerary.destinations.length - 5} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Tags */}
 {itinerary.tags.length > 0 && (
 <div className="mt-sm pt-sm border-t">
 <div className="text-xs text-muted-foreground mb-1">Tags:</div>
 <div className="flex flex-wrap gap-xs">
 {itinerary.tags.slice(0, 5).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 {itinerary.tags.length > 5 && (
 <Badge variant="secondary" className="text-xs">
 +{itinerary.tags.length - 5} more
 </Badge>
 )}
 </div>
 </div>
 )}

 {/* Footer */}
 <div className="mt-sm pt-sm border-t flex justify-between text-xs text-muted-foreground">
 <span>Created by {getUserName(itinerary.created_by)}</span>
 <span>{new Date(itinerary.created_at).toLocaleString()}</span>
 </div>
 </Card>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 ))}
 </div>
 );
}
