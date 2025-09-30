'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { Badge, Button, Card } from '@ghxstship/ui';
import { format, isSameDay, parseISO } from 'date-fns';
import type { CallSheet } from '../lib/callSheetsService';

interface CallSheetsTimelineViewProps {
 callSheets: CallSheet[];
 selected: Set<string>;
 onSelect: (id: string) => void;
 onView: (callSheet: CallSheet) => void;
 onEdit: (callSheet: CallSheet) => void;
 onDelete: (callSheet: CallSheet) => void;
 onDistribute?: (callSheet: CallSheet) => void;
}

const STATUS_VARIANTS: Record<CallSheet['status'], 'secondary' | 'info' | 'warning' | 'success' | 'destructive'> = {
 draft: 'secondary',
 published: 'info',
 distributed: 'warning',
 completed: 'success',
 cancelled: 'destructive',
};

export default function CallSheetsTimelineView({
 callSheets,
 selected,
 onSelect,
 onView,
 onEdit,
 onDelete,
 onDistribute,
}: CallSheetsTimelineViewProps) {
 if (callSheets.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-12 text-center">
 <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold mb-2">No call sheets found</h3>
 <p className="text-muted-foreground">Create your first call sheet to get started.</p>
 </div>
 );
 }

 // Group call sheets by date
 const groupedCallSheets = callSheets.reduce((groups, callSheet) => {
 const date = format(new Date(callSheet.call_date), 'yyyy-MM-dd');
 if (!groups[date]) {
 groups[date] = [];
 }
 groups[date].push(callSheet);
 return groups;
 }, {} as Record<string, CallSheet[]>);

 // Sort dates
 const sortedDates = Object.keys(groupedCallSheets).sort();

 return (
 <div className="space-y-8">
 {sortedDates.map((date) => {
 const callSheetsForDate = groupedCallSheets[date];
 const dateObj = parseISO(date);
 const isToday = isSameDay(dateObj, new Date());
 
 return (
 <div key={date} className="relative">
 {/* Date Header */}
 <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b pb-2 mb-4">
 <div className="flex items-center space-x-3">
 <div className={`w-3 h-3 rounded-full ${isToday ? 'bg-primary' : 'bg-muted-foreground'}`} />
 <h2 className={`text-lg font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
 {format(dateObj, 'EEEE, MMMM dd, yyyy')}
 {isToday && <span className="ml-2 text-sm text-primary">(Today)</span>}
 </h2>
 <Badge variant="outline" className="text-xs">
 {callSheetsForDate.length} call sheet{callSheetsForDate.length !== 1 ? 's' : ''}
 </Badge>
 </div>
 </div>
 
 {/* Timeline Items */}
 <div className="space-y-4 ml-6 border-l-2 border-muted pl-6">
 {callSheetsForDate
 .sort((a, b) => {
 // Sort by call time if available, otherwise by creation time
 const timeA = a.call_time || '00:00';
 const timeB = b.call_time || '00:00';
 return timeA.localeCompare(timeB);
 })
 .map((callSheet, index) => (
 <div key={callSheet.id} className="relative">
 {/* Timeline Dot */}
 <div className={`absolute -left-8 w-4 h-4 rounded-full border-2 border-background ${
 STATUS_VARIANTS[callSheet.status] === 'success' ? 'bg-success' :
 STATUS_VARIANTS[callSheet.status] === 'warning' ? 'bg-warning' :
 STATUS_VARIANTS[callSheet.status] === 'destructive' ? 'bg-destructive' :
 STATUS_VARIANTS[callSheet.status] === 'info' ? 'bg-info' : 'bg-muted-foreground'
 }`} />
 
 <Card className="p-4 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div className="flex items-start space-x-3 flex-1">
 <input
 type="checkbox"
 checked={selected.has(callSheet.id)}
 onChange={() => onSelect(callSheet.id)}
 className="mt-1"
 />
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-2 mb-2">
 <h3 className="font-semibold text-base">{callSheet.title}</h3>
 <Badge variant={STATUS_VARIANTS[callSheet.status]} className="text-xs">
 {callSheet.status.replace('_', ' ')}
 </Badge>
 </div>
 
 {callSheet.description && (
 <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
 {callSheet.description}
 </p>
 )}
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
 {callSheet.call_time && (
 <div className="flex items-center text-muted-foreground">
 <Clock className="h-4 w-4 mr-2" />
 <span className="font-medium">{callSheet.call_time}</span>
 </div>
 )}
 
 {callSheet.location && (
 <div className="flex items-center text-muted-foreground">
 <MapPin className="h-4 w-4 mr-2" />
 <span className="truncate">{callSheet.location}</span>
 </div>
 )}
 
 <div className="flex items-center text-muted-foreground">
 <Users className="h-4 w-4 mr-2" />
 <span>
 {(callSheet.crew_calls?.length || 0) + (callSheet.talent_calls?.length || 0)} people
 </span>
 </div>
 </div>
 
 {/* Crew and Talent Details */}
 {(callSheet.crew_calls?.length > 0 || callSheet.talent_calls?.length > 0) && (
 <div className="space-y-2 mb-3">
 {callSheet.crew_calls?.length > 0 && (
 <div className="text-xs">
 <span className="font-medium text-muted-foreground">Crew ({callSheet.crew_calls.length}):</span>
 <div className="flex flex-wrap gap-1 mt-1">
 {callSheet.crew_calls.slice(0, 3).map((crew, idx) => (
 <Badge key={idx} variant="outline" className="text-xs">
 {crew.role} - {crew.call_time}
 </Badge>
 ))}
 {callSheet.crew_calls.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{callSheet.crew_calls.length - 3} more
 </Badge>
 )}
 </div>
 </div>
 )}
 
 {callSheet.talent_calls?.length > 0 && (
 <div className="text-xs">
 <span className="font-medium text-muted-foreground">Talent ({callSheet.talent_calls.length}):</span>
 <div className="flex flex-wrap gap-1 mt-1">
 {callSheet.talent_calls.slice(0, 3).map((talent, idx) => (
 <Badge key={idx} variant="outline" className="text-xs">
 {talent.talent_name} - {talent.call_time}
 </Badge>
 ))}
 {callSheet.talent_calls.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{callSheet.talent_calls.length - 3} more
 </Badge>
 )}
 </div>
 </div>
 )}
 </div>
 )}
 
 {callSheet.special_instructions && (
 <div className="p-2 bg-muted rounded text-xs mb-3">
 <strong>Special Instructions:</strong> {callSheet.special_instructions}
 </div>
 )}
 
 {callSheet.weather && (
 <div className="text-xs text-muted-foreground">
 <strong>Weather:</strong> {callSheet.weather}
 </div>
 )}
 </div>
 </div>
 
 <div className="flex items-center space-x-1 ml-4">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(callSheet)}
 title="View call sheet"
 >
 <Eye className="h-4 w-4" />
 </Button>
 
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(callSheet)}
 title="Edit call sheet"
 >
 <Pencil className="h-4 w-4" />
 </Button>
 
 {callSheet.status === 'published' && onDistribute && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDistribute(callSheet)}
 title="Distribute call sheet"
 >
 <Share2 className="h-4 w-4" />
 </Button>
 )}
 
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(callSheet)}
 title="Delete call sheet"
 className="text-destructive hover:text-destructive"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </Card>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 );
}
