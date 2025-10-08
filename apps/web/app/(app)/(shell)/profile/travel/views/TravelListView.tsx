'use client';

import { Plane, Calendar, MapPin, Clock, CreditCard, Eye, Edit, Trash2, Globe, FileText } from "lucide-react";
import { useState } from 'react';
import {
 Card,
 Badge,
 Button,
 Checkbox
} from '@ghxstship/ui';
import type { TravelRecord } from '../types';
import {
 formatDate,
 formatDateShort,
 formatCurrency,
 getStatusBadgeVariant,
 getVisaStatusColor,
 TRAVEL_TYPE_LABELS,
 TRAVEL_STATUS_LABELS,
 VISA_STATUS_LABELS,
 isUpcomingTrip,
 isCurrentTrip
} from '../types';

interface TravelListViewProps {
 records: TravelRecord[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onView: (record: TravelRecord) => void;
 onEdit: (record: TravelRecord) => void;
 onDelete: (record: TravelRecord) => void;
 loading?: boolean;
}

export default function TravelListView({
 records,
 selectedIds,
 onSelectItem,
 onSelectAll,
 onView,
 onEdit,
 onDelete,
 loading = false
}: TravelListViewProps) {
 const [expandedIds, setExpandedIds] = useState<Set<string>(new Set());

 const toggleExpanded = (id: string) => {
 const newExpanded = new Set(expandedIds);
 if (newExpanded.has(id)) {
 newExpanded.delete(id);
 } else {
 newExpanded.add(id);
 }
 setExpandedIds(newExpanded);
 };

 const allSelected = records.length > 0 && selectedIds.length === records.length;
 const someSelected = selectedIds.length > 0 && selectedIds.length < records.length;

 if (loading) {
 return (
 <div className="space-y-md">
 {[...Array(3)].map((_, i) => (
 <Card key={i} className="p-md">
 <div className="animate-pulse">
 <div className="h-icon-xs bg-muted rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (records.length === 0) {
 return (
 <Card className="p-xsxl text-center">
 <div className="flex flex-col items-center gap-md">
 <Plane className="h-icon-2xl w-icon-2xl text-muted-foreground" />
 <div>
 <h3 className="text-lg font-semibold">No Travel Records</h3>
 <p className="text-muted-foreground mt-2">
 No travel records found matching your criteria.
 </p>
 </div>
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 {/* Header with bulk selection */}
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={(checked) => onSelectAll(!!checked)}
 />
 <span className="text-sm text-muted-foreground">
 {selectedIds.length > 0 ? `${selectedIds.length} selected` : `${records.length} trips`}
 </span>
 </div>
 {selectedIds.length > 0 && (
 <div className="flex items-center gap-xs">
 <Button variant="outline" size="sm">
 Export Selected
 </Button>
 <Button variant="outline" size="sm">
 Bulk Actions
 </Button>
 </div>
 )}
 </div>
 </Card>

 {/* Travel Records List */}
 {records.map((record) => {
 const isSelected = selectedIds.includes(record.id);
 const isExpanded = expandedIds.has(record.id);
 const upcoming = isUpcomingTrip(record);
 const current = isCurrentTrip(record);

 return (
 <Card key={record.id} className={`p-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
 <div className="space-y-md">
 {/* Header Row */}
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-sm flex-1">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onSelectItem(record.id, !!checked)}
 />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-xs mb-2">
 <h3 className="font-semibold text-lg flex items-center gap-xs">
 <Plane className="h-icon-xs w-icon-xs" />
 {record.destination}, {record.country}
 </h3>
 <Badge variant={getStatusBadgeVariant(record.status)}>
 {TRAVEL_STATUS_LABELS[record.status]}
 </Badge>
 <Badge variant="outline">
 {TRAVEL_TYPE_LABELS[record.travel_type]}
 </Badge>
 {upcoming && (
 <Badge variant="secondary" className="bg-blue-100 text-blue-800">
 Upcoming
 </Badge>
 )}
 {current && (
 <Badge variant="secondary" className="bg-green-100 text-green-800">
 Current
 </Badge>
 )}
 </div>
 
 <div className="flex items-center gap-md text-sm text-muted-foreground mb-2">
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs" />
 {formatDateShort(record.start_date)} - {formatDateShort(record.end_date)}
 </div>
 <div className="flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 {record.duration_days} day{record.duration_days !== 1 ? 's' : ''}
 </div>
 {record.expenses && (
 <div className="flex items-center gap-xs">
 <CreditCard className="h-icon-xs w-icon-xs" />
 {formatCurrency(record.expenses, record.currency)}
 </div>
 )}
 </div>

 <p className="text-sm text-muted-foreground">{record.purpose}</p>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => toggleExpanded(record.id)}
 >
 {isExpanded ? 'Less' : 'More'}
 </Button>
 <div className="flex items-center">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(record)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(record)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(record)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 </div>

 {/* Expanded Content */}
 {isExpanded && (
 <div className="border-t pt-4 space-y-md">
 {/* Travel Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {record.accommodation && (
 <div>
 <h4 className="font-medium text-sm mb-1">Accommodation</h4>
 <p className="text-sm text-muted-foreground">{record.accommodation}</p>
 </div>
 )}
 {record.transportation && (
 <div>
 <h4 className="font-medium text-sm mb-1">Transportation</h4>
 <p className="text-sm text-muted-foreground">{record.transportation}</p>
 </div>
 )}
 {record.booking_reference && (
 <div>
 <h4 className="font-medium text-sm mb-1">Booking Reference</h4>
 <p className="text-sm text-muted-foreground font-mono">{record.booking_reference}</p>
 </div>
 )}
 {record.emergency_contact && (
 <div>
 <h4 className="font-medium text-sm mb-1">Emergency Contact</h4>
 <p className="text-sm text-muted-foreground">{record.emergency_contact}</p>
 </div>
 )}
 </div>

 {/* Visa Information */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <h4 className="font-medium text-sm mb-1">Visa Required</h4>
 <Badge variant={record.visa_required ? 'secondary' : 'outline'}>
 {record.visa_required ? 'Yes' : 'No'}
 </Badge>
 </div>
 {record.visa_required && (
 <div>
 <h4 className="font-medium text-sm mb-1">Visa Status</h4>
 <Badge 
 variant="outline" 
 className={`border-${getVisaStatusColor(record.visa_status)}-500 text-${getVisaStatusColor(record.visa_status)}-700`}
 >
 {VISA_STATUS_LABELS[record.visa_status]}
 </Badge>
 </div>
 )}
 </div>

 {/* Passport Information */}
 {record.passport_used && (
 <div>
 <h4 className="font-medium text-sm mb-2">Passport Used</h4>
 <p className="text-sm text-muted-foreground bg-muted p-sm rounded font-mono">
 {record.passport_used}
 </p>
 </div>
 )}

 {/* Notes */}
 {record.notes && (
 <div>
 <h4 className="font-medium text-sm mb-2">Notes</h4>
 <p className="text-sm text-muted-foreground bg-muted p-sm rounded">
 {record.notes}
 </p>
 </div>
 )}

 {/* Expense Details */}
 {record.expenses && (
 <div className="bg-blue-50 p-md rounded-lg">
 <div className="flex items-center gap-xs mb-2">
 <CreditCard className="h-icon-xs w-icon-xs text-blue-600" />
 <h4 className="font-medium text-sm">Expense Information</h4>
 </div>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <span className="text-sm text-muted-foreground">Total Amount:</span>
 <p className="font-semibold text-lg text-blue-700">
 {formatCurrency(record.expenses, record.currency)}
 </p>
 </div>
 <div>
 <span className="text-sm text-muted-foreground">Currency:</span>
 <p className="font-medium">{record.currency}</p>
 </div>
 </div>
 </div>
 )}

 {/* Metadata */}
 <div className="grid grid-cols-2 gap-md text-xs text-muted-foreground">
 <div>
 <span className="font-medium">Created:</span> {formatDate(record.created_at)}
 </div>
 <div>
 <span className="font-medium">Updated:</span> {formatDate(record.updated_at)}
 </div>
 </div>
 </div>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 );
}
