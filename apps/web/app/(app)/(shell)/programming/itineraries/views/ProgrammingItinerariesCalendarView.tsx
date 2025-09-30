"use client";

import { ChevronLeft, ChevronRight, Edit, Eye, Trash2, MapPin, Users, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";
import {
 Badge,
 Button,
 Card,
} from "@ghxstship/ui";
import type { ProgrammingItinerary, ItinerarySort } from "../types";
import { STATUS_BADGE, TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingItinerariesCalendarViewProps = {
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

interface CalendarDay {
 date: Date;
 isCurrentMonth: boolean;
 itineraries: ProgrammingItinerary[];
}

export default function ProgrammingItinerariesCalendarView({
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
}: ProgrammingItinerariesCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());

 const calendarData = useMemo(() => {
 const year = currentDate.getFullYear();
 const month = currentDate.getMonth();
 
 // Get first day of the month and calculate start of calendar grid
 const firstDayOfMonth = new Date(year, month, 1);
 const lastDayOfMonth = new Date(year, month + 1, 0);
 const startOfCalendar = new Date(firstDayOfMonth);
 startOfCalendar.setDate(startOfCalendar.getDate() - firstDayOfMonth.getDay());
 
 // Generate 42 days (6 weeks) for the calendar grid
 const days: CalendarDay[] = [];
 const currentCalendarDate = new Date(startOfCalendar);
 
 for (let i = 0; i < 42; i++) {
 const dayItineraries = itineraries.filter((itinerary) => {
 const startDate = new Date(itinerary.start_date);
 const endDate = new Date(itinerary.end_date);
 return currentCalendarDate >= startDate && currentCalendarDate <= endDate;
 });

 days.push({
 date: new Date(currentCalendarDate),
 isCurrentMonth: currentCalendarDate.getMonth() === month,
 itineraries: dayItineraries,
 });
 
 currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
 }
 
 return days;
 }, [currentDate, itineraries]);

 const navigateMonth = (direction: 'prev' | 'next') => {
 setCurrentDate(prev => {
 const newDate = new Date(prev);
 if (direction === 'prev') {
 newDate.setMonth(newDate.getMonth() - 1);
 } else {
 newDate.setMonth(newDate.getMonth() + 1);
 }
 return newDate;
 });
 };

 const goToToday = () => {
 setCurrentDate(new Date());
 };

 const formatCurrency = (amount: number | null, currency: string | null) => {
 if (!amount || !currency) return null;
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency,
 }).format(amount);
 };

 const isToday = (date: Date) => {
 const today = new Date();
 return date.toDateString() === today.toDateString();
 };

 const monthNames = [
 "January", "February", "March", "April", "May", "June",
 "July", "August", "September", "October", "November", "December"
 ];

 const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-12">
 <div className="text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading calendar...</p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <Card className="p-lg">
 {/* Calendar Header */}
 <div className="flex items-center justify-between mb-lg">
 <div className="flex items-center gap-md">
 <h2 className="text-xl font-semibold">
 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
 </h2>
 <Button variant="outline" size="sm" onClick={goToToday}>
 Today
 </Button>
 </div>
 
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
 <ChevronLeft className="h-4 w-4" />
 </Button>
 <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
 <ChevronRight className="h-4 w-4" />
 </Button>
 </div>
 </div>

 {/* Calendar Grid */}
 <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
 {/* Day Headers */}
 {dayNames.map((day) => (
 <div key={day} className="bg-muted p-sm text-center text-sm font-medium">
 {day}
 </div>
 ))}

 {/* Calendar Days */}
 {calendarData.map((day, index) => (
 <div
 key={index}
 className={`bg-background min-h-[120px] p-sm ${
 !day.isCurrentMonth ? 'opacity-50' : ''
 } ${isToday(day.date) ? 'bg-primary/5' : ''}`}
 >
 {/* Date Number */}
 <div className={`text-sm font-medium mb-sm ${
 isToday(day.date) ? 'text-primary' : day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
 }`}>
 {day.date.getDate()}
 </div>

 {/* Itineraries for this day */}
 <div className="space-y-1">
 {day.itineraries.slice(0, 3).map((itinerary) => {
 const statusConfig = STATUS_BADGE[itinerary.status];
 const typeConfig = TYPE_BADGE[itinerary.type];
 const isSelected = selectedItineraries.has(itinerary.id);

 return (
 <div
 key={itinerary.id}
 className={`group relative p-1 rounded text-xs cursor-pointer transition-all hover:shadow-sm ${
 isSelected ? 'ring-1 ring-primary bg-primary/10' : 'bg-muted/50 hover:bg-muted'
 }`}
 onClick={() => onView(itinerary)}
 >
 <div className="flex items-center justify-between">
 <div className="flex-1 min-w-0">
 <div className="font-medium truncate">{itinerary.name}</div>
 <div className="flex items-center gap-1 mt-0.5">
 <Badge variant={statusConfig.variant} className="text-[10px] px-1 py-0">
 {statusConfig.label}
 </Badge>
 <span className="text-[10px] text-muted-foreground">
 {typeConfig.icon}
 </span>
 </div>
 </div>
 
 {/* Quick Actions */}
 <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 ml-1">
 <Button
 variant="ghost"
 size="sm"
 className="h-4 w-4 p-0"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(itinerary);
 }}
 >
 <Edit className="h-2.5 w-2.5" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 className="h-4 w-4 p-0"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(itinerary);
 }}
 >
 <Trash2 className="h-2.5 w-2.5 text-destructive" />
 </Button>
 </div>
 </div>

 {/* Additional info on hover */}
 <div className="absolute z-10 left-0 top-full mt-1 p-2 bg-popover border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-[200px]">
 <div className="space-y-1 text-xs">
 <div className="font-medium">{itinerary.name}</div>
 {itinerary.description && (
 <div className="text-muted-foreground">{itinerary.description}</div>
 )}
 
 <div className="flex items-center gap-1">
 <span className="font-medium">Type:</span>
 <span>{typeConfig.label}</span>
 </div>
 
 {itinerary.location && (
 <div className="flex items-center gap-1">
 <MapPin className="h-2.5 w-2.5" />
 <span>{itinerary.location}</span>
 </div>
 )}
 
 {itinerary.participants_count && (
 <div className="flex items-center gap-1">
 <Users className="h-2.5 w-2.5" />
 <span>{itinerary.participants_count} participants</span>
 </div>
 )}
 
 {itinerary.total_cost && (
 <div className="flex items-center gap-1">
 <DollarSign className="h-2.5 w-2.5" />
 <span>{formatCurrency(itinerary.total_cost, itinerary.currency)}</span>
 </div>
 )}
 
 <div className="text-[10px] text-muted-foreground pt-1 border-t">
 {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
 </div>
 </div>
 </div>
 </div>
 );
 })}

 {/* Show more indicator */}
 {day.itineraries.length > 3 && (
 <div className="text-[10px] text-muted-foreground text-center py-0.5">
 +{day.itineraries.length - 3} more
 </div>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Legend */}
 <div className="mt-lg pt-lg border-t">
 <div className="flex flex-wrap gap-md text-xs">
 <div className="flex items-center gap-sm">
 <span className="font-medium">Status:</span>
 {Object.entries(STATUS_BADGE).map(([status, config]) => (
 <div key={status} className="flex items-center gap-1">
 <Badge variant={config.variant} className="text-[10px] px-1 py-0">
 {config.label}
 </Badge>
 </div>
 ))}
 </div>
 </div>
 </div>
 </Card>
 );
}
