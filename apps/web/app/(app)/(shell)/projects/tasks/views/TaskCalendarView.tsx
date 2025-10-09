"use client";

import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Clock, Edit, ListTodo, Tag, Users } from "lucide-react";
import { useState, useMemo } from 'react';
import { Badge, Card, Button } from "@ghxstship/ui";
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
 parseISO,
 addMonths,
 subMonths
} from "date-fns";

interface User {
 id: string;
 email: string;
 full_name?: string;
}

interface Task {
 id: string;
 title: string;
 status: "todo" | "in_progress" | "review" | "done" | "blocked";
 priority: "low" | "medium" | "high" | "critical";
 assignee?: User;
 due_date?: string;
 start_date?: string;
 tags?: string[];
}

interface TaskCalendarViewProps {
 tasks: Task[];
 onViewTask: (task: Task) => void;
 onEditTask: (task: Task) => void;
}

export default function TaskCalendarView({
 tasks,
 onViewTask,
 onEditTask
}: TaskCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [selectedDate, setSelectedDate] = useState<Date | null>(null);

 // Get calendar days
 const calendarDays = useMemo(() => {
 const start = startOfWeek(startOfMonth(currentDate));
 const end = endOfWeek(endOfMonth(currentDate));
 return eachDayOfInterval({ start, end });
 }, [currentDate]);

 // Group tasks by date
 const tasksByDate = useMemo(() => {
 const grouped = new Map<string, Task[]>();

 tasks.forEach(task => {
 // Add task to due date
 if (task.due_date) {
 const dateKey = format(parseISO(task.due_date), "yyyy-MM-dd");
 const existing = grouped.get(dateKey) || [];
 grouped.set(dateKey, [...existing, task]);
 }

 // Also add to start date if different from due date
 if (task.start_date && task.start_date !== task.due_date) {
 const dateKey = format(parseISO(task.start_date), "yyyy-MM-dd");
 const existing = grouped.get(dateKey) || [];
 grouped.set(dateKey, [...existing, task]);
 }
 });

 return grouped;
 }, [tasks]);

 // Navigate months
 const goToPreviousMonth = () => {
 setCurrentDate(subMonths(currentDate, 1));
 };

 const goToNextMonth = () => {
 setCurrentDate(addMonths(currentDate, 1));
 };

 const goToToday = () => {
 setCurrentDate(new Date());
 setSelectedDate(new Date());
 };

 // Get status color
 const getStatusColor = (status: string) => {
 switch (status) {
 case "done": return "bg-success";
 case "in_progress": return "bg-info";
 case "review": return "bg-warning";
 case "blocked": return "bg-destructive";
 default: return "bg-muted";
 }
 };

 // Get priority indicator
 const getPriorityIndicator = (priority: string) => {
 switch (priority) {
 case "critical": return "!";
 case "high": return "↑";
 case "low": return "↓";
 default: return "";
 }
 };

 // Render day cell
 const renderDayCell = (day: Date) => {
 const dateStr = format(day, "yyyy-MM-dd");
 const dayTasks = tasksByDate.get(dateStr) || [];
 const isCurrentMonth = isSameMonth(day, currentDate);
 const isTodayDate = isToday(day);
 const isSelected = selectedDate && isSameDay(day, selectedDate);

 // Group tasks by status for this day
 const tasksByStatus = dayTasks.reduce((acc, task) => {
 if (!acc[task.status]) acc[task.status] = 0;
 acc[task.status]++;
 return acc;
 }, {} as Record<string, number>);

 return (
 <div
 key={dateStr}
 onClick={() => setSelectedDate(day)}
 className={`
 min-h-header-md border p-xs cursor-pointer transition-all
 ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "hover:bg-muted/50"}
 ${isTodayDate ? "bg-primary/10 border-primary" : ""}
 ${isSelected ? "ring-2 ring-primary" : ""}
 `}
 >
 <div className="flex items-center justify-between mb-1">
 <span className={`text-sm font-medium ${isTodayDate ? "text-primary" : ""}`}>
 {format(day, "d")}
 </span>
 {dayTasks.length > 0 && (
 <Badge variant="secondary" className="text-xs px-xs">
 {dayTasks.length}
 </Badge>
 )}
 </div>

 {/* Task indicators */}
 {dayTasks.length > 0 && (
 <div className="space-y-xs">
 {/* Status summary */}
 <div className="flex gap-xs flex-wrap">
 {Object.entries(tasksByStatus).map(([status, count]) => (
 <div
 key={status}
 className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}
 title={`${count} ${status} task(s)`}
 />
 ))}
 </div>

 {/* Show first 2 tasks */}
 {dayTasks.slice(0, 2).map(task => (
 <div
 key={task.id}
 onClick={(e) => {
 e.stopPropagation();
 onViewTask(task);
 }}
 className="text-xs p-xs rounded bg-background hover:bg-accent transition-colors truncate"
 >
 <div className="flex items-center gap-xs">
 {getPriorityIndicator(task.priority) && (
 <span className={`font-bold ${
 task.priority === "critical" ? "text-destructive" :
 task.priority === "high" ? "text-warning" : ""
 }`}>
 {getPriorityIndicator(task.priority)}
 </span>
 )}
 <span className="truncate">{task.title}</span>
 </div>
 </div>
 ))}

 {dayTasks.length > 2 && (
 <div className="text-xs text-muted-foreground text-center">
 +{dayTasks.length - 2} more
 </div>
 )}
 </div>
 )}
 </div>
 );
 };

 // Get tasks for selected date
 const selectedDateTasks = useMemo(() => {
 if (!selectedDate) return [];
 const dateStr = format(selectedDate, "yyyy-MM-dd");
 return tasksByDate.get(dateStr) || [];
 }, [selectedDate, tasksByDate]);

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
 {/* Calendar */}
 <div className="lg:col-span-2">
 {/* Calendar Header */}
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-semibold">
 {format(currentDate, "MMMM yyyy")}
 </h2>
 <div className="flex items-center gap-xs">
 <Button
 variant="outline"
 size="sm"
 onClick={goToPreviousMonth}
 >
 <ChevronLeft className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={goToToday}
 >
 Today
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={goToNextMonth}
 >
 <ChevronRight className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 {/* Weekday headers */}
 <div className="grid grid-cols-7 gap-0 mb-2">
 {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
 <div key={day} className="text-center text-sm font-medium p-xs">
 {day}
 </div>
 ))}
 </div>

 {/* Calendar grid */}
 <div className="grid grid-cols-7 gap-0 border-t border-l">
 {calendarDays.map(day => renderDayCell(day))}
 </div>

 {/* Legend */}
 <div className="flex items-center gap-md mt-4 text-sm">
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 rounded-full bg-muted" />
 <span>To Do</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 rounded-full bg-info" />
 <span>In Progress</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 rounded-full bg-warning" />
 <span>Review</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 rounded-full bg-success" />
 <span>Done</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 rounded-full bg-destructive" />
 <span>Blocked</span>
 </div>
 </div>
 </div>

 {/* Selected Date Tasks */}
 <div className="lg:col-span-1">
 <Card className="p-md">
 <h3 className="font-semibold mb-4">
 {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
 </h3>

 {selectedDateTasks.length === 0 ? (
 <div className="text-center py-xl text-muted-foreground">
 <Calendar className="mx-auto h-icon-lg w-icon-lg mb-2" />
 <p className="text-sm">
 {selectedDate ? "No tasks for this date" : "Select a date to view tasks"}
 </p>
 </div>
 ) : (
 <div className="space-y-sm max-h-content-xl overflow-y-auto">
 {selectedDateTasks.map(task => (
 <Card
 key={task.id}
 className="p-sm cursor-pointer hover:shadow-md transition-shadow"
 onClick={() => onViewTask(task)}
 >
 <div className="space-y-xs">
 <div className="flex items-start justify-between">
 <h4 className="font-medium text-sm line-clamp-xs">{task.title}</h4>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEditTask(task);
 }}
 >
 Edit
 </Button>
 </div>

 <div className="flex items-center gap-xs">
 <Badge
 variant={
 task.status === "done" ? "success" :
 task.status === "in_progress" ? "warning" :
 task.status === "review" ? "info" :
 task.status === "blocked" ? "destructive" :
 "secondary"
 }
 className="text-xs"
 >
 {task.status.replace("_", " ")}
 </Badge>

 <Badge
 variant={
 task.priority === "critical" ? "destructive" :
 task.priority === "high" ? "warning" :
 task.priority === "medium" ? "secondary" :
 "outline"
 }
 className="text-xs"
 >
 {task.priority}
 </Badge>
 </div>

 {task.assignee && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Users className="h-3 w-3" />
 <span>{task.assignee.full_name || task.assignee.email}</span>
 </div>
 )}

 {task.tags && task.tags.length > 0 && (
 <div className="flex items-center gap-xs flex-wrap">
 <Tag className="h-3 w-3 text-muted-foreground" />
 {task.tags.map(tag => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 )}
 </div>
 </Card>
 ))}
 </div>
 )}
 </Card>
 </div>
 </div>
 );
}
