"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button } from "@ghxstship/ui";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import type { Activation } from "../ActivationsClient";

interface ActivationCalendarViewProps {
 activations: Activation[];
 onView: (activation: Activation) => void;
}

export default function ActivationCalendarView({
 activations,
 onView,
}: ActivationCalendarViewProps) {
 const [currentMonth, setCurrentMonth] = useState(new Date());

 // Group activations by date
 const activationsByDate = useMemo(() => {
 const grouped: Record<string, Activation[]> = {};
 activations.forEach((activation) => {
 if (activation.scheduled_date) {
 const dateKey = format(parseISO(activation.scheduled_date), "yyyy-MM-dd");
 if (!grouped[dateKey]) {
 grouped[dateKey] = [];
 }
 grouped[dateKey].push(activation);
 }
 });
 return grouped;
 }, [activations]);

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

 const getStatusColor = (status: string) => {
 switch (status) {
 case "planning":
 return "bg-gray-100 text-gray-800";
 case "ready":
 return "bg-yellow-100 text-yellow-800";
 case "active":
 return "bg-blue-100 text-blue-800";
 case "completed":
 return "bg-green-100 text-green-800";
 case "cancelled":
 return "bg-red-100 text-red-800";
 default:
 return "bg-gray-100 text-gray-800";
 }
 };

 const getTypeIcon = (type: string) => {
 switch (type) {
 case "full_launch":
 return "🚀";
 case "soft_launch":
 return "🌱";
 case "beta":
 return "🧪";
 case "pilot":
 return "✈️";
 case "rollout":
 return "📈";
 default:
 return "📌";
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
 const dayActivations = activationsByDate[dateKey] || [];
 const isToday = isSameDay(date, new Date());
 const isCurrentMonth = isSameMonth(date, currentMonth);
 
 return (
 <div
 key={dateKey}
 className={`bg-background p-sm min-h-header-lg ${
 isToday ? "bg-primary/5 ring-1 ring-primary" : ""
 } ${!isCurrentMonth ? "opacity-50" : ""}`}
 >
 <div className={`font-medium mb-xs ${isToday ? "text-primary" : ""}`}>
 {format(date, "d")}
 </div>
 <div className="space-y-xs">
 {dayActivations.slice(0, 3).map((activation) => (
 <div
 key={activation.id}
 className={`text-xs p-xs rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(
 activation.status
 )}`}
 onClick={() => onView(activation)}
 >
 <div className="flex items-center gap-xs">
 <span>{getTypeIcon(activation.activation_type)}</span>
 <span className="truncate font-medium">{activation.name}</span>
 </div>
 </div>
 ))}
 {dayActivations.length > 3 && (
 <div className="text-xs text-muted-foreground pl-xs">
 +{dayActivations.length - 3} more
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
 {["planning", "ready", "active", "completed", "cancelled"].map((status) => (
 <div key={status} className="flex items-center gap-xs">
 <div className={`w-3 h-3 rounded ${getStatusColor(status)}`} />
 <span className="text-xs capitalize">{status}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
