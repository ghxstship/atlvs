'use client';

import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle, Bell, Activity } from "lucide-react";
import { useState, useMemo } from 'react';
import { Card, Button, Badge } from '@ghxstship/ui';
import type { HealthRecord } from '../types';
import {
 RECORD_TYPE_LABELS,
 formatDateShort,
 getDaysUntilExpiry,
 getExpiryUrgency,
 getRecordTypeIcon
} from '../types';

interface HealthCalendarViewProps {
 records: HealthRecord[];
 loading: boolean;
 onEdit: (record: HealthRecord) => void;
}

export default function HealthCalendarView({
 records,
 loading,
 onEdit
}: HealthCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());

 const currentYear = currentDate.getFullYear();
 const currentMonth = currentDate.getMonth();

 // Get first day of month and number of days
 const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
 const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
 const daysInMonth = lastDayOfMonth.getDate();
 const startingDayOfWeek = firstDayOfMonth.getDay();

 // Generate calendar days
 const calendarDays = useMemo(() => {
 const days = [];
 
 // Add empty cells for days before the first day of the month
 for (let i = 0; i < startingDayOfWeek; i++) {
 days.push(null);
 }
 
 // Add days of the month
 for (let day = 1; day <= daysInMonth; day++) {
 days.push(day);
 }
 
 return days;
 // eslint-disable-next-line react-hooks/exhaustive-deps
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [currentYear, currentMonth, daysInMonth, startingDayOfWeek]);

 // Group records by date
 const recordsByDate = useMemo(() => {
 const grouped: Record<string, HealthRecord[]> = {};
 
 records.forEach(record => {
 // Add to recorded date
 const recordedDate = new Date(record.date_recorded);
 if (recordedDate.getFullYear() === currentYear && recordedDate.getMonth() === currentMonth) {
 const day = recordedDate.getDate();
 const key = `recorded-${day}`;
 if (!grouped[key]) grouped[key] = [];
 grouped[key].push(record);
 }
 
 // Add to expiry date if exists
 if (record.expiry_date) {
 const expiryDate = new Date(record.expiry_date);
 if (expiryDate.getFullYear() === currentYear && expiryDate.getMonth() === currentMonth) {
 const day = expiryDate.getDate();
 const key = `expiry-${day}`;
 if (!grouped[key]) grouped[key] = [];
 grouped[key].push(record);
 }
 }
 });
 
 return grouped;
 }, [records, currentYear, currentMonth]);

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

 const goToToday = () => {
 setCurrentDate(new Date());
 };

 const monthName = firstDayOfMonth.toLocaleDateString('en-US', { 
 month: 'long', 
 year: 'numeric' 
 });

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="space-y-md">
 <div className="h-icon-lg w-container-xs bg-muted animate-pulse rounded" />
 <div className="grid grid-cols-7 gap-xs">
 {[...Array(35)].map((_, i) => (
 <div key={i} className="h-component-lg bg-muted animate-pulse rounded" />
 ))}
 </div>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 {/* Header */}
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-md">
 <h2 className="text-xl font-semibold flex items-center gap-xs">
 <Calendar className="h-icon-sm w-icon-sm" />
 {monthName}
 </h2>
 <Button variant="outline" size="sm" onClick={goToToday}>
 Today
 </Button>
 </div>
 <div className="flex items-center gap-xs">
 <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
 <ChevronLeft className="h-icon-xs w-icon-xs" />
 </Button>
 <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
 <ChevronRight className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 </Card>

 {/* Legend */}
 <Card className="p-md">
 <div className="flex items-center gap-lg text-sm">
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 bg-blue-500 rounded-full" />
 <span>Recorded</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 bg-orange-500 rounded-full" />
 <span>Expires</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 bg-red-500 rounded-full" />
 <span>Expired</span>
 </div>
 <div className="flex items-center gap-xs">
 <Bell className="h-3 w-3" />
 <span>Reminder</span>
 </div>
 </div>
 </Card>

 {/* Calendar */}
 <Card className="p-md">
 <div className="space-y-md">
 {/* Day headers */}
 <div className="grid grid-cols-7 gap-xs">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
 <div key={day} className="p-xs text-center font-medium text-muted-foreground">
 {day}
 </div>
 ))}
 </div>

 {/* Calendar grid */}
 <div className="grid grid-cols-7 gap-xs">
 {calendarDays.map((day, index) => {
 if (day === null) {
 return <div key={index} className="h-component-lg" />;
 }

 const recordedRecords = recordsByDate[`recorded-${day}`] || [];
 const expiryRecords = recordsByDate[`expiry-${day}`] || [];
 const allDayRecords = [...recordedRecords, ...expiryRecords];
 
 const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
 
 return (
 <div
 key={day}
 className={`h-component-lg p-xs border rounded-lg ${
 isToday ? 'bg-primary/10 border-primary' : 'border-border'
 } ${allDayRecords.length > 0 ? 'hover:bg-muted/50' : ''}`}
 >
 <div className="h-full flex flex-col">
 <div className="flex items-center justify-between mb-1">
 <span className={`text-sm font-medium ${
 isToday ? 'text-primary' : 'text-foreground'
 }`}>
 {day}
 </span>
 {allDayRecords.some(r => r.reminder_enabled) && (
 <Bell className="h-3 w-3 text-muted-foreground" />
 )}
 </div>
 
 <div className="flex-1 space-y-xs overflow-hidden">
 {/* Recorded events */}
 {recordedRecords.slice(0, 2).map((record, i) => (
 <button
 key={`recorded-${record.id}-${i}`}
 onClick={() => onEdit(record)}
 className="w-full text-left"
 >
 <div className="flex items-center gap-xs p-xs bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 transition-colors">
 <span>{getRecordTypeIcon(record.record_type)}</span>
 <span className="truncate">{record.title}</span>
 </div>
 </button>
 ))}
 
 {/* Expiry events */}
 {expiryRecords.slice(0, 2 - recordedRecords.length).map((record, i) => {
 const daysUntilExpiry = getDaysUntilExpiry(record.expiry_date!);
 const isExpired = daysUntilExpiry < 0;
 const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
 
 return (
 <button
 key={`expiry-${record.id}-${i}`}
 onClick={() => onEdit(record)}
 className="w-full text-left"
 >
 <div className={`flex items-center gap-xs p-xs rounded text-xs hover:opacity-80 transition-colors ${
 isExpired 
 ? 'bg-red-100 text-red-800' 
 : isExpiringSoon 
 ? 'bg-orange-100 text-orange-800'
 : 'bg-yellow-100 text-yellow-800'
 }`}>
 {isExpired ? (
 <AlertTriangle className="h-3 w-3" />
 ) : (
 <Clock className="h-3 w-3" />
 )}
 <span className="truncate">{record.title}</span>
 </div>
 </button>
 );
 })}
 
 {/* Show more indicator */}
 {allDayRecords.length > 2 && (
 <div className="text-xs text-muted-foreground text-center">
 +{allDayRecords.length - 2} more
 </div>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </Card>

 {/* Upcoming Events */}
 {records.length > 0 && (
 <Card className="p-md">
 <h3 className="font-semibold mb-4 flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 Upcoming Events
 </h3>
 <div className="space-y-xs">
 {records
 .filter(record => {
 if (!record.expiry_date) return false;
 const daysUntil = getDaysUntilExpiry(record.expiry_date);
 return daysUntil >= 0 && daysUntil <= 30;
 })
 .sort((a, b) => getDaysUntilExpiry(a.expiry_date!) - getDaysUntilExpiry(b.expiry_date!))
 .slice(0, 5)
 .map(record => {
 const daysUntil = getDaysUntilExpiry(record.expiry_date!);
 const urgency = getExpiryUrgency(daysUntil);
 
 return (
 <button
 key={record.id}
 onClick={() => onEdit(record)}
 className="w-full text-left p-sm border rounded-lg hover:bg-muted/50 transition-colors"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <span className="text-lg">{getRecordTypeIcon(record.record_type)}</span>
 <div>
 <p className="font-medium">{record.title}</p>
 <p className="text-sm text-muted-foreground">
 {RECORD_TYPE_LABELS[record.record_type]}
 {record.provider && ` • ${record.provider}`}
 </p>
 </div>
 </div>
 <div className="text-right">
 <Badge 
 variant={urgency === 'critical' ? 'destructive' : 'outline'}
 className="mb-1"
 >
 {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
 </Badge>
 <p className="text-xs text-muted-foreground">
 {formatDateShort(record.expiry_date!)}
 </p>
 </div>
 </div>
 </button>
 );
 })}
 
 {records.filter(r => r.expiry_date && getDaysUntilExpiry(r.expiry_date) >= 0 && getDaysUntilExpiry(r.expiry_date) <= 30).length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 <Activity className="h-icon-lg w-icon-lg mx-auto mb-2 opacity-50" />
 <p>No upcoming events in the next 30 days</p>
 </div>
 )}
 </div>
 </Card>
 )}
 </div>
 );
}
