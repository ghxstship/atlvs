"use client";

import { ChevronLeft, ChevronRight, Calendar, DollarSign } from "lucide-react";
import React from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import type { Project } from '../types';

interface ProjectCalendarViewProps {
 projects: Project[];
 onView: (project: Project) => void;
 onEdit: (project: Project) => void;
}

const statusColors = {
 planning: 'blue',
 active: 'green',
 on_hold: 'yellow',
 completed: 'gray',
 cancelled: 'red'
} as const;

export default function ProjectCalendarView({
 projects,
 onView,
 onEdit
}: ProjectCalendarViewProps) {
 const [currentDate, setCurrentDate] = React.useState(new Date());

 const monthStart = startOfMonth(currentDate);
 const monthEnd = endOfMonth(currentDate);
 const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

 // Group projects by date
 const projectsByDate = React.useMemo(() => {
 const grouped: Record<string, Project[]> = {};
 
 projects.forEach((project) => {
 // Add projects that start in this month
 if (project.starts_at) {
 const startDate = parseISO(project.starts_at);
 if (isSameMonth(startDate, currentDate)) {
 const dateKey = format(startDate, 'yyyy-MM-dd');
 if (!grouped[dateKey]) grouped[dateKey] = [];
 grouped[dateKey].push({ ...project, eventType: 'start' });
 }
 }

 // Add projects that end in this month
 if (project.ends_at) {
 const endDate = parseISO(project.ends_at);
 if (isSameMonth(endDate, currentDate)) {
 const dateKey = format(endDate, 'yyyy-MM-dd');
 if (!grouped[dateKey]) grouped[dateKey] = [];
 grouped[dateKey].push({ ...project, eventType: 'end' });
 }
 }
 });

 return grouped;
 }, [projects, currentDate]);

 const navigateMonth = (direction: 'prev' | 'next') => {
 setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
 };

 return (
 <div className="space-y-md">
 {/* Calendar Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-md">
 <h2 className="text-lg font-semibold">
 {format(currentDate, 'MMMM yyyy')}
 </h2>
 <div className="flex items-center gap-xs">
 <Button
 variant="outline"
 size="sm"
 onClick={() => navigateMonth('prev')}
 className="h-icon-lg w-icon-lg p-0"
 >
 <ChevronLeft className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setCurrentDate(new Date())}
 className="h-icon-lg px-sm"
 >
 Today
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => navigateMonth('next')}
 className="h-icon-lg w-icon-lg p-0"
 >
 <ChevronRight className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 {/* Legend */}
 <div className="flex items-center gap-md text-xs">
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 rounded bg-green-500" />
 <span>Start Date</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 rounded bg-red-500" />
 <span>End Date</span>
 </div>
 </div>
 </div>

 {/* Calendar Grid */}
 <Card className="p-md">
 {/* Day Headers */}
 <div className="grid grid-cols-7 gap-px mb-md">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
 <div key={day} className="p-sm text-center text-sm font-medium text-muted-foreground">
 {day}
 </div>
 ))}
 </div>

 {/* Calendar Days */}
 <div className="grid grid-cols-7 gap-px">
 {days.map((day) => {
 const dateKey = format(day, 'yyyy-MM-dd');
 const dayProjects = projectsByDate[dateKey] || [];
 const isCurrentMonth = isSameMonth(day, currentDate);
 const isDayToday = isToday(day);

 return (
 <div
 key={dateKey}
 className={`min-h-header-lg p-xs border rounded-sm ${
 isCurrentMonth ? 'bg-background' : 'bg-muted/30'
 } ${isDayToday ? 'ring-2 ring-primary' : ''}`}
 >
 {/* Day Number */}
 <div className="flex items-center justify-between mb-xs">
 <span className={`text-sm font-medium ${
 isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
 } ${isDayToday ? 'text-primary font-bold' : ''}`}>
 {format(day, 'd')}
 </span>
 {dayProjects.length > 0 && (
 <Badge variant="secondary" className="text-xs h-icon-xs px-xs">
 {dayProjects.length}
 </Badge>
 )}
 </div>

 {/* Projects */}
 <div className="space-y-xs">
 {dayProjects.slice(0, 3).map((project, index) => (
 <div
 key={`${project.id}-${project.eventType}-${index}`}
 className={`text-xs p-xs rounded cursor-pointer transition-colors hover:opacity-80 ${
 project.eventType === 'start' 
 ? 'bg-green-100 text-green-800 border-l-2 border-green-500' 
 : 'bg-red-100 text-red-800 border-l-2 border-red-500'
 }`}
 onClick={() => onView(project)}
 title={`${project.name} - ${project.eventType === 'start' ? 'Starts' : 'Ends'}`}
 >
 <div className="flex items-center gap-xs">
 <div className={`w-2 h-2 rounded-full ${
 project.eventType === 'start' ? 'bg-green-500' : 'bg-red-500'
 }`} />
 <span className="truncate font-medium">
 {project.name}
 </span>
 </div>
 
 <div className="flex items-center gap-xs mt-xs opacity-75">
 <Badge 
 variant="outline" 
 className={`text-xs h-icon-xs px-xs bg-${statusColors[project.status]}-50 text-${statusColors[project.status]}-700 border-${statusColors[project.status]}-200`}
 >
 {project.status}
 </Badge>
 {project.budget && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-2 w-2" />
 <span className="text-xs">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: project.currency || 'USD',
 notation: 'compact'
 }).format(project.budget)}
 </span>
 </div>
 )}
 </div>
 </div>
 ))}

 {/* Show more indicator */}
 {dayProjects.length > 3 && (
 <div className="text-xs text-muted-foreground text-center py-xs">
 +{dayProjects.length - 3} more
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Project Summary */}
 <Card className="p-md">
 <h3 className="font-semibold mb-sm">
 Projects in {format(currentDate, 'MMMM yyyy')}
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {Object.entries(projectsByDate).map(([date, dayProjects]) => (
 <div key={date} className="space-y-xs">
 <h4 className="font-medium text-sm">
 {format(parseISO(date), 'MMM dd, yyyy')}
 </h4>
 <div className="space-y-xs">
 {dayProjects.map((project, index) => (
 <div
 key={`${project.id}-${project.eventType}-${index}`}
 className="flex items-center justify-between p-xs rounded bg-muted/50"
 >
 <div className="flex items-center gap-xs">
 <div className={`w-2 h-2 rounded-full ${
 project.eventType === 'start' ? 'bg-green-500' : 'bg-red-500'
 }`} />
 <span className="text-sm font-medium">{project.name}</span>
 <Badge variant="outline" className="text-xs">
 {project.eventType === 'start' ? 'Start' : 'End'}
 </Badge>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(project)}
 className="h-icon-md px-sm text-xs"
 >
 View
 </Button>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>

 {Object.keys(projectsByDate).length === 0 && (
 <div className="text-center py-lg text-muted-foreground">
 <Calendar className="h-icon-2xl w-icon-2xl mx-auto mb-md opacity-50" />
 <p className="text-sm">No projects scheduled for this month</p>
 </div>
 )}
 </Card>
 </div>
 );
}
