"use client";

import { Calendar, Target, ListTodo, Clock, AlertCircle, CheckCircle, Users, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Badge, Card, Progress } from "@ghxstship/ui";
import { 
 format, 
 parseISO,
 differenceInDays,
 isAfter,
 isBefore,
 startOfDay,
 endOfDay,
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

interface ScheduleTimelineViewProps {
 items: ScheduleItem[];
 onItemClick?: (item: ScheduleItem) => void;
}

export default function ScheduleTimelineView({
 items,
 onItemClick,
}: ScheduleTimelineViewProps) {
 // Group items by month
 const itemsByMonth = useMemo(() => {
 const grouped = new Map<string, ScheduleItem[]>();
 const today = new Date();

 items.forEach(item => {
 const date = item.due_date || item.end_date || item.start_date;
 if (!date) return;

 const monthKey = format(parseISO(date), "yyyy-MM");
 const existing = grouped.get(monthKey) || [];
 grouped.set(monthKey, [...existing, item]);
 });

 // Sort months
 const sortedMonths = Array.from(grouped.keys()).sort();
 const result = new Map<string, ScheduleItem[]>();
 
 sortedMonths.forEach(month => {
 const monthItems = grouped.get(month) || [];
 // Sort items within month by date
 monthItems.sort((a, b) => {
 const dateA = a.due_date || a.end_date || a.start_date || "";
 const dateB = b.due_date || b.end_date || b.start_date || "";
 return dateA.localeCompare(dateB);
 });
 result.set(month, monthItems);
 });

 return result;
 }, [items]);

 // Get item icon
 const getItemIcon = (item: ScheduleItem) => {
 const iconClass = "h-icon-xs w-icon-xs";
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

 // Get status badge
 const getStatusBadge = (status: string) => {
 const variant = 
 status === "completed" || status === "done" ? "success" :
 status === "in_progress" || status === "active" ? "warning" :
 status === "overdue" || status === "blocked" ? "destructive" :
 "secondary";
 
 return (
 <Badge variant={variant} className="text-xs">
 {status.replace("_", " ")}
 </Badge>
 );
 };

 // Get priority badge
 const getPriorityBadge = (priority?: string) => {
 if (!priority) return null;
 
 const variant = 
 priority === "critical" ? "destructive" :
 priority === "high" ? "warning" :
 priority === "medium" ? "secondary" :
 "outline";
 
 return (
 <Badge variant={variant} className="text-xs">
 {priority}
 </Badge>
 );
 };

 // Calculate days until due
 const getDaysUntil = (date?: string) => {
 if (!date) return null;
 const days = differenceInDays(parseISO(date), new Date());
 
 if (days < 0) {
 return (
 <span className="text-destructive text-xs">
 {Math.abs(days)} days overdue
 </span>
 );
 } else if (days === 0) {
 return <span className="text-warning text-xs">Due today</span>;
 } else if (days <= 7) {
 return <span className="text-warning text-xs">{days} days left</span>;
 return <span className="text-muted-foreground text-xs">{days} days left</span>;
 }
 };

 // Render timeline item
  const renderTimelineItem = (item: ScheduleItem, isLast: boolean) => {
 const date = item.due_date || item.end_date || item.start_date;
 const hasDateRange = item.start_date && item.end_date;

 return (
 <div key={item.id} className="flex gap-md">
 {/* Timeline line and dot */}
 <div className="flex flex-col items-center">
 <div
 className="w-3 h-3 rounded-full border-2"
                  style={{
                    borderColor: item.color || "hsl(var(--color-muted))",
                    backgroundColor: item.status === "completed" || item.status === "done" 
                      ? item.color || "hsl(var(--color-muted))" 
                      : "hsl(var(--color-background))",
                  }}
 />
 {!isLast && (
 <div className="w-0.5 flex-1 bg-border" />
 )}
 </div>
 
 <Card className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-2">
 <div className="flex items-start gap-xs">
 <div
 className="p-xs"
                  style={{ backgroundColor: item.color ? `${item.color}20` : "hsl(var(--color-muted) / 0.1)" }}
 >
 {getItemIcon(item)}
 </div>
 <div>
 <h4 className="font-medium group-hover:text-primary transition-colors">
 </h4>
 {item.project && (
 <p className="text-sm text-muted-foreground">
 {item.project.name}
 </p>
 )}
 </div>
 </div>
 <div className="flex items-center gap-xs">
 {getStatusBadge(item.status)}
 {getPriorityBadge(item.priority)}
 </div>
 </div>

 <div className="flex items-center gap-md text-sm">
 {date && (
 <div className="flex items-center gap-xs">
 <Clock className="h-3 w-3 text-muted-foreground" />
 <span>
 {hasDateRange 
 ? `${format(parseISO(item.start_date!), "MMM d")} - ${format(parseISO(item.end_date!), "MMM d")}`
 : format(parseISO(date), "MMM d, yyyy")
 }
 </span>
 </div>
 )}
 
 {item.assignee && (
 <div className="flex items-center gap-xs">
 <Users className="h-3 w-3 text-muted-foreground" />
 <span>{item.assignee.name}</span>
 </div>
 )}

 {getDaysUntil(item.due_date || item.end_date)}
 </div>

 {item.progress !== undefined && (
 <div className="mt-3">
 <div className="flex items-center justify-between text-xs mb-1">
 <span className="text-muted-foreground">Progress</span>
 <span>{item.progress}%</span>
 </div>
 <Progress value={item.progress} className="h-1" />
 </div>
 )}
 </Card>
 </div>
 );
 };

 if (items.length === 0) {
 return (
 <div className="text-center py-xsxl">
 <Calendar className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold mb-2">No timeline items</h3>
 <p className="text-muted-foreground">
 Schedule items with dates will appear here
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-xl">
 {Array.from(itemsByMonth.entries()).map(([month, monthItems]) => (
 <div key={month}>
 <div className="flex items-center gap-xs mb-4">
 <h3 className="text-lg font-semibold">
 {format(parseISO(`${month}-01`), "MMMM yyyy")}
 </h3>
 <Badge variant="secondary">{monthItems.length}</Badge>
 </div>
 
 <div className="ml-6">
 {monthItems.map((item, index) => 
 renderTimelineItem(item, index === monthItems.length - 1)
 )}
 </div>
 </div>
 ))}
 </div>
 );
}
