'use client';

import { ChevronLeft, ChevronRight, Calendar, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useState, useMemo } from 'react';
import { 
 Card, 
 Badge, 
 Button
} from '@ghxstship/ui';
import type { ProcurementRequest } from '../types';

interface RequestCalendarViewProps {
 requests: ProcurementRequest[];
 onViewRequest: (request: ProcurementRequest) => void;
 loading?: boolean;
}

export default function RequestCalendarView({
 requests,
 onViewRequest,
 loading = false
}: RequestCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());

 const { calendarData, monthRequests } = useMemo(() => {
 const year = currentDate.getFullYear();
 const month = currentDate.getMonth();
 
 // Get first day of month and number of days
 const firstDay = new Date(year, month, 1);
 const lastDay = new Date(year, month + 1, 0);
 const daysInMonth = lastDay.getDate();
 const startingDayOfWeek = firstDay.getDay();

 // Create calendar grid
 const calendarDays = [];
 
 // Add empty cells for days before month starts
 for (let i = 0; i < startingDayOfWeek; i++) {
 calendarDays.push(null);
 }
 
 // Add days of the month
 for (let day = 1; day <= daysInMonth; day++) {
 calendarDays.push(day);
 }

 // Filter requests for current month
 const monthRequests = requests.filter(request => {
 if (!request.requested_delivery_date) return false;
 const requestDate = new Date(request.requested_delivery_date);
 return requestDate.getFullYear() === year && requestDate.getMonth() === month;
 });

 // Group requests by day
 const requestsByDay = monthRequests.reduce((acc, request) => {
 if (!request.requested_delivery_date) return acc;
 const day = new Date(request.requested_delivery_date).getDate();
 if (!acc[day]) acc[day] = [];
 acc[day].push(request);
 return acc;
 }, {} as Record<number, ProcurementRequest[]>);

 return {
 calendarData: {
 year,
 month,
 daysInMonth,
 calendarDays,
 requestsByDay
 },
 monthRequests
 };
 }, [currentDate, requests]);

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'approved':
 return <CheckCircle className="h-3 w-3 text-success" />;
 case 'rejected':
 return <XCircle className="h-3 w-3 text-destructive" />;
 case 'under_review':
 return <Clock className="h-3 w-3 text-warning" />;
 case 'submitted':
 return <AlertTriangle className="h-3 w-3 text-info" />;
 default:
 return <Clock className="h-3 w-3 text-muted-foreground" />;
 }
 };

 const getStatusVariant = (status: string) => {
 switch (status) {
 case 'approved':
 return 'success';
 case 'rejected':
 return 'destructive';
 case 'under_review':
 return 'warning';
 case 'submitted':
 return 'info';
 default:
 return 'secondary';
 }
 };

 const navigateMonth = (direction: 'prev' | 'next') => {
 setCurrentDate(prev => {
 const newDate = new Date(prev);
 if (direction === 'prev') {
 newDate.setMonth(prev.getMonth() - 1);
 } else {
 newDate.setMonth(prev.getMonth() + 1);
 }
 return newDate;
 });
 };

 const monthNames = [
 'January', 'February', 'March', 'April', 'May', 'June',
 'July', 'August', 'September', 'October', 'November', 'December'
 ];

 const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

 if (loading) {
 return (
 <div className="space-y-md">
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <div className="h-icon-md bg-muted rounded w-component-xl animate-pulse" />
 <div className="flex gap-sm">
 <div className="h-icon-lg w-icon-lg bg-muted rounded animate-pulse" />
 <div className="h-icon-lg w-icon-lg bg-muted rounded animate-pulse" />
 </div>
 </div>
 <div className="grid grid-cols-7 gap-sm">
 {Array.from({ length: 35 }).map((_, i) => (
 <div key={i} className="h-component-lg bg-muted rounded animate-pulse" />
 ))}
 </div>
 </Card>
 </div>
 );
 }

 return (
 <div className="space-y-md">
 {/* Calendar Header */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h2 className="text-xl font-semibold">
 {monthNames[calendarData.month]} {calendarData.year}
 </h2>
 <div className="flex gap-sm">
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
 onClick={() => setCurrentDate(new Date())}
 >
 Today
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

 {/* Day Headers */}
 <div className="grid grid-cols-7 gap-sm mb-sm">
 {dayNames.map(day => (
 <div key={day} className="text-center text-sm font-medium text-muted-foreground p-sm">
 {day}
 </div>
 ))}
 </div>

 {/* Calendar Grid */}
 <div className="grid grid-cols-7 gap-sm">
 {calendarData.calendarDays.map((day, index) => {
 const dayRequests = day ? calendarData.requestsByDay[day] || [] : [];
 const isToday = day && 
 new Date().getDate() === day && 
 new Date().getMonth() === calendarData.month && 
 new Date().getFullYear() === calendarData.year;

 return (
 <div
 key={index}
 className={`min-h-header-md p-xs border rounded-md ${
 day ? 'bg-background hover:bg-muted/50' : 'bg-muted/20'
 } ${isToday ? 'ring-2 ring-primary' : ''}`}
 >
 {day && (
 <>
 <div className={`text-sm font-medium mb-xs ${
 isToday ? 'text-primary' : 'text-foreground'
 }`}>
 {day}
 </div>
 <div className="space-y-xs">
 {dayRequests.slice(0, 3).map((request) => (
 <div
 key={request.id}
 className="text-xs p-xs rounded bg-muted cursor-pointer hover:bg-muted/80"
 onClick={() => onViewRequest(request)}
 >
 <div className="flex items-center gap-xs">
 {getStatusIcon(request.status)}
 <span className="truncate flex-1">{request.title}</span>
 </div>
 <div className="text-xs text-muted-foreground mt-xs">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: request.currency || 'USD',
 notation: 'compact'
 }).format(request.estimated_total)}
 </div>
 </div>
 ))}
 {dayRequests.length > 3 && (
 <div className="text-xs text-muted-foreground text-center">
 +{dayRequests.length - 3} more
 </div>
 )}
 </div>
 </>
 )}
 </div>
 );
 })}
 </div>
 </Card>

 {/* Month Summary */}
 <Card className="p-md">
 <div className="flex items-center gap-sm mb-md">
 <Calendar className="h-icon-sm w-icon-sm" />
 <h3 className="text-lg font-semibold">
 {monthNames[calendarData.month]} Summary
 </h3>
 </div>
 
 {monthRequests.length === 0 ? (
 <div className="text-center py-lg">
 <Calendar className="h-icon-2xl w-icon-2xl mx-auto mb-md text-muted-foreground" />
 <p className="text-sm text-muted-foreground">
 No requests scheduled for {monthNames[calendarData.month]}
 </p>
 </div>
 ) : (
 <div className="space-y-sm">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-md">
 <div className="text-center">
 <div className="text-2xl font-bold">{monthRequests.length}</div>
 <div className="text-sm text-muted-foreground">Total Requests</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold">
 {monthRequests.filter(r => r.status === 'approved').length}
 </div>
 <div className="text-sm text-muted-foreground">Approved</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold">
 {monthRequests.filter(r => r.status === 'under_review' || r.status === 'submitted').length}
 </div>
 <div className="text-sm text-muted-foreground">Pending</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold">
 {new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 notation: 'compact'
 }).format(monthRequests.reduce((sum, r) => sum + r.estimated_total, 0))}
 </div>
 <div className="text-sm text-muted-foreground">Total Value</div>
 </div>
 </div>

 <div className="space-y-sm">
 {monthRequests.slice(0, 5).map((request) => (
 <div key={request.id} className="flex items-center justify-between p-sm rounded-md hover:bg-muted/50">
 <div className="flex items-center gap-sm flex-1">
 {getStatusIcon(request.status)}
 <span className="font-medium text-sm">{request.title}</span>
 <Badge variant={getStatusVariant(request.status) as unknown} size="sm">
 {request.status.replace('_', ' ')}
 </Badge>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm text-muted-foreground">
 {new Date(request.requested_delivery_date!).toLocaleDateString()}
 </span>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onViewRequest(request)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 ))}
 {monthRequests.length > 5 && (
 <div className="text-center text-sm text-muted-foreground">
 +{monthRequests.length - 5} more requests this month
 </div>
 )}
 </div>
 </div>
 )}
 </Card>
 </div>
 );
}
