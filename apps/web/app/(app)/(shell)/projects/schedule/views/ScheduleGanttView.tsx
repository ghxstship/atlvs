"use client";

import { Calendar, Target, ListTodo, Users, AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { Badge, Card } from "@ghxstship/ui";
import { 
 format, 
 parseISO,
 differenceInDays,
 startOfMonth,
 endOfMonth,
 eachDayOfInterval,
 isWithinInterval,
 isSameDay,
 isToday,
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

interface ScheduleGanttViewProps {
 items: ScheduleItem[];
 onItemClick?: (item: ScheduleItem) => void;
}

export default function ScheduleGanttView({
 items,
 onItemClick,
}: ScheduleGanttViewProps) {
 // Calculate date range for the Gantt chart
 const { startDate, endDate, days } = useMemo(() => {
 if (items.length === 0) {
 const today = new Date();
 return {
 startDate: startOfMonth(today),
 endDate: endOfMonth(today),
 days: eachDayOfInterval({ 
 start: startOfMonth(today), 
 end: endOfMonth(today) 
 }),
 };
 }

 // Find earliest and latest dates
 let earliest: Date | null = null;
 let latest: Date | null = null;

 items.forEach(item => {
 const dates = [item.start_date, item.end_date, item.due_date]
 .filter(Boolean)
 .map(d => parseISO(d!));
 
 dates.forEach(date => {
 if (!earliest || date < earliest) earliest = date;
 if (!latest || date > latest) latest = date;
 });
 });

 if (!earliest || !latest) {
 const today = new Date();
 return {
 startDate: startOfMonth(today),
 endDate: endOfMonth(today),
 days: eachDayOfInterval({ 
 start: startOfMonth(today), 
 end: endOfMonth(today) 
 }),
 };
 }

 // Add some padding
 const start = startOfMonth(earliest);
 const end = endOfMonth(latest);
 
 return {
 startDate: start,
 endDate: end,
 days: eachDayOfInterval({ start, end }),
 };
 }, [items]);

 // Group items by project
 const groupedItems = useMemo(() => {
 const groups = new Map<string, ScheduleItem[]>();
 
 // Group by project
 items.forEach(item => {
 const projectId = item.project?.id || "no-project";
 const existing = groups.get(projectId) || [];
 groups.set(projectId, [...existing, item]);
 });

 // Sort items within each group
 groups.forEach((groupItems, key) => {
 groupItems.sort((a, b) => {
 const dateA = a.start_date || a.due_date || "";
 const dateB = b.start_date || b.due_date || "";
 return dateA.localeCompare(dateB);
 });
 groups.set(key, groupItems);
 });

 return groups;
 }, [items]);

 // Calculate bar position and width
 const getBarStyle = (item: ScheduleItem) => {
 const itemStart = item.start_date ? parseISO(item.start_date) : 
 item.due_date ? parseISO(item.due_date) : null;
 const itemEnd = item.end_date ? parseISO(item.end_date) :
 item.due_date ? parseISO(item.due_date) : null;

 if (!itemStart || !itemEnd) return null;

 const totalDays = differenceInDays(endDate, startDate) + 1;
 const startOffset = differenceInDays(itemStart, startDate);
 const duration = differenceInDays(itemEnd, itemStart) + 1;

 const left = (startOffset / totalDays) * 100;
 const width = (duration / totalDays) * 100;

 return {
 left: `${Math.max(0, left)}%`,
 width: `${Math.min(100 - left, width)}%`,
 backgroundColor: item.color || "#6B7280",
 opacity: item.status === "completed" || item.status === "done" ? 0.7 : 1,
 };
 };

 // Get item icon
 const getItemIcon = (item: ScheduleItem) => {
 const iconClass = "h-3 w-3";
 switch (item.type) {
 case "milestone":
 return <Target className={iconClass} />;
 case "task":
 return <ListTodo className={iconClass} />;
 case "project":
 return <Calendar className={iconClass} />;
 default:
 return null;
 }
 };

 // Render Gantt row
 const renderGanttRow = (item: ScheduleItem) => {
 const barStyle = getBarStyle(item);
 const isOverdue = item.status === "overdue" || 
 (item.due_date && parseISO(item.due_date) < new Date() && 
 item.status !== "completed" && item.status !== "done");

 return (
 <div
 key={item.id}
 className="flex border-b hover:bg-muted/50 transition-colors cursor-pointer"
 onClick={() => onItemClick?.(item)}
 >
 {/* Item info */}
 <div className="w-container-md p-sm border-r flex items-center gap-xs">
 <div className="flex-shrink-0">
 {getItemIcon(item)}
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-medium text-sm truncate">{item.title}</p>
 <div className="flex items-center gap-xs mt-1">
 {item.assignee && (
 <span className="text-xs text-muted-foreground flex items-center gap-xs">
 <Users className="h-3 w-3" />
 {item.assignee.name}
 </span>
 )}
 {item.priority && (
 <Badge 
 variant={
 item.priority === "critical" ? "destructive" :
 item.priority === "high" ? "warning" :
 "secondary"
 }
 className="text-xs px-xs py-0"
 >
 {item.priority}
 </Badge>
 )}
 {isOverdue && (
 <AlertCircle className="h-3 w-3 text-destructive" />
 )}
 </div>
 </div>
 </div>

 {/* Gantt bar area */}
 <div className="flex-1 relative p-xs">
 {barStyle && (
 <div
 className="absolute h-icon-lg rounded flex items-center px-xs hover:opacity-80 transition-opacity"
 style={barStyle}
 >
 {item.progress !== undefined && (
 <div className="absolute inset-0 rounded overflow-hidden">
 <div
 className="h-full bg-black/20"
 style={{ width: `${item.progress}%` }}
 />
 </div>
 )}
 <span className="text-xs text-white font-medium truncate relative z-10">
 {item.progress !== undefined && `${item.progress}%`}
 </span>
 </div>
 )}
 </div>
 </div>
 );
 };

 // Render month headers
 const renderMonthHeaders = () => {
 const months = new Map<string, number>();
 
 days.forEach(day => {
 const monthKey = format(day, "MMM yyyy");
 months.set(monthKey, (months.get(monthKey) || 0) + 1);
 });

 return (
 <div className="flex border-b bg-muted/50">
 <div className="w-container-md p-xs border-r font-medium text-sm">
 Items
 </div>
 <div className="flex-1 flex">
 {Array.from(months.entries()).map(([month, count]) => (
 <div
 key={month}
 className="border-r text-center py-xs text-sm font-medium"
 style={{ width: `${(count / days.length) * 100}%` }}
 >
 {month}
 </div>
 ))}
 </div>
 </div>
 );
 };

 // Render day grid
 const renderDayGrid = () => {
 return (
 <div className="absolute inset-0 flex pointer-events-none">
 {days.map(day => {
 const isTodayDate = isToday(day);
 return (
 <div
 key={day.toISOString()}
 className={`
 border-r border-border/20
 ${isTodayDate ? "bg-primary/5" : ""}
 `}
 style={{ width: `${100 / days.length}%` }}
 />
 );
 })}
 </div>
 );
 };

 if (items.length === 0) {
 return (
 <div className="text-center py-xsxl">
 <Calendar className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold mb-2">No schedule items</h3>
 <p className="text-muted-foreground">
 Add milestones and tasks to see them in the Gantt chart
 </p>
 </div>
 );
 }

 return (
 <div className="border rounded-lg overflow-hidden">
 {/* Month headers */}
 {renderMonthHeaders()}

 {/* Gantt rows */}
 <div className="relative">
 {/* Day grid background */}
 <div className="absolute inset-0 left-80">
 {renderDayGrid()}
 </div>

 {/* Items grouped by project */}
 {Array.from(groupedItems.entries()).map(([projectId, projectItems]) => {
 const projectName = projectItems[0]?.project?.name || "Unassigned";
 
 return (
 <div key={projectId}>
 {projectId !== "no-project" && (
 <div className="flex border-b bg-muted/30">
 <div className="w-container-md p-xs border-r font-medium text-sm">
 {projectName}
 </div>
 <div className="flex-1" />
 </div>
 )}
 {projectItems.map(item => renderGanttRow(item))}
 </div>
 );
 })}
 </div>
 </div>
 );
}
