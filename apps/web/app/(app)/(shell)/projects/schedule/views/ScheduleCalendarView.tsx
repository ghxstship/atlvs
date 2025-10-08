"use client";

import { Calendar, Clock, Target, ListTodo, AlertCircle, CheckCircle, Users, MoreVertical } from "lucide-react";
import { useMemo } from 'react';
import { Badge, Card } from "@ghxstship/ui";
import { 
 format, 
 startOfMonth, 
 endOfMonth, 
 startOfWeek, 
 endOfWeek,
 eachDayOfInterval,
 isSameMonth,
 isSameDay,
 isToday,
 parseISO
} from "date-fns";

interface ScheduleItem {
 id: string;
 type: "project" | "milestone" | "task";
 title: string;
 start_date?: string;
 end_date?: string;
 due_date?: string;
 status: string;
 progress?: number;
 project?: {
 id: string;
 name: string;
 };
 assignee?: {
 id: string;
 name: string;
 };
 priority?: string;
 color?: string;
}

interface ScheduleCalendarViewProps {
 items: ScheduleItem[];
 currentDate: Date;
 calendarView: "month" | "week" | "day";
 onItemClick?: (item: ScheduleItem) => void;
}

export default function ScheduleCalendarView({
 items,
 currentDate,
 calendarView,
 onItemClick
}: ScheduleCalendarViewProps) {
 // Get calendar days based on view
 const calendarDays = useMemo(() => {
 if (calendarView === "day") {
 return [currentDate];
 }

 const start = calendarView === "week" 
 ? startOfWeek(currentDate)
 : startOfWeek(startOfMonth(currentDate));
 
 const end = calendarView === "week"
 ? endOfWeek(currentDate)
 : endOfWeek(endOfMonth(currentDate));

 return eachDayOfInterval({ start, end });
 }, [currentDate, calendarView]);

 // Group items by date
 const itemsByDate = useMemo(() => {
 const grouped = new Map<string, ScheduleItem[]>();

 items.forEach(item => {
 // Get relevant dates for the item
 const dates: string[] = [];
 
 if (item.due_date) {
 dates.push(item.due_date);
 }
 
 if (item.start_date && item.end_date) {
 // For items with date ranges, add to each day in range
 const start = parseISO(item.start_date);
 const end = parseISO(item.end_date);
 const daysInRange = eachDayOfInterval({ start, end });
 daysInRange.forEach(day => {
 dates.push(format(day, "yyyy-MM-dd"));
 });
 } else if (item.start_date) {
 dates.push(item.start_date);
 }

 // Add item to each relevant date
 dates.forEach(date => {
 const existing = grouped.get(date) || [];
 grouped.set(date, [...existing, item]);
 });
 });

 return grouped;
 }, [items]);

 // Get item icon based on type
 const getItemIcon = (item: ScheduleItem) => {
 switch (item.type) {
 case "milestone":
 return <Target className="h-3 w-3" />;
 case "task":
 return <ListTodo className="h-3 w-3" />;
 case "project":
 return <Calendar className="h-3 w-3" />;
 default:
 return null;
 }
 };

 // Get status color
 const getStatusColor = (status: string) => {
 switch (status) {
 case "completed":
 case "done":
 return "text-success";
 case "in_progress":
 case "active":
 return "text-info";
 case "overdue":
 case "blocked":
 return "text-destructive";
 case "pending":
 case "todo":
 case "planning":
 return "text-warning";
 default:
 return "text-muted-foreground";
 }
 };

 // Get priority badge
 const getPriorityBadge = (priority?: string) => {
 if (!priority) return null;
 
 const variant = priority === "critical" ? "destructive" :
 priority === "high" ? "warning" :
 priority === "medium" ? "secondary" :
 "outline";
 
 return (
 <Badge variant={variant} className="text-xs px-xs py-0">
 {priority}
 </Badge>
 );
 };

 // Render day cell
 const renderDayCell = (day: Date) => {
 const dateStr = format(day, "yyyy-MM-dd");
 const dayItems = itemsByDate.get(dateStr) || [];
 const isCurrentMonth = calendarView === "month" ? isSameMonth(day, currentDate) : true;
 const isTodayDate = isToday(day);

 return (
 <div
 key={dateStr}
 className={`
 min-h-header-md border-r border-b p-xs
 ${!isCurrentMonth ? "bg-muted/30" : ""}
 ${isTodayDate ? "bg-primary/5" : ""}
 ${calendarView === "day" ? "min-h-modal-lg" : ""}
 `}
 >
 <div className="flex items-center justify-between mb-1">
 <span className={`
 text-sm font-medium
 ${isTodayDate ? "text-primary" : ""}
 ${!isCurrentMonth ? "text-muted-foreground" : ""}
 `}>
 {format(day, calendarView === "day" ? "EEEE, MMMM d" : "d")}
 </span>
 {dayItems.length > 0 && (
 <Badge variant="secondary" className="text-xs">
 {dayItems.length}
 </Badge>
 )}
 </div>

 <div className="space-y-xs">
 {dayItems.slice(0, calendarView === "day" ? undefined : 3).map((item, index) => (
 <div
 key={`${item.id}-${index}`}
 onClick={() => onItemClick?.(item)}
 className={`
 p-xs rounded text-xs cursor-pointer
 hover:bg-accent transition-colors
 border-l-2
 `}
 style={{ borderLeftColor: item.color || "#6B7280" }}
 >
 <div className="flex items-start gap-xs">
 <span className={getStatusColor(item.status)}>
 {getItemIcon(item)}
 </span>
 <div className="flex-1 min-w-0">
 <p className="truncate font-medium">{item.title}</p>
 {item.project && (
 <p className="truncate text-muted-foreground">
 {item.project.name}
 </p>
 )}
 </div>
 {getPriorityBadge(item.priority)}
 </div>
 {item.assignee && calendarView === "day" && (
 <div className="flex items-center gap-xs mt-1 text-muted-foreground">
 <Users className="h-3 w-3" />
 <span className="truncate">{item.assignee.name}</span>
 </div>
 )}
 </div>
 ))}
 
 {calendarView !== "day" && dayItems.length > 3 && (
 <button
 onClick={() => {
 // Could open a modal or expand view
 }}
 className="text-xs text-primary hover:underline"
 >
 +{dayItems.length - 3} more
 </button>
 )}
 </div>
 </div>
 );
 };

 // Render week headers
 const renderWeekHeaders = () => {
 const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
 
 return (
 <div className="grid grid-cols-7 border-b">
 {weekDays.map(day => (
 <div
 key={day}
 className="p-xs text-sm font-medium text-center border-r"
 >
 {day}
 </div>
 ))}
 </div>
 );
 };

 if (calendarView === "day") {
 return (
 <div className="border rounded-lg">
 {renderDayCell(currentDate)}
 </div>
 );
 }

 if (calendarView === "week") {
 return (
 <div className="border-l border-t rounded-lg overflow-hidden">
 {renderWeekHeaders()}
 <div className="grid grid-cols-7">
 {calendarDays.map(day => renderDayCell(day))}
 </div>
 </div>
 );
 }

 // Month view
 return (
 <div className="border-l border-t rounded-lg overflow-hidden">
 {renderWeekHeaders()}
 <div className="grid grid-cols-7">
 {calendarDays.map(day => renderDayCell(day))}
 </div>
 </div>
 );
}
