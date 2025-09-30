'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { Badge, Button, Card } from '@ghxstship/ui';
import { format } from 'date-fns';
import type { CallSheet } from '../lib/callSheetsService';

interface CallSheetsGridViewProps {
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

export default function CallSheetsGridView({
 callSheets,
 selected,
 onSelect,
 onView,
 onEdit,
 onDelete,
 onDistribute,
}: CallSheetsGridViewProps) {
 if (callSheets.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-12 text-center">
 <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold mb-2">No call sheets found</h3>
 <p className="text-muted-foreground">Create your first call sheet to get started.</p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 {callSheets.map((callSheet) => (
 <Card key={callSheet.id} className="p-4 hover:shadow-lg transition-all duration-200 group">
 <div className="space-y-3">
 {/* Header */}
 <div className="flex items-start justify-between">
 <input
 type="checkbox"
 checked={selected.has(callSheet.id)}
 onChange={() => onSelect(callSheet.id)}
 className="mt-1"
 />
 <Badge variant={STATUS_VARIANTS[callSheet.status]} className="text-xs">
 {callSheet.status.replace('_', ' ')}
 </Badge>
 </div>
 
 {/* Title */}
 <div>
 <h3 className="font-semibold text-base line-clamp-2 mb-1">
 {callSheet.title}
 </h3>
 {callSheet.description && (
 <p className="text-muted-foreground text-xs line-clamp-2">
 {callSheet.description}
 </p>
 )}
 </div>
 
 {/* Date and Time */}
 <div className="space-y-2">
 <div className="flex items-center text-sm text-muted-foreground">
 <Calendar className="h-3 w-3 mr-2" />
 <span>{format(new Date(callSheet.call_date), 'MMM dd, yyyy')}</span>
 </div>
 
 {callSheet.call_time && (
 <div className="flex items-center text-sm text-muted-foreground">
 <Clock className="h-3 w-3 mr-2" />
 <span>{callSheet.call_time}</span>
 </div>
 )}
 
 {callSheet.location && (
 <div className="flex items-center text-sm text-muted-foreground">
 <MapPin className="h-3 w-3 mr-2" />
 <span className="truncate">{callSheet.location}</span>
 </div>
 )}
 </div>
 
 {/* People Count */}
 <div className="flex items-center justify-between text-sm">
 <div className="flex items-center text-muted-foreground">
 <Users className="h-3 w-3 mr-2" />
 <span>
 {(callSheet.crew_calls?.length || 0) + (callSheet.talent_calls?.length || 0)} people
 </span>
 </div>
 
 {callSheet.weather && (
 <span className="text-xs bg-muted px-2 py-1 rounded">
 {callSheet.weather}
 </span>
 )}
 </div>
 
 {/* Crew and Talent Breakdown */}
 {(callSheet.crew_calls?.length > 0 || callSheet.talent_calls?.length > 0) && (
 <div className="flex flex-wrap gap-1">
 {callSheet.crew_calls?.length > 0 && (
 <Badge variant="outline" className="text-xs px-2 py-0">
 {callSheet.crew_calls.length} crew
 </Badge>
 )}
 {callSheet.talent_calls?.length > 0 && (
 <Badge variant="outline" className="text-xs px-2 py-0">
 {callSheet.talent_calls.length} talent
 </Badge>
 )}
 </div>
 )}
 
 {/* Special Instructions */}
 {callSheet.special_instructions && (
 <div className="p-2 bg-muted rounded text-xs">
 <div className="font-medium mb-1">Special Instructions:</div>
 <div className="line-clamp-2">{callSheet.special_instructions}</div>
 </div>
 )}
 
 {/* Actions */}
 <div className="flex items-center justify-between pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
 <div className="flex items-center space-x-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(callSheet)}
 title="View call sheet"
 >
 <Eye className="h-3 w-3" />
 </Button>
 
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(callSheet)}
 title="Edit call sheet"
 >
 <Pencil className="h-3 w-3" />
 </Button>
 </div>
 
 <div className="flex items-center space-x-1">
 {callSheet.status === 'published' && onDistribute && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDistribute(callSheet)}
 title="Distribute call sheet"
 >
 <Share2 className="h-3 w-3" />
 </Button>
 )}
 
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(callSheet)}
 title="Delete call sheet"
 className="text-destructive hover:text-destructive"
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </div>
 </Card>
 ))}
 </div>
 );
}
