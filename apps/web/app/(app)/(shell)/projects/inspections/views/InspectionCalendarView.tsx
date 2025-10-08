"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from 'react';
import { Badge, Button } from "@ghxstship/ui";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import type { Inspection } from "../InspectionsClient";
import type { LucideIcon } from "lucide-react";

interface InspectionCalendarViewProps {
 inspections: Inspection[];
 onView: (inspection: Inspection) => void;
 getTypeIcon: (type: string) => LucideIcon;
 getStatusBadgeVariant: (status: string) => any;
}

export default function InspectionCalendarView({
 inspections,
 onView,
 getTypeIcon,
 getStatusBadgeVariant
}: InspectionCalendarViewProps) {
 const [currentMonth, setCurrentMonth] = useState(new Date());

 // Group inspections by date
 const inspectionsByDate = useMemo(() => {
 const grouped: Record<string, Inspection[]> = {};
 inspections.forEach((inspection) => {
 // Use completed date if available, otherwise scheduled date
 const dateToUse = inspection.status === "completed" && inspection.completed_date 
 ? inspection.completed_date 
 : inspection.scheduled_date;
 
 const dateKey = format(parseISO(dateToUse), "yyyy-MM-dd");
 if (!grouped[dateKey]) {
 grouped[dateKey] = [];
 }
 grouped[dateKey].push(inspection);
 });
 return grouped;
 }, [inspections]);

 // Generate calendar days
 const calendarDays = useMemo(() => {
 const start = startOfMonth(currentMonth);
 const end = endOfMonth(currentMonth);
 return eachDayOfInterval({ start, end });
 }, [currentMonth]);

 // Get day of week for first day of month (0 = Sunday)
 const firstDayOfWeek = useMemo(() => {
 return startOfMonth(currentMonth).getDay();
 }, [currentMonth]);

 // Add empty cells for days before month starts
 const emptyDays = Array(firstDayOfWeek).fill(null);

 const getTypeEmoji = (type: string) => {
 switch (type) {
 case "safety":
 return "🛡️";
 case "quality":
 return "⭐";
 case "compliance":
 return "📋";
 case "progress":
 return "📈";
 case "final":
 return "✅";
 default:
 return "📝";
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case "scheduled":
 return "bg-gray-100 text-gray-800 border-gray-300";
 case "in_progress":
 return "bg-yellow-100 text-yellow-800 border-yellow-300";
 case "completed":
 return "bg-green-100 text-green-800 border-green-300";
 case "failed":
 return "bg-red-100 text-red-800 border-red-300";
 case "cancelled":
 return "bg-gray-100 text-gray-500 border-gray-300";
 default:
 return "bg-gray-100 text-gray-800 border-gray-300";
 }
 };

 return (
 <div className="bg-background rounded-lg">
 {/* Calendar Header */}
 <div className="flex items-center justify-between mb-md p-md border-b">
 <h2 className="text-xl font-semibold">
 {format(currentMonth, "MMMM yyyy")}
 </h2>
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
 >
 <ChevronLeft className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setCurrentMonth(new Date())}
 >
 Today
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
 >
 <ChevronRight className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 {/* Days of Week Header */}
 <div className="grid grid-cols-7 gap-px bg-muted p-px">
 {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
 <div key={day} className="bg-background p-sm text-center font-semibold text-sm">
 {day}
 </div>
 ))}
 </div>

 {/* Calendar Grid */}
 <div className="grid grid-cols-7 gap-px bg-muted p-px">
 {/* Empty cells for alignment */}
 {emptyDays.map((_, index) => (
 <div key={`empty-${index}`} className="bg-background p-sm min-h-header-lg" />
 ))}
 
 {/* Calendar days */}
 {calendarDays.map((date) => {
 const dateKey = format(date, "yyyy-MM-dd");
 const dayInspections = inspectionsByDate[dateKey] || [];
 const isToday = isSameDay(date, new Date());
 const isCurrentMonth = isSameMonth(date, currentMonth);
 
 return (
 <div
 key={dateKey}
 className={`bg-background p-sm min-h-header-lg ${
 isToday ? "bg-primary/5 ring-1 ring-primary" : ""
 } ${!isCurrentMonth ? "opacity-50" : ""}`}
 >
 <div className={`font-medium mb-xs text-sm ${isToday ? "text-primary" : ""}`}>
 {format(date, "d")}
 </div>
 <div className="space-y-xs">
 {dayInspections.slice(0, 3).map((inspection) => (
 <div
 key={inspection.id}
 className={`text-xs p-xs rounded cursor-pointer hover:opacity-80 transition-opacity border ${getStatusColor(
 inspection.status
 )}`}
 onClick={() => onView(inspection)}
 title={inspection.title}
 >
 <div className="flex items-center gap-xs">
 <span>{getTypeEmoji(inspection.type)}</span>
 <span className="truncate font-medium">
 {inspection.title.length > 15 
 ? `${inspection.title.substring(0, 15)}...` 
 : inspection.title}
 </span>
 </div>
 {inspection.score !== undefined && inspection.score !== null && (
 <div className="text-small mt-xs">
 Score: {inspection.score}%
 </div>
 )}
 </div>
 ))}
 {dayInspections.length > 3 && (
 <div className="text-xs text-muted-foreground pl-xs">
 +{dayInspections.length - 3} more
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>

 {/* Legend */}
 <div className="flex items-center gap-md p-md border-t">
 <div className="text-sm font-medium">Status:</div>
 <div className="flex items-center gap-sm flex-wrap">
 {["scheduled", "in_progress", "completed", "failed", "cancelled"].map((status) => (
 <div key={status} className="flex items-center gap-xs">
 <div className={`w-3 h-3 rounded border ${getStatusColor(status)}`} />
 <span className="text-xs capitalize">{status.replace("_", " ")}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Type Legend */}
 <div className="flex items-center gap-md px-md pb-md">
 <div className="text-sm font-medium">Types:</div>
 <div className="flex items-center gap-sm flex-wrap">
 {[
 { type: "safety", emoji: "🛡️", label: "Safety" },
 { type: "quality", emoji: "⭐", label: "Quality" },
 { type: "compliance", emoji: "📋", label: "Compliance" },
 { type: "progress", emoji: "📈", label: "Progress" },
 { type: "final", emoji: "✅", label: "Final" },
 ].map(({ type, emoji, label }) => (
 <div key={type} className="flex items-center gap-xs">
 <span>{emoji}</span>
 <span className="text-xs">{label}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
