'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Plane, Edit, Eye, DollarSign, CalendarIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { 
 Card, 
 Badge, 
 Button, 
 Avatar
} from '@ghxstship/ui';
import type { TravelRecord } from '../types';
import { TRAVEL_STATUS_LABELS, TRAVEL_TYPE_LABELS } from '../types';

interface TravelCalendarViewProps {
 records: TravelRecord[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onView: (record: TravelRecord) => void;
 onEdit: (record: TravelRecord) => void;
 onDelete: (record: TravelRecord) => void;
 loading: boolean;
}

export default function TravelCalendarView({
 records,
 selectedIds,
 onSelectItem,
 onView,
 onEdit,
 onDelete,
 loading
}: TravelCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [selectedDate, setSelectedDate] = useState<Date | null>(null);

 // Group records by start date
 const recordsByDate = useMemo(() => {
 const grouped: Record<string, TravelRecord[]> = {};
 
 records.forEach(record => {
 const startDate = new Date(record.start_date);
 const endDate = new Date(record.end_date);
 
 // Add record to all dates in the travel period
 const current = new Date(startDate);
 while (current <= endDate) {
 const dateKey = current.toISOString().split('T')[0];
 
 if (!grouped[dateKey]) {
 grouped[dateKey] = [];
 }
 grouped[dateKey].push(record);
 current.setDate(current.getDate() + 1);
 }
 });
 
 return grouped;
 }, [records]);

 // Get calendar days for current month
 const calendarDays = useMemo(() => {
 const year = currentDate.getFullYear();
 const month = currentDate.getMonth();
 
 const firstDay = new Date(year, month, 1);
 const lastDay = new Date(year, month + 1, 0);
 const startDate = new Date(firstDay);
 startDate.setDate(startDate.getDate() - firstDay.getDay());
 
 const days: Date[] = [];
 const current = new Date(startDate);
 
 while (current <= lastDay || current.getDay() !== 0) {
 days.push(new Date(current));
 current.setDate(current.getDate() + 1);
 }
 
 return days;
 }, [currentDate]);

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

 const isToday = (date: Date) => {
 const today = new Date();
 return date.toDateString() === today.toDateString();
 };

 const isCurrentMonth = (date: Date) => {
 return date.getMonth() === currentDate.getMonth();
 };

 const isSelected = (date: Date) => {
 return selectedDate?.toDateString() === date.toDateString();
 };

 const getDayRecords = (date: Date) => {
 const dateKey = date.toISOString().split('T')[0];
 return recordsByDate[dateKey] || [];
 };

 const getTravelStatus = (record: TravelRecord, date: Date) => {
 const startDate = new Date(record.start_date);
 const endDate = new Date(record.end_date);
 const currentDate = date;
 
 if (currentDate.toDateString() === startDate.toDateString()) {
 return 'start';
 } else if (currentDate.toDateString() === endDate.toDateString()) {
 return 'end';
 } else if (currentDate > startDate && currentDate < endDate) {
 return 'ongoing';
 }
 return 'single';
 };

 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="animate-pulse">
 <div className="h-icon-2xl bg-muted rounded mb-lg"></div>
 <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
 {[...Array(42)].map((_, i) => (
 <div key={i} className="h-component-lg bg-background"></div>
 ))}
 </div>
 </div>
 </div>
 );
 }

 const selectedDayRecords = selectedDate ? getDayRecords(selectedDate) : [];

 return (
 <div className="space-y-lg">
 {/* Calendar Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-md">
 <h2 className="text-xl font-semibold">
 {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
 </h2>
 <Badge variant="outline">
 {records.length} total trips
 </Badge>
 </div>
 
 <div className="flex items-center space-x-sm">
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

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
 {/* Calendar Grid */}
 <div className="lg:col-span-3">
 <Card className="overflow-hidden">
 {/* Day Headers */}
 <div className="grid grid-cols-7 bg-muted">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
 <div key={day} className="p-sm text-center text-sm font-medium border-r border-border last:border-r-0">
 {day}
 </div>
 ))}
 </div>
 
 {/* Calendar Days */}
 <div className="grid grid-cols-7 gap-px bg-muted">
 {calendarDays.map((date, index) => {
 const dayRecords = getDayRecords(date);
 const hasEvents = dayRecords.length > 0;
 
 return (
 <div
 key={index}
 className={`
 h-component-lg bg-background p-xs cursor-pointer transition-colors hover:bg-muted/50
 ${!isCurrentMonth(date) ? 'text-muted-foreground bg-muted/20' : ''}
 ${isToday(date) ? 'bg-primary/10 border-2 border-primary' : ''}
 ${isSelected(date) ? 'bg-accent' : ''}
 `}
 onClick={() => setSelectedDate(date)}
 >
 <div className="flex items-center justify-between mb-xs">
 <span className={`text-sm ${isToday(date) ? 'font-bold' : ''}`}>
 {date.getDate()}
 </span>
 {hasEvents && (
 <Badge variant="secondary" className="text-xs h-icon-xs px-xs">
 {dayRecords.length}
 </Badge>
 )}
 </div>
 
 {/* Event indicators */}
 <div className="space-y-px">
 {dayRecords.slice(0, 2).map((record, idx) => {
 const status = getTravelStatus(record, date);
 return (
 <div
 key={idx}
 className={`text-xs p-px rounded truncate ${
 record.status === 'confirmed' ? 'bg-green-100 text-green-800' :
 record.status === 'planned' ? 'bg-blue-100 text-blue-800' :
 record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
 record.status === 'completed' ? 'bg-gray-100 text-gray-800' :
 'bg-red-100 text-red-800'
 }`}
 >
 {status === 'start' && '✈️ '}
 {status === 'end' && '🏠 '}
 {status === 'ongoing' && '📍 '}
 {record.destination}
 </div>
 );
 })}
 {dayRecords.length > 2 && (
 <div className="text-xs text-muted-foreground">
 +{dayRecords.length - 2} more
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Selected Date Details */}
 <div className="lg:col-span-1">
 <Card className="p-lg">
 <div className="flex items-center space-x-sm mb-md">
 <CalendarIcon className="h-icon-sm w-icon-sm text-primary" />
 <h3 className="font-semibold">
 {selectedDate 
 ? selectedDate.toLocaleDateString('en-US', { 
 weekday: 'long', 
 month: 'short', 
 day: 'numeric' 
 })
 : 'Select a date'
 }
 </h3>
 </div>

 {selectedDate && selectedDayRecords.length > 0 ? (
 <div className="space-y-sm">
 <p className="text-sm text-muted-foreground mb-sm">
 {selectedDayRecords.length} trip{selectedDayRecords.length !== 1 ? 's' : ''} on this date
 </p>
 
 {selectedDayRecords.map((record) => {
 const isItemSelected = selectedIds.includes(record.id);
 const status = getTravelStatus(record, selectedDate);

 return (
 <Card 
 key={record.id}
 className={`p-sm cursor-pointer transition-all hover:shadow-sm ${
 isItemSelected ? 'ring-2 ring-primary' : ''
 }`}
 onClick={() => {
 onSelectItem(record.id, !isItemSelected);
 }}
 >
 <div className="flex items-center space-x-sm mb-sm">
 <div className={`h-icon-md w-icon-md rounded-full flex items-center justify-center ${
 record.status === 'confirmed' ? 'bg-green-100 text-green-600' :
 record.status === 'planned' ? 'bg-blue-100 text-blue-600' :
 record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
 'bg-gray-100 text-gray-600'
 }`}>
 <MapPin className="h-3 w-3" />
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-medium truncate">
 {record.destination}
 </h4>
 <p className="text-xs text-muted-foreground truncate">
 {record.country}
 </p>
 </div>
 </div>

 <div className="space-y-xs mb-sm">
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Status</span>
 <div className="flex items-center space-x-xs">
 {status === 'start' && <span className="text-xs">✈️ Departure</span>}
 {status === 'end' && <span className="text-xs">🏠 Return</span>}
 {status === 'ongoing' && <span className="text-xs">📍 Traveling</span>}
 <Badge 
 variant={
 record.status === 'confirmed' ? 'default' :
 record.status === 'planned' ? 'secondary' :
 'outline'
 }
 className="text-xs"
 >
 {TRAVEL_STATUS_LABELS[record.status]}
 </Badge>
 </div>
 </div>
 
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Type</span>
 <Badge variant="outline" className="text-xs">
 {TRAVEL_TYPE_LABELS[record.travel_type]}
 </Badge>
 </div>
 
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Duration</span>
 <span className="text-xs">{record.duration_days} days</span>
 </div>

 {record.expenses && (
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Cost</span>
 <span className="text-xs">{record.currency} {record.expenses.toLocaleString()}</span>
 </div>
 )}

 {record.visa_required && (
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Visa</span>
 <Badge 
 variant={
 record.visa_status === 'approved' ? 'default' :
 record.visa_status === 'pending' ? 'secondary' :
 'outline'
 }
 className="text-xs"
 >
 {record.visa_status || 'Not Applied'}
 </Badge>
 </div>
 )}
 </div>

 {record.purpose && (
 <div className="mb-sm">
 <p className="text-xs text-muted-foreground">
 <strong>Purpose:</strong> {record.purpose}
 </p>
 </div>
 )}

 <div className="flex items-center justify-between pt-xs border-t border-border">
 <span className="text-xs text-muted-foreground">
 {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
 </span>
 <div className="flex items-center space-x-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(record);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(record);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 ) : selectedDate ? (
 <div className="text-center py-lg">
 <Plane className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-sm" />
 <p className="text-sm text-muted-foreground">
 No trips on this date
 </p>
 </div>
 ) : (
 <div className="text-center py-lg">
 <CalendarIcon className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-sm" />
 <p className="text-sm text-muted-foreground">
 Click on a date to see trip details
 </p>
 </div>
 )}
 </Card>
 </div>
 </div>
 </div>
 );
}
