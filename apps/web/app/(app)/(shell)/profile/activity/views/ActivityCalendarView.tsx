'use client';

import { ChevronLeft, ChevronRight, Calendar, Clock, User } from "lucide-react";
import { useMemo, useState } from 'react';
import { Badge, Button, Card, Skeleton } from '@ghxstship/ui';
import type { ActivityRecord } from '../types';
import { ACTIVITY_TYPE_CONFIG } from '../types';

interface ActivityCalendarViewProps {
 activities: ActivityRecord[];
 loading: boolean;
}

export default function ActivityCalendarView({
 activities,
 loading,
}: ActivityCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());

 const { calendarData, monthActivities } = useMemo(() => {
 const year = currentDate.getFullYear();
 const month = currentDate.getMonth();
 
 // Get first day of month and last day
 const firstDay = new Date(year, month, 1);
 const lastDay = new Date(year, month + 1, 0);
 
 // Get first day of calendar (might be from previous month)
 const startDate = new Date(firstDay);
 startDate.setDate(startDate.getDate() - firstDay.getDay());
 
 // Get last day of calendar (might be from next month)
 const endDate = new Date(lastDay);
 endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
 
 // Generate calendar days
 const days = [];
 const current = new Date(startDate);
 
 while (current <= endDate) {
 days.push(new Date(current));
 current.setDate(current.getDate() + 1);
 }
 
 // Group activities by date
 const activitiesByDate: Record<string, ActivityRecord[]> = {};
 activities.forEach(activity => {
 const activityDate = new Date(activity.created_at);
 if (activityDate.getFullYear() === year && activityDate.getMonth() === month) {
 const dateKey = activityDate.toISOString().split('T')[0];
 if (!activitiesByDate[dateKey]) {
 activitiesByDate[dateKey] = [];
 }
 activitiesByDate[dateKey].push(activity);
 }
 });
 
 // Filter activities for current month
 const monthActivities = activities.filter(activity => {
 const activityDate = new Date(activity.created_at);
 return activityDate.getFullYear() === year && activityDate.getMonth() === month;
 });
 
 return {
 calendarData: {
 days,
 activitiesByDate,
 currentMonth: month,
 currentYear: year,
 },
 monthActivities,
 };
 }, [activities, currentDate]);

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

 if (loading) {
 return (
 <div className="space-y-lg">
 <Card className="p-lg">
 <Skeleton className="h-icon-lg w-container-xs mb-4" />
 <div className="grid grid-cols-7 gap-xs">
 {Array.from({ length: 42 }).map((_, i) => (
 <Skeleton key={i} className="h-component-md w-full" />
 ))}
 </div>
 </Card>
 </div>
 );
 }

 const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 const monthNames = [
 'January', 'February', 'March', 'April', 'May', 'June',
 'July', 'August', 'September', 'October', 'November', 'December'
 ];

 return (
 <div className="space-y-lg">
 {/* Calendar Header */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-md">
 <h2 className="text-2xl font-bold">
 {monthNames[calendarData.currentMonth]} {calendarData.currentYear}
 </h2>
 <Badge variant="secondary">
 {monthActivities.length} {monthActivities.length === 1 ? 'activity' : 'activities'}
 </Badge>
 </div>
 
 <div className="flex items-center gap-xs">
 <Button variant="outline" size="sm" onClick={goToToday}>
 Today
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => navigateMonth('prev')}
 >
 <ChevronLeft className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => navigateMonth('next')}
 >
 <ChevronRight className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>

 {/* Calendar Grid */}
 <div className="space-y-xs">
 {/* Week day headers */}
 <div className="grid grid-cols-7 gap-xs">
 {weekDays.map(day => (
 <div key={day} className="p-xs text-center text-sm font-medium text-muted-foreground">
 {day}
 </div>
 ))}
 </div>
 
 {/* Calendar days */}
 <div className="grid grid-cols-7 gap-xs">
 {calendarData.days.map((day, index) => {
 const dateKey = day.toISOString().split('T')[0];
 const dayActivities = calendarData.activitiesByDate[dateKey] || [];
 const isCurrentMonth = day.getMonth() === calendarData.currentMonth;
 const isToday = day.toDateString() === new Date().toDateString();
 
 return (
 <div
 key={index}
 className={`
 min-h-header-sm p-xs border rounded-lg transition-colors
 ${isCurrentMonth ? 'bg-background' : 'bg-muted/50'}
 ${isToday ? 'ring-2 ring-primary' : ''}
 ${dayActivities.length > 0 ? 'border-primary/50' : 'border-border'}
 `}
 >
 <div className="flex items-center justify-between mb-1">
 <span className={`text-sm ${
 isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
 } ${isToday ? 'font-bold' : ''}`}>
 {day.getDate()}
 </span>
 {dayActivities.length > 0 && (
 <Badge variant="secondary" className="text-xs h-icon-xs px-xs">
 {dayActivities.length}
 </Badge>
 )}
 </div>
 
 <div className="space-y-xs">
 {dayActivities.slice(0, 2).map(activity => {
 const config = ACTIVITY_TYPE_CONFIG[activity.activity_type] || ACTIVITY_TYPE_CONFIG.profile_updated;
 return (
 <div
 key={activity.id}
 className={`text-xs p-xs rounded truncate ${config.color}`}
 title={activity.activity_description}
 >
 {config.label}
 </div>
 );
 })}
 {dayActivities.length > 2 && (
 <div className="text-xs text-muted-foreground">
 +{dayActivities.length - 2} more
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </Card>

 {/* Month Summary */}
 {monthActivities.length > 0 && (
 <Card className="p-lg">
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm" />
 Month Summary
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-6">
 {Object.entries(
 monthActivities.reduce((acc, activity) => {
 const config = ACTIVITY_TYPE_CONFIG[activity.activity_type] || ACTIVITY_TYPE_CONFIG.profile_updated;
 acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
 return acc;
 }, {} as Record<string, number>)
 ).map(([type, count]) => {
 const config = ACTIVITY_TYPE_CONFIG[type as keyof typeof ACTIVITY_TYPE_CONFIG] || ACTIVITY_TYPE_CONFIG.profile_updated;
 return (
 <div key={type} className="text-center p-sm rounded-lg bg-muted/50">
 <div className={`inline-flex p-xs rounded-full mb-2 ${config.color}`}>
 <User className="h-icon-xs w-icon-xs" />
 </div>
 <div className="text-2xl font-bold">{count}</div>
 <div className="text-sm text-muted-foreground">{config.label}</div>
 </div>
 );
 })}
 </div>

 {/* Recent activities for the month */}
 <div>
 <h4 className="font-medium mb-3">Recent Activities This Month</h4>
 <div className="space-y-xs">
 {monthActivities.slice(0, 5).map(activity => {
 const config = ACTIVITY_TYPE_CONFIG[activity.activity_type] || ACTIVITY_TYPE_CONFIG.profile_updated;
 return (
 <div key={activity.id} className="flex items-center gap-sm p-xs rounded-lg bg-muted/50">
 <div className={`p-xs rounded ${config.color}`}>
 <User className="h-3 w-3" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-sm font-medium truncate">
 {activity.activity_description}
 </div>
 <div className="text-xs text-muted-foreground">
 {new Date(activity.created_at).toLocaleDateString()}
 </div>
 </div>
 <Badge variant="outline" className="text-xs">
 {config.label}
 </Badge>
 </div>
 );
 })}
 </div>
 </div>
 </Card>
 )}
 </div>
 );
}
