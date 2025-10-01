'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Briefcase, Edit, Eye } from "lucide-react";
import { useState, useMemo } from 'react';
import { 
 Card, 
 Badge, 
 Button, 
 Avatar
} from '@ghxstship/ui';
import type { ProfessionalProfile } from '../types';

interface ProfessionalCalendarViewProps {
 profiles: ProfessionalProfile[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onView: (profile: ProfessionalProfile) => void;
 onEdit: (profile: ProfessionalProfile) => void;
 onDelete: (profile: ProfessionalProfile) => void;
 loading: boolean;
}

export default function ProfessionalCalendarView({
 profiles,
 selectedIds,
 onSelectItem,
 onView,
 onEdit,
 onDelete,
 loading,
}: ProfessionalCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [selectedDate, setSelectedDate] = useState<Date | null>(null);

 // Group profiles by hire date
 const profilesByDate = useMemo(() => {
 const grouped: Record<string, ProfessionalProfile[]> = {};
 
 profiles.forEach(profile => {
 if (profile.hire_date) {
 const date = new Date(profile.hire_date);
 const dateKey = date.toISOString().split('T')[0];
 
 if (!grouped[dateKey]) {
 grouped[dateKey] = [];
 }
 grouped[dateKey].push(profile);
 }
 });
 
 return grouped;
 }, [profiles]);

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

 const getDayProfiles = (date: Date) => {
 const dateKey = date.toISOString().split('T')[0];
 return profilesByDate[dateKey] || [];
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

 const selectedDayProfiles = selectedDate ? getDayProfiles(selectedDate) : [];

 return (
 <div className="space-y-lg">
 {/* Calendar Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-md">
 <h2 className="text-xl font-semibold">
 {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
 </h2>
 <Badge variant="outline">
 {profiles.length} total profiles
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
 const dayProfiles = getDayProfiles(date);
 const hasEvents = dayProfiles.length > 0;
 
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
 {dayProfiles.length}
 </Badge>
 )}
 </div>
 
 {/* Event indicators */}
 <div className="space-y-px">
 {dayProfiles.slice(0, 2).map((profile, idx) => {
 const completionPercentage = profile.profile_completion_percentage || 0;
 return (
 <div
 key={idx}
 className={`text-xs p-px rounded truncate ${
 completionPercentage >= 75 ? 'bg-green-100 text-green-800' :
 completionPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
 'bg-red-100 text-red-800'
 }`}
 >
 {profile.user?.first_name} {profile.user?.last_name}
 </div>
 );
 })}
 {dayProfiles.length > 2 && (
 <div className="text-xs text-muted-foreground">
 +{dayProfiles.length - 2} more
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

 {selectedDate && selectedDayProfiles.length > 0 ? (
 <div className="space-y-sm">
 <p className="text-sm text-muted-foreground mb-sm">
 {selectedDayProfiles.length} hire{selectedDayProfiles.length !== 1 ? 's' : ''} on this date
 </p>
 
 {selectedDayProfiles.map((profile) => {
 const isItemSelected = selectedIds.includes(profile.id);
 const completionPercentage = profile.profile_completion_percentage || 0;

 return (
 <Card 
 key={profile.id}
 className={`p-sm cursor-pointer transition-all hover:shadow-sm ${
 isItemSelected ? 'ring-2 ring-primary' : ''
 }`}
 onClick={() => {
 onSelectItem(profile.id, !isItemSelected);
 }}
 >
 <div className="flex items-center space-x-sm mb-sm">
 <Avatar className="h-icon-md w-icon-md">
 <User className="h-3 w-3" />
 </Avatar>
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-medium truncate">
 {profile.user?.first_name} {profile.user?.last_name}
 </h4>
 <p className="text-xs text-muted-foreground truncate">
 {profile.job_title || 'No title'}
 </p>
 </div>
 </div>

 <div className="space-y-xs mb-sm">
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Department</span>
 <span className="text-xs truncate ml-xs">{profile.department || 'N/A'}</span>
 </div>
 
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Employee ID</span>
 <span className="text-xs">{profile.employee_id || 'N/A'}</span>
 </div>
 
 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Completion</span>
 <Badge 
 variant={
 completionPercentage >= 90 ? 'default' :
 completionPercentage >= 70 ? 'secondary' :
 'outline'
 }
 className="text-xs"
 >
 {completionPercentage}%
 </Badge>
 </div>

 <div className="flex items-center justify-between">
 <span className="text-xs text-muted-foreground">Status</span>
 <Badge 
 variant={
 profile.status === 'active' ? 'default' :
 profile.status === 'inactive' ? 'destructive' :
 'secondary'
 }
 className="text-xs"
 >
 {profile.status}
 </Badge>
 </div>
 </div>

 <div className="flex items-center justify-between pt-xs border-t border-border">
 <span className="text-xs text-muted-foreground">
 Hire Date
 </span>
 <div className="flex items-center space-x-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onView(profile);
 }}
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(profile);
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
 <Briefcase className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-sm" />
 <p className="text-sm text-muted-foreground">
 No hires on this date
 </p>
 </div>
 ) : (
 <div className="text-center py-lg">
 <CalendarIcon className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-sm" />
 <p className="text-sm text-muted-foreground">
 Click on a date to see hire details
 </p>
 </div>
 )}
 </Card>
 </div>
 </div>
 </div>
 );
}
