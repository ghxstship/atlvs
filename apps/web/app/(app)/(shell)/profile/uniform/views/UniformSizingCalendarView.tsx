'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Shirt, Edit, Eye } from "lucide-react";
import { useState, useMemo } from 'react';
import { 
 Card, 
 Badge, 
 Button, 
 Avatar
} from '@ghxstship/ui';
import type { UniformSizing } from '../types';
import { 
 getBMICategory, 
 getCompletenessColor, 
 calculateSizeCompleteness 
} from '../types';

interface UniformSizingCalendarViewProps {
 sizings: UniformSizing[];
 loading: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (sizing: UniformSizing) => void;
 onView: (sizing: UniformSizing) => void;
}

export default function UniformSizingCalendarView({
 sizings,
 loading,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView,
}: UniformSizingCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [selectedDate, setSelectedDate] = useState<Date | null>(null);

 // Group sizings by date (using updated_at)
 const sizingsByDate = useMemo(() => {
 const grouped: Record<string, UniformSizing[]> = {};
 
 sizings.forEach(sizing => {
 const date = new Date(sizing.updated_at);
 const dateKey = date.toISOString().split('T')[0];
 
 if (!grouped[dateKey]) {
 grouped[dateKey] = [];
 }
 grouped[dateKey].push(sizing);
 });
 
 return grouped;
 }, [sizings]);

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

 const getDaySizings = (date: Date) => {
 const dateKey = date.toISOString().split('T')[0];
 return sizingsByDate[dateKey] || [];
 };

 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="animate-pulse">
 <div className="h-12 bg-muted rounded mb-lg"></div>
 <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
 {[...Array(42)].map((_, i) => (
 <div key={i} className="h-24 bg-background"></div>
 ))}
 </div>
 </div>
 </div>
 );
 }

 const selectedDaySizings = selectedDate ? getDaySizings(selectedDate) : [];

 return (
 <div className="space-y-lg">
 {/* Calendar Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-md">
 <h2 className="text-xl font-semibold">
 {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
 </h2>
 <Badge variant="outline">
 {sizings.length} total records
 </Badge>
 </div>
 
 <div className="flex items-center space-x-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => navigateMonth('prev')}
 >
 <ChevronLeft className="h-4 w-4" />
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
 <ChevronRight className="h-4 w-4" />
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
 const daySizings = getDaySizings(date);
 const hasEvents = daySizings.length > 0;
 
 return (
 <div
 key={index}
 className={`
 h-24 bg-background p-xs cursor-pointer transition-colors hover:bg-muted/50
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
 <Badge variant="secondary" className="text-xs h-4 px-1">
 {daySizings.length}
 </Badge>
 )}
 </div>
 
 {/* Event indicators */}
 <div className="space-y-px">
 {daySizings.slice(0, 2).map((sizing, idx) => {
 const completeness = calculateSizeCompleteness(sizing);
 return (
 <div
 key={idx}
 className={`text-xs p-px rounded truncate ${
 completeness >= 75 ? 'bg-green-100 text-green-800' :
 completeness >= 50 ? 'bg-yellow-100 text-yellow-800' :
 'bg-red-100 text-red-800'
 }`}
 >
 {sizing.first_name} {sizing.last_name}
 </div>
 );
 })}
 {daySizings.length > 2 && (
 <div className="text-xs text-muted-foreground">
 +{daySizings.length - 2} more
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
 <CalendarIcon className="h-5 w-5 text-primary" />
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

 {selectedDate && selectedDaySizings.length > 0 ? (
 <div className="space-y-sm">
 <p className="text-sm text-muted-foreground mb-sm">
 {selectedDaySizings.length} record{selectedDaySizings.length !== 1 ? 's' : ''} updated
 </p>
 
 {selectedDaySizings.map((sizing) => {
 const isItemSelected = selectedIds.includes(sizing.user_id);
 const completeness = calculateSizeCompleteness(sizing);
 const bmiCategory = sizing.height && sizing.weight 
 ? getBMICategory(sizing.height, sizing.weight)
 : null;

 return (
 <Card 
 key={sizing.user_id}
 className={`p-sm cursor-pointer transition-all hover:shadow-sm ${
 isItemSelected ? 'ring-2 ring-primary' : ''
 }`}
 onClick={() => {
 const newSelection = isItemSelected
 ? selectedIds.filter(id => id !== sizing.user_id)
 : [...selectedIds, sizing.user_id];
 onSelectionChange(newSelection);
 }}
 >
 <div className="flex items-center space-x-sm mb-sm">
 <Avatar className="h-6 w-6">
 <User className="h-3 w-3" />
 </Avatar>
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-medium truncate">
 {sizing.first_name} {sizing.last_name}
 </h4>
 <p className="text-xs text-muted-foreground">
 {sizing.size_category || 'Uncategorized'}
 </p>
 </div>
 </div>

 <div className="space-y-xs mb-sm">
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Completeness</span>
 <Badge 
 variant={getCompletenessColor(completeness) as unknown}
 className="text-xs"
 >
 {completeness}%
 </Badge>
 </div>
 
 {bmiCategory && (
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">BMI Category</span>
 <Badge variant="outline" className="text-xs">
 {bmiCategory}
 </Badge>
 </div>
 )}
 </div>

 <div className="flex items-center justify-between pt-xs border-t border-border">
 <span className="text-xs text-muted-foreground">
 {new Date(sizing.updated_at).toLocaleTimeString('en-US', {
 hour: 'numeric',
 minute: '2-digit'
 })}
 </span>
 <div className="flex items-center space-x-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(sizing);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(sizing);
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
 <Shirt className="h-8 w-8 text-muted-foreground mx-auto mb-sm" />
 <p className="text-sm text-muted-foreground">
 No records updated on this date
 </p>
 </div>
 ) : (
 <div className="text-center py-lg">
 <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-sm" />
 <p className="text-sm text-muted-foreground">
 Click on a date to see details
 </p>
 </div>
 )}
 </Card>
 </div>
 </div>
 </div>
 );
}
