'use client';

import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash2, Plane, Globe, FileText } from "lucide-react";
import {
 Card,
 Badge,
 Button,
 Checkbox
} from '@ghxstship/ui';
import type { TravelRecord, TravelSort } from '../types';
import {
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

interface TravelTableViewProps {
 records: TravelRecord[];
 selectedIds: string[];
 sort: TravelSort;
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (selected: boolean) => void;
 onSort: (sort: TravelSort) => void;
 onView: (record: TravelRecord) => void;
 onEdit: (record: TravelRecord) => void;
 onDelete: (record: TravelRecord) => void;
 loading?: boolean;
}

type SortField = TravelSort['field'];

export default function TravelTableView({
 records,
 selectedIds,
 sort,
 onSelectItem,
 onSelectAll,
 onSort,
 onView,
 onEdit,
 onDelete,
 loading = false
}: TravelTableViewProps) {
 const allSelected = records.length > 0 && selectedIds.length === records.length;
 const someSelected = selectedIds.length > 0 && selectedIds.length < records.length;

 const handleSort = (field: SortField) => {
 const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
 onSort({ field, direction });
 };

 const getSortIcon = (field: SortField) => {
 if (sort.field !== field) {
 return <ArrowUpDown className="h-icon-xs w-icon-xs" />;
 }
 return sort.direction === 'asc' ? 
 <ArrowUp className="h-icon-xs w-icon-xs" /> : 
 <ArrowDown className="h-icon-xs w-icon-xs" />;
 };

 if (loading) {
 return (
 <Card className="overflow-hidden">
 <div className="p-md">
 <div className="animate-pulse space-y-md">
 <div className="h-icon-xs bg-muted rounded w-full"></div>
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-icon-2xl bg-muted rounded"></div>
 ))}
 </div>
 </div>
 </Card>
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
 <Card className="overflow-hidden">
 {/* Header with bulk selection */}
 <div className="p-md border-b">
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
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-muted/50">
 <tr>
 <th className="w-icon-2xl p-md">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected}
 onCheckedChange={(checked) => onSelectAll(!!checked)}
 />
 </th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('destination')}
 className="h-auto p-0 font-medium"
 >
 Destination
 {getSortIcon('destination')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('country')}
 className="h-auto p-0 font-medium"
 >
 Country
 {getSortIcon('country')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('travel_type')}
 className="h-auto p-0 font-medium"
 >
 Type
 {getSortIcon('travel_type')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">Status</th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('start_date')}
 className="h-auto p-0 font-medium"
 >
 Travel Dates
 {getSortIcon('start_date')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('duration_days')}
 className="h-auto p-0 font-medium"
 >
 Duration
 {getSortIcon('duration_days')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleSort('expenses')}
 className="h-auto p-0 font-medium"
 >
 Expenses
 {getSortIcon('expenses')}
 </Button>
 </th>
 <th className="text-left p-md font-medium">Visa</th>
 <th className="text-left p-md font-medium">Purpose</th>
 <th className="w-component-lg p-md font-medium">Actions</th>
 </tr>
 </thead>
 <tbody>
 {records.map((record, index) => {
 const isSelected = selectedIds.includes(record.id);
 const upcoming = isUpcomingTrip(record);
 const current = isCurrentTrip(record);

 return (
 <tr 
 key={record.id}
 className={`border-b hover:bg-muted/50 ${
 isSelected ? 'bg-primary/5' : ''
 } ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
 >
 <td className="p-md">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onSelectItem(record.id, !!checked)}
 />
 </td>
 <td className="p-md">
 <div className="font-medium flex items-center gap-xs">
 <Plane className="h-icon-xs w-icon-xs text-primary" />
 {record.destination}
 </div>
 {(upcoming || current) && (
 <div className="flex gap-xs mt-1">
 {upcoming && (
 <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
 Upcoming
 </Badge>
 )}
 {current && (
 <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
 Current
 </Badge>
 )}
 </div>
 )}
 </td>
 <td className="p-md">
 <div className="flex items-center gap-xs">
 <Globe className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span className="font-medium">{record.country}</span>
 </div>
 </td>
 <td className="p-md">
 <Badge variant="outline">
 {TRAVEL_TYPE_LABELS[record.travel_type]}
 </Badge>
 </td>
 <td className="p-md">
 <Badge variant={getStatusBadgeVariant(record.status)}>
 {TRAVEL_STATUS_LABELS[record.status]}
 </Badge>
 </td>
 <td className="p-md">
 <div className="text-sm">
 <div>{formatDateShort(record.start_date)}</div>
 <div className="text-muted-foreground">to {formatDateShort(record.end_date)}</div>
 </div>
 </td>
 <td className="p-md">
 <div className="text-center">
 <div className="font-medium">
 {record.duration_days}
 </div>
 <div className="text-xs text-muted-foreground">
 day{record.duration_days !== 1 ? 's' : ''}
 </div>
 </div>
 </td>
 <td className="p-md">
 {record.expenses ? (
 <div className="text-right">
 <div className="font-medium">
 {formatCurrency(record.expenses, record.currency)}
 </div>
 <div className="text-xs text-muted-foreground">
 {record.currency}
 </div>
 </div>
 ) : (
 <span className="text-muted-foreground">Not reported</span>
 )}
 </td>
 <td className="p-md">
 {record.visa_required ? (
 <Badge 
 variant="outline" 
 className={`text-${getVisaStatusColor(record.visa_status)}-700 border-${getVisaStatusColor(record.visa_status)}-300`}
 >
 {VISA_STATUS_LABELS[record.visa_status]}
 </Badge>
 ) : (
 <span className="text-muted-foreground text-sm">Not Required</span>
 )}
 </td>
 <td className="p-md">
 <div className="max-w-xs">
 <p className="text-sm truncate" title={record.purpose}>
 {record.purpose}
 </p>
 </div>
 </td>
 <td className="p-md">
 <div className="flex items-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(record)}
 title="View"
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(record)}
 title="Edit"
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(record)}
 title="Delete"
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Footer */}
 <div className="p-md border-t bg-muted/20">
 <div className="flex items-center justify-between text-sm text-muted-foreground">
 <div>
 Showing {records.length} travel records
 </div>
 <div className="flex items-center gap-xs">
 <span>Rows per page: 50</span>
 <Button variant="outline" size="sm">
 Previous
 </Button>
 <Button variant="outline" size="sm">
 Next
 </Button>
 </div>
 </div>
 </div>
 </Card>
 );
}
