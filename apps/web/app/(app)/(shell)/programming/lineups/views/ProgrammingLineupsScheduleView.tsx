"use client";

import { Edit, Eye, Trash2, Clock, MapPin, DollarSign, Calendar, ChevronLeft, ChevronRight, Music } from "lucide-react";
import { useMemo, useState } from 'react';
import {
 Badge,
 Button,
 Card,
 Select
} from "@ghxstship/ui";
import type { ProgrammingLineup, LineupSort, LineupProject, LineupEvent } from "../types";
import { STATUS_BADGE, PERFORMER_TYPE_BADGE } from "../types";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingLineupsScheduleViewProps = {
 lineups: ProgrammingLineup[];
 loading: boolean;
 selectedLineups: Set<string>;
 onSelectionChange: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onEdit: (lineup: ProgrammingLineup) => void;
 onView: (lineup: ProgrammingLineup) => void;
 onDelete: (lineup: ProgrammingLineup) => void;
 sortConfig: LineupSort;
 onSort: (sort: LineupSort) => void;
 users: User[];
 projects: LineupProject[];
 events: LineupEvent[];
};

interface ScheduleSlot {
 time: string;
 lineups: ProgrammingLineup[];
}

interface StageSchedule {
 stage: string;
 slots: ScheduleSlot[];
}

export default function ProgrammingLineupsScheduleView({
 lineups,
 loading,
 selectedLineups,
 onSelectionChange,
 onSelectAll,
 onEdit,
 onView,
 onDelete,
 sortConfig,
 onSort,
 users,
 projects,
 events
}: ProgrammingLineupsScheduleViewProps) {
 const [selectedDate, setSelectedDate] = useState<string>(() => {
 // Default to today or first event date
 const today = new Date().toDateString();
 const eventDates = lineups
 .filter(l => l.event?.start_at)
 .map(l => new Date(l.event!.start_at).toDateString());
 return eventDates.includes(today) ? today : eventDates[0] || today;
 });

 const [viewMode, setViewMode] = useState<'stage' | 'time'>('stage');

 // Get available dates
 const availableDates = useMemo(() => {
 const dates = new Set<string>();
 lineups.forEach(lineup => {
 if (lineup.event?.start_at) {
 dates.add(new Date(lineup.event.start_at).toDateString());
 } else if (lineup.set_time) {
 dates.add(new Date(lineup.set_time).toDateString());
 }
 });
 return Array.from(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
 }, [lineups]);

 // Filter lineups by selected date
 const dayLineups = useMemo(() => {
 return lineups.filter(lineup => {
 if (lineup.event?.start_at) {
 return new Date(lineup.event.start_at).toDateString() === selectedDate;
 } else if (lineup.set_time) {
 return new Date(lineup.set_time).toDateString() === selectedDate;
 }
 return false;
 });
 }, [lineups, selectedDate]);

 // Generate schedule by stage
 const stageSchedule = useMemo(() => {
 const stages = new Map<string, ProgrammingLineup[]>();
 
 dayLineups.forEach(lineup => {
 const stage = lineup.stage || 'Unassigned';
 if (!stages.has(stage)) {
 stages.set(stage, []);
 }
 stages.get(stage)!.push(lineup);
 });

 return Array.from(stages.entries()).map(([stage, stageLineups]) => {
 // Group by time slots
 const timeSlots = new Map<string, ProgrammingLineup[]>();
 
 stageLineups.forEach(lineup => {
 const timeKey = lineup.set_time 
 ? new Date(lineup.set_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
 : 'TBD';
 
 if (!timeSlots.has(timeKey)) {
 timeSlots.set(timeKey, []);
 }
 timeSlots.get(timeKey)!.push(lineup);
 });

 const slots = Array.from(timeSlots.entries())
 .map(([time, lineups]) => ({ time, lineups }))
 .sort((a, b) => {
 if (a.time === 'TBD') return 1;
 if (b.time === 'TBD') return -1;
 return a.time.localeCompare(b.time);
 });

 return { stage, slots };
 }).sort((a, b) => a.stage.localeCompare(b.stage));
 }, [dayLineups]);

 // Generate schedule by time
 const timeSchedule = useMemo(() => {
 const timeSlots = new Map<string, ProgrammingLineup[]>();
 
 dayLineups.forEach(lineup => {
 const timeKey = lineup.set_time 
 ? new Date(lineup.set_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
 : 'TBD';
 
 if (!timeSlots.has(timeKey)) {
 timeSlots.set(timeKey, []);
 }
 timeSlots.get(timeKey)!.push(lineup);
 });

 return Array.from(timeSlots.entries())
 .map(([time, lineups]) => ({ time, lineups }))
 .sort((a, b) => {
 if (a.time === 'TBD') return 1;
 if (b.time === 'TBD') return -1;
 return a.time.localeCompare(b.time);
 });
 }, [dayLineups]);

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString("en-US", {
 weekday: "long",
 year: "numeric",
 month: "long",
 day: "numeric"
 });
 };

 const formatCurrency = (amount: number | null, currency: string | null) => {
 if (!amount || !currency) return null;
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: currency
 }).format(amount);
 };

 const navigateDate = (direction: 'prev' | 'next') => {
 const currentIndex = availableDates.indexOf(selectedDate);
 if (direction === 'prev' && currentIndex > 0) {
 setSelectedDate(availableDates[currentIndex - 1]);
 } else if (direction === 'next' && currentIndex < availableDates.length - 1) {
 setSelectedDate(availableDates[currentIndex + 1]);
 }
 };

 const renderLineupCard = (lineup: ProgrammingLineup) => {
 const statusConfig = STATUS_BADGE[lineup.status];
 const typeConfig = PERFORMER_TYPE_BADGE[lineup.performer_type || 'other'];
 const isSelected = selectedLineups.has(lineup.id);
 const fee = formatCurrency(lineup.contract_details.fee, lineup.contract_details.currency);

 return (
 <Card
 key={lineup.id}
 className={`p-sm transition-all hover:shadow-sm cursor-pointer ${
 isSelected ? 'ring-1 ring-primary bg-primary/5' : ''
 }`}
 onClick={() => onView(lineup)}
 >
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm mb-1">
 <h4 className="font-medium text-sm truncate">{lineup.performer_name}</h4>
 <Badge variant="secondary" className="text-xs">
 {typeConfig.icon}
 </Badge>
 <Badge variant={statusConfig.variant} className="text-xs">
 {statusConfig.label}
 </Badge>
 </div>
 
 {lineup.role && (
 <p className="text-xs text-muted-foreground mb-1">{lineup.role}</p>
 )}

 <div className="flex items-center gap-md text-xs text-muted-foreground">
 {lineup.duration_minutes && (
 <span>{lineup.duration_minutes} min</span>
 )}
 {fee && (
 <span className="font-medium text-foreground">{fee}</span>
 )}
 {viewMode === 'time' && lineup.stage && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-3 w-3" />
 {lineup.stage}
 </div>
 )}
 </div>
 </div>

 <div className="flex items-center gap-xs ml-sm">
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(lineup);
 }}
 >
 <Edit className="h-3 w-3" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(lineup);
 }}
 >
 <Trash2 className="h-3 w-3 text-destructive" />
 </Button>
 </div>
 </div>
 </Card>
 );
 };

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="flex items-center justify-center py-xsxl">
 <div className="text-center">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-4"></div>
 <p className="text-muted-foreground">Loading schedule...</p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Schedule Controls */}
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-md">
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => navigateDate('prev')}
 disabled={availableDates.indexOf(selectedDate) === 0}
 >
 <ChevronLeft className="h-icon-xs w-icon-xs" />
 </Button>
 
 <div className="min-w-content-narrow text-center">
 <h3 className="font-medium">{formatDate(selectedDate)}</h3>
 <p className="text-sm text-muted-foreground">
 {dayLineups.length} lineup{dayLineups.length !== 1 ? 's' : ''}
 </p>
 </div>

 <Button
 variant="outline"
 size="sm"
 onClick={() => navigateDate('next')}
 disabled={availableDates.indexOf(selectedDate) === availableDates.length - 1}
 >
 <ChevronRight className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 <Select value={selectedDate} onValueChange={setSelectedDate}>
 {availableDates.map(date => (
 <option key={date} value={date}>
 {formatDate(date)}
 </option>
 ))}
 </Select>
 </div>

 <div className="flex items-center gap-sm">
 <Button
 variant={viewMode === 'stage' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setViewMode('stage')}
 >
 By Stage
 </Button>
 <Button
 variant={viewMode === 'time' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setViewMode('time')}
 >
 By Time
 </Button>
 </div>
 </div>
 </Card>

 {/* Schedule Content */}
 {dayLineups.length === 0 ? (
 <Card className="p-lg">
 <div className="text-center py-xsxl">
 <Music className="h-icon-2xl w-icon-2xl text-muted-foreground mx-auto mb-4" />
 <h3 className="text-lg font-medium mb-2">No lineups scheduled</h3>
 <p className="text-muted-foreground">No performers are scheduled for this date</p>
 </div>
 </Card>
 ) : viewMode === 'stage' ? (
 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-lg">
 {stageSchedule.map((stage) => (
 <Card key={stage.stage} className="p-md">
 <div className="flex items-center gap-sm mb-md">
 <MapPin className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="font-medium">{stage.stage}</h3>
 <Badge variant="outline" className="text-xs">
 {stage.slots.reduce((total, slot) => total + slot.lineups.length, 0)} lineups
 </Badge>
 </div>

 <div className="space-y-md">
 {stage.slots.map((slot) => (
 <div key={slot.time}>
 <div className="flex items-center gap-sm mb-sm">
 <Clock className="h-3 w-3 text-muted-foreground" />
 <span className="text-sm font-medium">{slot.time}</span>
 <div className="h-px bg-border flex-1" />
 </div>
 <div className="space-y-sm pl-md">
 {slot.lineups.map(renderLineupCard)}
 </div>
 </div>
 ))}
 </div>
 </Card>
 ))}
 </div>
 ) : (
 <div className="space-y-lg">
 {timeSchedule.map((timeSlot) => (
 <Card key={timeSlot.time} className="p-md">
 <div className="flex items-center gap-sm mb-md">
 <Clock className="h-icon-xs w-icon-xs text-muted-foreground" />
 <h3 className="font-medium text-lg">{timeSlot.time}</h3>
 <Badge variant="outline" className="text-xs">
 {timeSlot.lineups.length} lineup{timeSlot.lineups.length !== 1 ? 's' : ''}
 </Badge>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
 {timeSlot.lineups.map(renderLineupCard)}
 </div>
 </Card>
 ))}
 </div>
 )}
 </div>
 );
}
