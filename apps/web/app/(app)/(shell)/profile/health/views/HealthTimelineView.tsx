'use client';

import { Search, Filter, Download, Calendar, Clock, AlertTriangle, CheckCircle, Edit, Trash2, Bell, Activity } from "lucide-react";
import { useState } from 'react';
import {
 Card,
 Button,
 Badge,
 Input,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Checkbox
} from '@ghxstship/ui';
import type { HealthRecord, HealthFilters, HealthSort } from '../types';
import {
 RECORD_TYPE_LABELS,
 SEVERITY_LABELS,
 CATEGORY_LABELS,
 formatDate,
 formatDateShort,
 getDaysUntilExpiry,
 getExpiryUrgency,
 getSeverityColor,
 getRecordTypeIcon,
 filterHealthRecords,
 sortHealthRecords
} from '../types';

interface HealthTimelineViewProps {
 records: HealthRecord[];
 loading: boolean;
 selectedIds: string[];
 filters: HealthFilters;
 sort: HealthSort;
 onToggleSelect: (id: string, selected: boolean) => void;
 onToggleAll: (selected: boolean) => void;
 onFiltersChange: (filters: Partial<HealthFilters>) => void;
 onSortChange: (sort: HealthSort) => void;
 onExport: (records: HealthRecord[]) => void;
 onEdit: (record: HealthRecord) => void;
 onDelete: (record: HealthRecord) => void;
 onToggleActive: (record: HealthRecord) => void;
}

export default function HealthTimelineView({
 records,
 loading,
 selectedIds,
 filters,
 sort,
 onToggleSelect,
 onToggleAll,
 onFiltersChange,
 onSortChange,
 onExport,
 onEdit,
 onDelete,
 onToggleActive
}: HealthTimelineViewProps) {
 const [showFilters, setShowFilters] = useState(false);

 const filteredRecords = filterHealthRecords(records, filters);
 const sortedRecords = sortHealthRecords(filteredRecords, sort);

 const allSelected = sortedRecords.length > 0 && 
 sortedRecords.every(r => selectedIds.includes(r.id));
 const someSelected = sortedRecords.some(r => selectedIds.includes(r.id));

 const handleSort = (field: HealthSort['field']) => {
 onSortChange({
 field,
 direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
 });
 };

 // Group records by month for timeline display
 const groupedRecords = sortedRecords.reduce((groups, record) => {
 const monthKey = new Date(record.date_recorded).toISOString().slice(0, 7);
 if (!groups[monthKey]) {
 groups[monthKey] = [];
 }
 groups[monthKey].push(record);
 return groups;
 }, {} as Record<string, HealthRecord[]>);

 const sortedMonths = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

 if (loading) {
 return (
 <Card className="p-lg">
 <div className="space-y-lg">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="space-y-md">
 <div className="h-icon-md w-component-xl bg-muted animate-pulse rounded" />
 <div className="space-y-sm">
 {[...Array(2)].map((_, j) => (
 <div key={j} className="flex gap-md p-md border rounded-lg">
 <div className="h-icon-2xl w-icon-2xl bg-muted animate-pulse rounded-full" />
 <div className="flex-1 space-y-xs">
 <div className="h-icon-sm w-container-xs bg-muted animate-pulse rounded" />
 <div className="h-icon-xs w-full bg-muted animate-pulse rounded" />
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 {/* Header */}
 <Card className="p-md">
 <div className="flex flex-col gap-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected && !allSelected}
 onCheckedChange={onToggleAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedIds.length > 0 && `${selectedIds.length} selected`}
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setShowFilters(!showFilters)}
 >
 <Filter className="mr-2 h-icon-xs w-icon-xs" />
 Filters
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => onExport(sortedRecords.filter(r => selectedIds.includes(r.id)))}
 disabled={selectedIds.length === 0}
 >
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export
 </Button>
 </div>
 </div>

 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3 top-sm h-icon-xs w-icon-xs text-muted-foreground" />
 <Input
 placeholder="Search health records..."
 value={filters.search}
 onChange={(e) => onFiltersChange({ search: e.target.value })}
 className="pl-10"
 />
 </div>

 {/* Filters */}
 {showFilters && (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md pt-4 border-t">
 <Select
 value={filters.record_type || 'all'}
 onValueChange={(value) => onFiltersChange({ record_type: value as unknown })}
 >
 <SelectTrigger>
 <SelectValue placeholder="All Types" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Types</SelectItem>
 {Object.entries(RECORD_TYPE_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select
 value={filters.severity || 'all'}
 onValueChange={(value) => onFiltersChange({ severity: value as unknown })}
 >
 <SelectTrigger>
 <SelectValue placeholder="All Severities" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Severities</SelectItem>
 {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select
 value={filters.category || 'all'}
 onValueChange={(value) => onFiltersChange({ category: value as unknown })}
 >
 <SelectTrigger>
 <SelectValue placeholder="All Categories" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Categories</SelectItem>
 {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select
 value={filters.is_active || 'all'}
 onValueChange={(value) => onFiltersChange({ is_active: value as unknown })}
 >
 <SelectTrigger>
 <SelectValue placeholder="All Records" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Records</SelectItem>
 <SelectItem value="active">Active Only</SelectItem>
 <SelectItem value="inactive">Inactive Only</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}

 {/* Sort */}
 <div className="flex items-center gap-xs text-sm">
 <span className="text-muted-foreground">Sort by:</span>
 <Button
 variant={sort.field === 'date_recorded' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => handleSort('date_recorded')}
 >
 Date Recorded
 </Button>
 <Button
 variant={sort.field === 'expiry_date' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => handleSort('expiry_date')}
 >
 Expiry Date
 </Button>
 <Button
 variant={sort.field === 'severity' ? 'default' : 'ghost'}
 size="sm"
 onClick={() => handleSort('severity')}
 >
 Severity
 </Button>
 </div>
 </div>
 </Card>

 {/* Timeline */}
 {sortedRecords.length === 0 ? (
 <Card className="p-xsxl text-center">
 <div className="flex flex-col items-center gap-md">
 <Activity className="h-icon-2xl w-icon-2xl text-muted-foreground" />
 <div>
 <h3 className="text-lg font-semibold">No Health Records Found</h3>
 <p className="text-muted-foreground mt-2">
 {filters.search || filters.record_type !== 'all' || filters.severity !== 'all'
 ? 'Try adjusting your filters'
 : 'Add your first health record to get started'}
 </p>
 </div>
 </div>
 </Card>
 ) : (
 <div className="space-y-lg">
 {sortedMonths.map((monthKey) => {
 const monthRecords = groupedRecords[monthKey];
 const monthDate = new Date(monthKey + '-01');
 
 return (
 <div key={monthKey} className="space-y-md">
 <div className="flex items-center gap-sm">
 <Calendar className="h-icon-sm w-icon-sm text-muted-foreground" />
 <h3 className="text-lg font-semibold">
 {monthDate.toLocaleDateString('en-US', { 
 year: 'numeric', 
 month: 'long' 
 })}
 </h3>
 <Badge variant="outline">{monthRecords.length} records</Badge>
 </div>
 
 <div className="space-y-sm ml-8 border-l-2 border-muted pl-6">
 {monthRecords.map((record, index) => {
 const isSelected = selectedIds.includes(record.id);
 const daysUntilExpiry = record.expiry_date ? getDaysUntilExpiry(record.expiry_date) : null;
 const expiryUrgency = daysUntilExpiry !== null ? getExpiryUrgency(daysUntilExpiry) : null;
 
 return (
 <Card
 key={record.id}
 className={`p-md transition-colors relative ${
 isSelected ? 'bg-muted/50 border-primary' : 'hover:bg-muted/30'
 }`}
 >
 {/* Timeline dot */}
 <div className="absolute -left-9 top-lg w-icon-xs h-icon-xs rounded-full bg-background border-2 border-primary flex items-center justify-center">
 <span className="text-xs">{getRecordTypeIcon(record.record_type)}</span>
 </div>
 
 <div className="flex items-start gap-md">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onToggleSelect(record.id, !!checked)}
 />
 
 <div className="flex-1 space-y-sm">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-xs mb-1">
 <h4 className="font-semibold">{record.title}</h4>
 <Badge variant="outline">
 {RECORD_TYPE_LABELS[record.record_type]}
 </Badge>
 {record.severity && (
 <Badge 
 variant="outline" 
 className={`border-${getSeverityColor(record.severity)}-500`}
 >
 {SEVERITY_LABELS[record.severity]}
 </Badge>
 )}
 {!record.is_active && (
 <Badge variant="outline" className="text-muted-foreground">
 Inactive
 </Badge>
 )}
 </div>
 
 <div className="flex items-center gap-md text-sm text-muted-foreground">
 <span>{formatDateShort(record.date_recorded)}</span>
 {record.provider && (
 <span>• {record.provider}</span>
 )}
 {record.expiry_date && (
 <span className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 Expires {formatDateShort(record.expiry_date)}
 </span>
 )}
 </div>
 </div>
 
 <div className="flex items-center gap-xs">
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
 
 {record.description && (
 <p className="text-sm text-muted-foreground line-clamp-xs">
 {record.description}
 </p>
 )}
 
 {/* Expiry Alert */}
 {record.expiry_date && daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
 <div className={`flex items-center gap-xs p-xs rounded text-sm ${
 expiryUrgency === 'critical' ? 'bg-destructive/10 text-destructive' :
 expiryUrgency === 'high' ? 'bg-orange-50 text-orange-700' :
 'bg-yellow-50 text-yellow-700'
 }`}>
 {daysUntilExpiry < 0 ? (
 <AlertTriangle className="h-icon-xs w-icon-xs" />
 ) : (
 <Clock className="h-icon-xs w-icon-xs" />
 )}
 <span>
 {daysUntilExpiry < 0 
 ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
 : daysUntilExpiry === 0
 ? 'Expires today'
 : `Expires in ${daysUntilExpiry} days`
 }
 </span>
 {record.reminder_enabled && (
 <Bell className="h-3 w-3 ml-auto" />
 )}
 </div>
 )}
 
 {record.tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {record.tags.slice(0, 3).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 {record.tags.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{record.tags.length - 3} more
 </Badge>
 )}
 </div>
 )}
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
