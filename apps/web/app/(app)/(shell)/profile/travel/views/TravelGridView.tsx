'use client';

import { Plane, Calendar, MapPin, Clock, CreditCard, Eye, Edit, Trash2, Globe, FileText } from "lucide-react";
import {
 Card,
 Badge,
 Button,
 Checkbox,
} from '@ghxstship/ui';
import type { TravelRecord } from '../types';
import {
 formatDateShort,
 formatCurrency,
 getStatusBadgeVariant,
 getVisaStatusColor,
 TRAVEL_TYPE_LABELS,
 TRAVEL_STATUS_LABELS,
 VISA_STATUS_LABELS,
 isUpcomingTrip,
 isCurrentTrip,
} from '../types';

interface TravelGridViewProps {
 records: TravelRecord[];
 selectedIds: string[];
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onView: (record: TravelRecord) => void;
 onEdit: (record: TravelRecord) => void;
 onDelete: (record: TravelRecord) => void;
 loading?: boolean;
}

export default function TravelGridView({
 records,
 selectedIds,
 onSelectItem,
 onSelectAll,
 onView,
 onEdit,
 onDelete,
 loading = false,
}: TravelGridViewProps) {
 const allSelected = records.length > 0 && selectedIds.length === records.length;
 const someSelected = selectedIds.length > 0 && selectedIds.length < records.length;

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[...Array(6)].map((_, i) => (
 <Card key={i} className="p-6">
 <div className="animate-pulse space-y-4">
 <div className="h-4 bg-muted rounded w-3/4"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 <div className="h-20 bg-muted rounded"></div>
 </div>
 </Card>
 ))}
 </div>
 );
 }

 if (records.length === 0) {
 return (
 <Card className="p-12 text-center">
 <div className="flex flex-col items-center gap-4">
 <Plane className="h-12 w-12 text-muted-foreground" />
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
 <div className="space-y-6">
 {/* Header with bulk selection */}
 <Card className="p-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
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
 <div className="flex items-center gap-2">
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

 {/* Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {records.map((record) => {
 const isSelected = selectedIds.includes(record.id);
 const upcoming = isUpcomingTrip(record);
 const current = isCurrentTrip(record);

 return (
 <Card 
 key={record.id} 
 className={`p-6 hover:shadow-md transition-shadow ${
 isSelected ? 'ring-2 ring-primary' : ''
 }`}
 >
 <div className="space-y-4">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onSelectItem(record.id, !!checked)}
 />
 <Badge variant={getStatusBadgeVariant(record.status)}>
 {TRAVEL_STATUS_LABELS[record.status]}
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
 <div className="flex items-center gap-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(record)}
 >
 <Eye className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(record)}
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(record)}
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>

 {/* Destination Info */}
 <div className="text-center">
 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
 <Plane className="h-8 w-8 text-primary" />
 </div>
 <h3 className="font-semibold text-lg mb-1">
 {record.destination}
 </h3>
 <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
 <Globe className="h-4 w-4" />
 {record.country}
 </div>
 <Badge variant="outline" className="mb-3">
 {TRAVEL_TYPE_LABELS[record.travel_type]}
 </Badge>
 </div>

 {/* Trip Duration */}
 <div className="text-center">
 <div className="text-2xl font-bold text-primary mb-1">
 {record.duration_days}
 </div>
 <div className="text-sm text-muted-foreground mb-2">
 Day{record.duration_days !== 1 ? 's' : ''}
 </div>
 <div className="text-xs text-muted-foreground">
 {formatDateShort(record.start_date)} - {formatDateShort(record.end_date)}
 </div>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-2 gap-4 text-center">
 <div>
 <div className="flex items-center justify-center gap-1 mb-1">
 <CreditCard className="h-4 w-4 text-green-500" />
 <span className="text-sm font-medium">Expenses</span>
 </div>
 <div className="text-lg font-semibold">
 {record.expenses ? formatCurrency(record.expenses, record.currency) : 'N/A'}
 </div>
 </div>
 <div>
 <div className="flex items-center justify-center gap-1 mb-1">
 <FileText className="h-4 w-4 text-blue-500" />
 <span className="text-sm font-medium">Visa</span>
 </div>
 <div className="text-sm font-semibold">
 {record.visa_required ? (
 <Badge 
 variant="outline" 
 className={`text-${getVisaStatusColor(record.visa_status)}-700 border-${getVisaStatusColor(record.visa_status)}-300`}
 >
 {VISA_STATUS_LABELS[record.visa_status]}
 </Badge>
 ) : (
 <span className="text-muted-foreground">Not Required</span>
 )}
 </div>
 </div>
 </div>

 {/* Purpose */}
 <div>
 <h4 className="font-medium text-sm mb-2">Purpose</h4>
 <p className="text-sm text-muted-foreground line-clamp-2">
 {record.purpose}
 </p>
 </div>

 {/* Travel Details */}
 {(record.accommodation || record.transportation) && (
 <div>
 <h4 className="font-medium text-sm mb-2">Travel Details</h4>
 <div className="space-y-1">
 {record.accommodation && (
 <div className="text-sm text-muted-foreground">
 <span className="font-medium">Stay:</span> {record.accommodation}
 </div>
 )}
 {record.transportation && (
 <div className="text-sm text-muted-foreground">
 <span className="font-medium">Transport:</span> {record.transportation}
 </div>
 )}
 </div>
 </div>
 )}

 {/* Booking Reference */}
 {record.booking_reference && (
 <div>
 <h4 className="font-medium text-sm mb-1">Booking Reference</h4>
 <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
 {record.booking_reference}
 </p>
 </div>
 )}

 {/* Emergency Contact */}
 {record.emergency_contact && (
 <div>
 <h4 className="font-medium text-sm mb-1">Emergency Contact</h4>
 <p className="text-sm text-muted-foreground">
 {record.emergency_contact}
 </p>
 </div>
 )}

 {/* Notes Preview */}
 {record.notes && (
 <div>
 <h4 className="font-medium text-sm mb-2">Notes</h4>
 <p className="text-sm text-muted-foreground line-clamp-2">
 {record.notes}
 </p>
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex gap-2 pt-2">
 <Button
 variant="outline"
 size="sm"
 className="flex-1"
 onClick={() => onView(record)}
 >
 View Details
 </Button>
 <Button
 variant="primary"
 size="sm"
 className="flex-1"
 onClick={() => onEdit(record)}
 >
 Edit Trip
 </Button>
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
