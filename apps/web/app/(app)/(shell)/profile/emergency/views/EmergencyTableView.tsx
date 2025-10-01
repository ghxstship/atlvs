'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useMemo } from 'react';
import {
 Card,
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
 Checkbox,
 Button,
 Badge,
 Input,
 Select,
 SelectTrigger,
 SelectValue,
 SelectContent,
 SelectItem,
} from '@ghxstship/ui';
import type { EmergencyContact, EmergencyContactFilters, EmergencyContactSort } from '../types';
import { formatPhone, formatAddress } from '../types';

interface EmergencyTableViewProps {
 contacts: EmergencyContact[];
 loading: boolean;
 selectedIds: string[];
 filters: EmergencyContactFilters;
 sort: EmergencyContactSort;
 onToggleSelect: (id: string, selected: boolean) => void;
 onToggleAll: (selected: boolean) => void;
 onFiltersChange: (filters: Partial<EmergencyContactFilters>) => void;
 onSortChange: (sort: EmergencyContactSort) => void;
 onExport: (contacts: EmergencyContact[]) => void;
 onEdit: (contact: EmergencyContact) => void;
 onVerify: (contact: EmergencyContact) => void;
}

const verificationBadges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
 verified: { label: 'Verified', variant: 'default' },
 pending: { label: 'Pending', variant: 'secondary' },
 unverified: { label: 'Unverified', variant: 'destructive' },
};

export default function EmergencyTableView({
 contacts,
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
 onVerify,
}: EmergencyTableViewProps) {
 const allSelected = contacts.length > 0 && contacts.every(contact => selectedIds.includes(contact.id));
 const someSelected = contacts.some(contact => selectedIds.includes(contact.id));

 const sortedContacts = useMemo(() => {
 const copy = [...contacts];
 copy.sort((a, b) => {
 const aValue = (a[sort.field] ?? '').toString().toLowerCase();
 const bValue = (b[sort.field] ?? '').toString().toLowerCase();
 if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
 if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
 return 0;
 });
 return copy;
 }, [contacts, sort]);

 const handleSort = (field: EmergencyContactSort['field']) => {
 onSortChange({
 field,
 direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
 });
 };

 if (loading) {
 return (
 <Card className="p-lg space-y-md">
 <div className="h-icon-sm w-1/3 bg-muted rounded animate-pulse" />
 <div className="h-icon-sm w-full bg-muted rounded animate-pulse" />
 <div className="h-icon-sm w-2/3 bg-muted rounded animate-pulse" />
 </Card>
 );
 }

 return (
 <Card className="overflow-hidden">
 <div className="p-md space-y-sm">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-sm">
 <div className="flex-1 flex items-center gap-sm">
 <Input
 placeholder="Search emergency contacts..."
 value={filters.search ?? ''}
 onChange={(event) => onFiltersChange({ search: event.target.value })}
 />
 <Select
 value={filters.priority ?? 'all'}
 onValueChange={(value) => onFiltersChange({ priority: value as EmergencyContactFilters['priority'] })}
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="Priority" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All priorities</SelectItem>
 <SelectItem value="critical">Critical</SelectItem>
 <SelectItem value="high">High</SelectItem>
 <SelectItem value="medium">Medium</SelectItem>
 <SelectItem value="low">Low</SelectItem>
 </SelectContent>
 </Select>
 <Select
 value={filters.verification_status ?? 'all'}
 onValueChange={(value) => onFiltersChange({ verification_status: value as EmergencyContactFilters['verification_status'] })}
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="Verification" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All statuses</SelectItem>
 <SelectItem value="verified">Verified</SelectItem>
 <SelectItem value="pending">Pending</SelectItem>
 <SelectItem value="unverified">Unverified</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="flex items-center gap-sm">
 {selectedIds.length > 0 ? (
 <Button
 variant="outline"
 size="sm"
 onClick={() => onExport(contacts.filter(contact => selectedIds.includes(contact.id)))}
 >
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export ({selectedIds.length})
 </Button>
 ) : null}
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected && !allSelected}
 onChange={(event) => onToggleAll(event.target.checked)}
 />
 </div>
 </div>
 </div>

 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-icon-2xl">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected && !allSelected}
 onChange={(event) => onToggleAll(event.target.checked)}
 />
 </TableHead>
 <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
 Name <ArrowUpDown className="inline h-icon-xs w-icon-xs ml-1 text-muted-foreground" />
 </TableHead>
 <TableHead onClick={() => handleSort('relationship')} className="cursor-pointer">
 Relationship <ArrowUpDown className="inline h-icon-xs w-icon-xs ml-1 text-muted-foreground" />
 </TableHead>
 <TableHead>Contact Info</TableHead>
 <TableHead onClick={() => handleSort('priority_level')} className="cursor-pointer">
 Priority <ArrowUpDown className="inline h-icon-xs w-icon-xs ml-1 text-muted-foreground" />
 </TableHead>
 <TableHead>Status</TableHead>
 <TableHead>Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {sortedContacts.length === 0 ? (
 <TableRow>
 <TableCell colSpan={7} className="py-xl text-center text-muted-foreground">
 No emergency contacts found.
 </TableCell>
 </TableRow>
 ) : (
 sortedContacts.map(contact => {
 const selected = selectedIds.includes(contact.id);
 const verificationBadge = verificationBadges[contact.verification_status] ?? verificationBadges.pending;
 return (
 <TableRow key={contact.id} className={selected ? 'bg-muted/30' : undefined}>
 <TableCell>
 <Checkbox
 checked={selected}
 onChange={(event) => onToggleSelect(contact.id, event.target.checked)}
 />
 </TableCell>
 <TableCell className="font-medium">{contact.name}</TableCell>
 <TableCell>{contact.relationship}</TableCell>
 <TableCell className="space-y-xs text-sm text-muted-foreground">
 <div>{formatPhone(contact.phone_primary)}</div>
 {contact.email ? <div>{contact.email}</div> : null}
 {formatAddress(contact) ? <div>{formatAddress(contact)}</div> : null}
 </TableCell>
 <TableCell>
 <Badge variant={contact.priority_level === 'critical' ? 'destructive' : 'secondary'}>
 {contact.priority_level.toUpperCase()}
 </Badge>
 </TableCell>
 <TableCell>
 <Badge variant={verificationBadge.variant} className="flex items-center gap-xs">
 {contact.verification_status === 'verified' ? (
 <ShieldCheck className="h-icon-xs w-icon-xs" />
 ) : (
 <ShieldAlert className="h-icon-xs w-icon-xs" />
 )}
 {verificationBadge.label}
 </Badge>
 </TableCell>
 <TableCell className="space-x-xs">
 <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
 Edit
 </Button>
 {contact.verification_status !== 'verified' ? (
 <Button size="sm" onClick={() => onVerify(contact)}>
 Verify
 </Button>
 ) : null}
 </TableCell>
 </TableRow>
 );
 })
 )}
 </TableBody>
 </Table>
 </Card>
 );
}
