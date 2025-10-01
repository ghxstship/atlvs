'use client';

import { ChevronLeft, ChevronRight, Calendar, User, UserPlus, Award, Briefcase } from "lucide-react";
import { useState, useMemo } from 'react';
import { Card, Badge, Button, Avatar } from '@ghxstship/ui';
import type { ProfileOverview } from '../types';
import { getStatusColor, formatLastLogin } from '../types';

interface ProfileOverviewCalendarViewProps {
 profiles: ProfileOverview[];
 loading?: boolean;
 selectedIds: string[];
 onSelectionChange: (ids: string[]) => void;
 onEdit: (profile: ProfileOverview) => void;
 onView: (profile: ProfileOverview) => void;
 onStatusChange: (profileId: string, status: ProfileOverview['status']) => void;
}

interface CalendarEvent {
 id: string;
 profile: ProfileOverview;
 date: Date;
 type: 'created' | 'updated' | 'login' | 'certification' | 'anniversary';
 title: string;
 description: string;
}

export default function ProfileOverviewCalendarView({
 profiles,
 loading = false,
 selectedIds,
 onSelectionChange,
 onEdit,
 onView,
 onStatusChange,
}: ProfileOverviewCalendarViewProps) {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [selectedDate, setSelectedDate] = useState<Date | null>(null);

 // Generate calendar events from profile data
 const calendarEvents = useMemo(() => {
 const events: CalendarEvent[] = [];
 const now = new Date();
 const currentMonth = currentDate.getMonth();
 const currentYear = currentDate.getFullYear();

 profiles.forEach(profile => {
 // Profile creation events
 const createdDate = new Date(profile.created_at);
 if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
 events.push({
 id: `${profile.id}-created`,
 profile,
 date: createdDate,
 type: 'created',
 title: 'Profile Created',
 description: `${profile.full_name} joined the organization`,
 });
 }

 // Profile update events
 const updatedDate = new Date(profile.updated_at);
 if (updatedDate.getMonth() === currentMonth && updatedDate.getFullYear() === currentYear) {
 events.push({
 id: `${profile.id}-updated`,
 profile,
 date: updatedDate,
 type: 'updated',
 title: 'Profile Updated',
 description: `${profile.full_name} updated their profile`,
 });
 }

 // Last login events
 if (profile.last_login) {
 const loginDate = new Date(profile.last_login);
 if (loginDate.getMonth() === currentMonth && loginDate.getFullYear() === currentYear) {
 events.push({
 id: `${profile.id}-login`,
 profile,
 date: loginDate,
 type: 'login',
 title: 'Last Login',
 description: `${profile.full_name} last logged in`,
 });
 }
 }

 // Mock certification events
 if (profile.certifications_count > 0) {
 const certDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
 if (certDate.getMonth() === currentMonth && certDate.getFullYear() === currentYear) {
 events.push({
 id: `${profile.id}-cert`,
 profile,
 date: certDate,
 type: 'certification',
 title: 'Certification Added',
 description: `${profile.full_name} added a new certification`,
 });
 }
 }

 // Work anniversary events (mock)
 const anniversaryDate = new Date(createdDate);
 anniversaryDate.setFullYear(currentYear);
 if (anniversaryDate.getMonth() === currentMonth && anniversaryDate < now) {
 const yearsOfService = currentYear - createdDate.getFullYear();
 if (yearsOfService > 0) {
 events.push({
 id: `${profile.id}-anniversary`,
 profile,
 date: anniversaryDate,
 type: 'anniversary',
 title: 'Work Anniversary',
 description: `${profile.full_name} - ${yearsOfService} year${yearsOfService !== 1 ? 's' : ''} of service`,
 });
 }
 }
 });

 return events.sort((a, b) => a.date.getTime() - b.date.getTime());
 }, [profiles, currentDate]);

 const getDaysInMonth = (date: Date) => {
 return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
 };

 const getFirstDayOfMonth = (date: Date) => {
 return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
 };

 const getEventsForDate = (date: Date) => {
 return calendarEvents.filter(event => 
 event.date.toDateString() === date.toDateString()
 );
 };

 const navigateMonth = (direction: 'prev' | 'next') => {
 const newDate = new Date(currentDate);
 if (direction === 'prev') {
 newDate.setMonth(newDate.getMonth() - 1);
 } else {
 newDate.setMonth(newDate.getMonth() + 1);
 }
 setCurrentDate(newDate);
 setSelectedDate(null);
 };

 const getEventTypeColor = (type: CalendarEvent['type']) => {
 const colors = {
 created: 'bg-success text-success-foreground',
 updated: 'bg-accent text-accent-foreground',
 login: 'bg-info text-info-foreground',
 certification: 'bg-warning text-warning-foreground',
 anniversary: 'bg-primary text-primary-foreground',
 };
 return colors[type] || 'bg-secondary text-secondary-foreground';
 };

 const getEventIcon = (type: CalendarEvent['type']) => {
 const icons = {
 created: UserPlus,
 updated: User,
 login: Calendar,
 certification: Award,
 anniversary: Briefcase,
 };
 const IconComponent = icons[type] || User;
 return <IconComponent className="h-3 w-3" />;
 };

 if (loading) {
 return (
 <div className="stack-lg">
 <div className="flex items-center justify-between mb-lg">
 <div className="h-icon-lg w-container-xs bg-secondary rounded animate-pulse"></div>
 <div className="flex gap-sm">
 <div className="h-icon-lg w-icon-lg bg-secondary rounded animate-pulse"></div>
 <div className="h-icon-lg w-icon-lg bg-secondary rounded animate-pulse"></div>
 </div>
 </div>
 <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
 {Array.from({ length: 42 }).map((_, i) => (
 <div key={i} className="bg-background p-md h-component-lg animate-pulse">
 <div className="h-icon-xs w-icon-xs bg-secondary rounded mb-sm"></div>
 <div className="h-2 bg-secondary rounded"></div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 const daysInMonth = getDaysInMonth(currentDate);
 const firstDayOfMonth = getFirstDayOfMonth(currentDate);
 const today = new Date();
 const isCurrentMonth = 
 currentDate.getMonth() === today.getMonth() && 
 currentDate.getFullYear() === today.getFullYear();

 // Generate calendar grid
 const calendarDays = [];
 
 // Previous month's trailing days
 const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
 for (let i = firstDayOfMonth - 1; i >= 0; i--) {
 const day = prevMonth.getDate() - i;
 calendarDays.push({
 date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
 isCurrentMonth: false,
 isToday: false,
 });
 }

 // Current month's days
 for (let day = 1; day <= daysInMonth; day++) {
 const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
 calendarDays.push({
 date,
 isCurrentMonth: true,
 isToday: isCurrentMonth && day === today.getDate(),
 });
 }

 // Next month's leading days
 const remainingDays = 42 - calendarDays.length;
 for (let day = 1; day <= remainingDays; day++) {
 const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
 calendarDays.push({
 date,
 isCurrentMonth: false,
 isToday: false,
 });
 }

 return (
 <div className="stack-lg">
 {/* Calendar Header */}
 <div className="flex items-center justify-between">
 <h2 className="text-heading-3">
 {currentDate.toLocaleDateString('en-US', { 
 month: 'long', 
 year: 'numeric' 
 })}
 </h2>
 <div className="flex items-center gap-sm">
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
 <Card className="p-0 overflow-hidden">
 {/* Day Headers */}
 <div className="grid grid-cols-7 bg-muted">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
 <div key={day} className="p-md text-center text-body-sm font-medium">
 {day}
 </div>
 ))}
 </div>

 {/* Calendar Days */}
 <div className="grid grid-cols-7 gap-px bg-border">
 {calendarDays.map((calendarDay, index) => {
 const dayEvents = getEventsForDate(calendarDay.date);
 const isSelected = selectedDate?.toDateString() === calendarDay.date.toDateString();

 return (
 <div
 key={index}
 className={`
 bg-background p-sm h-component-lg cursor-pointer hover:bg-muted/50 transition-colors
 ${!calendarDay.isCurrentMonth ? 'opacity-50' : ''}
 ${calendarDay.isToday ? 'bg-accent/10' : ''}
 ${isSelected ? 'bg-accent/20 ring-2 ring-accent' : ''}
 `}
 onClick={() => setSelectedDate(calendarDay.date)}
 >
 <div className={`
 text-body-sm font-medium mb-xs
 ${calendarDay.isToday ? 'color-accent' : ''}
 ${!calendarDay.isCurrentMonth ? 'color-muted' : ''}
 `}>
 {calendarDay.date.getDate()}
 </div>

 {/* Event Indicators */}
 <div className="stack-xs">
 {dayEvents.slice(0, 2).map(event => (
 <div
 key={event.id}
 className={`
 text-body-xs px-xs py-0.5 rounded truncate
 ${getEventTypeColor(event.type)}
 `}
 title={event.description}
 >
 {event.title}
 </div>
 ))}
 {dayEvents.length > 2 && (
 <div className="text-body-xs color-muted">
 +{dayEvents.length - 2} more
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Event Details Sidebar */}
 <div className="lg:col-span-1">
 <Card className="p-lg">
 <h3 className="text-heading-4 mb-lg">
 {selectedDate 
 ? selectedDate.toLocaleDateString('en-US', { 
 weekday: 'long',
 month: 'long', 
 day: 'numeric' 
 })
 : 'Select a date'
 }
 </h3>

 {selectedDate ? (
 <div className="stack-md">
 {getEventsForDate(selectedDate).length > 0 ? (
 getEventsForDate(selectedDate).map(event => (
 <div
 key={event.id}
 className="p-md bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
 onClick={() => onView(event.profile)}
 >
 <div className="flex items-center gap-md mb-sm">
 <div className={`p-xs rounded ${getEventTypeColor(event.type)}`}>
 {getEventIcon(event.type)}
 </div>
 <div className="flex-1">
 <div className="text-body-sm font-medium">
 {event.title}
 </div>
 <div className="text-body-xs color-muted">
 {event.date.toLocaleTimeString('en-US', { 
 hour: 'numeric',
 minute: '2-digit'
 })}
 </div>
 </div>
 </div>

 <div className="flex items-center gap-md mb-sm">
 <Avatar
 src={event.profile.avatar_url}
 alt={event.profile.full_name}
 fallback={event.profile.full_name.charAt(0)}
 size="sm"
 />
 <div className="flex-1">
 <div className="text-body-sm font-medium">
 {event.profile.full_name}
 </div>
 <div className="text-body-xs color-muted">
 {event.profile.job_title || 'No title'}
 </div>
 </div>
 <Badge variant={getStatusColor(event.profile.status) as unknown} size="sm">
 {event.profile.status}
 </Badge>
 </div>

 <p className="text-body-sm color-muted">
 {event.description}
 </p>
 </div>
 ))
 ) : (
 <div className="text-center py-lg color-muted">
 <Calendar className="h-icon-lg w-icon-lg mx-auto mb-md opacity-50" />
 <p className="text-body-sm">No events on this date</p>
 </div>
 )}
 </div>
 ) : (
 <div className="text-center py-lg color-muted">
 <Calendar className="h-icon-lg w-icon-lg mx-auto mb-md opacity-50" />
 <p className="text-body-sm">Click on a date to view events</p>
 </div>
 )}
 </Card>

 {/* Event Legend */}
 <Card className="p-lg mt-lg">
 <h4 className="text-body font-medium mb-md">Event Types</h4>
 <div className="stack-sm">
 {[
 { type: 'created' as const, label: 'Profile Created' },
 { type: 'updated' as const, label: 'Profile Updated' },
 { type: 'login' as const, label: 'Last Login' },
 { type: 'certification' as const, label: 'Certification' },
 { type: 'anniversary' as const, label: 'Work Anniversary' },
 ].map(({ type, label }) => (
 <div key={type} className="flex items-center gap-md">
 <div className={`p-xs rounded ${getEventTypeColor(type)}`}>
 {getEventIcon(type)}
 </div>
 <span className="text-body-sm">{label}</span>
 </div>
 ))}
 </div>
 </Card>
 </div>
 </div>

 {/* Empty State */}
 {profiles.length === 0 && !loading && (
 <div className="text-center py-xl">
 <User className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
 <h3 className="text-heading-4 mb-sm">No profiles found</h3>
 <p className="color-muted">Try adjusting your search or filter criteria.</p>
 </div>
 )}
 </div>
 );
}
