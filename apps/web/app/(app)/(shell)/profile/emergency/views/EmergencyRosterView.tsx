'use client';

import { Edit, Filter, Mail, MapPin, PhoneCall, Search, ShieldAlert, ShieldCheck, Trash2, User, UserCheck } from "lucide-react";
import { useMemo, type ChangeEvent } from 'react';
import {
 Badge,
 Button,
 Card,
 Checkbox,
 Input,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue
} from '@ghxstship/ui';
import type { EmergencyContact, EmergencyContactFilters } from '../types';
import { formatPhone, formatAddress } from '../types';

interface EmergencyRosterViewProps {
 contacts: EmergencyContact[];
 loading: boolean;
 selectedIds: string[];
 filters: EmergencyContactFilters;
 onToggleSelect: (id: string, selected: boolean) => void;
 onToggleSelectAll: (selected: boolean) => void;
 onFiltersChange: (filters: Partial<EmergencyContactFilters>) => void;
 onExport: (contacts: EmergencyContact[]) => void;
 onEdit: (contact: EmergencyContact) => void;
 onDelete: (contact: EmergencyContact) => void;
 onVerify: (contact: EmergencyContact) => void;
}

const verificationVariant: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
 verified: { label: 'Verified', variant: 'default' },
 pending: { label: 'Pending', variant: 'secondary' },
 unverified: { label: 'Unverified', variant: 'destructive' }
};

export default function EmergencyRosterView({
 contacts,
 loading,
 selectedIds,
 filters,
 onToggleSelect,
 onToggleSelectAll,
 onFiltersChange,
 onExport,
 onEdit,
 onDelete,
 onVerify
}: EmergencyRosterViewProps) {
 const allSelected = contacts.length > 0 && contacts.every(contact => selectedIds.includes(contact.id));
 const someSelected = contacts.some(contact => selectedIds.includes(contact.id));

 const filteredContacts = useMemo(() => contacts, [contacts]);

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
 {Array.from({ length: 6 }).map((_, index) => (
 <Card key={index} className="p-lg animate-pulse space-y-md">
 <div className="h-icon-xs bg-muted rounded w-2/3" />
 <div className="h-icon-xs bg-muted rounded w-1/2" />
 <div className="h-component-md bg-muted rounded" />
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 <Card className="p-md space-y-md">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-md">
 <div className="flex flex-1 items-center gap-sm">
 <div className="relative flex-1 max-w-lg">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <Input
 className="pl-9"
 placeholder="Search emergency contacts..."
 value={filters.search ?? ''}
 onChange={(event) => onFiltersChange({ search: event.target.value })}
 />
 </div>
 <Button variant="outline" size="sm" className="flex items-center gap-xs">
 <Filter className="h-icon-xs w-icon-xs" />
 Filters
 </Button>
 </div>

 <div className="flex items-center gap-sm">
 {selectedIds.length > 0 ? (
 <Button
 variant="outline"
 size="sm"
 onClick={() => onExport(contacts.filter(contact => selectedIds.includes(contact.id)))}
 >
 Export Selected ({selectedIds.length})
 </Button>
 ) : null}
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected && !allSelected}
 onChange={(event: ChangeEvent<HTMLInputElement>) => onToggleSelectAll(event.target.checked)}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sm">
 <Select
 value={filters.priority ?? 'all'}
 onChange={(e) => onFiltersChange({ priority: e.target.value as EmergencyContactFilters['priority'] })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Priority level" />
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
 onChange={(e) =>
 onFiltersChange({ verification_status: e.target.value as EmergencyContactFilters['verification_status'] })
 }
 >
 <SelectTrigger>
 <SelectValue placeholder="Verification status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All verification</SelectItem>
 <SelectItem value="verified">Verified</SelectItem>
 <SelectItem value="pending">Pending</SelectItem>
 <SelectItem value="unverified">Unverified</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.is_primary ?? 'all'}
 onChange={(e) => onFiltersChange({ is_primary: e.target.value as EmergencyContactFilters['is_primary'] })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Primary/backup" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All roles</SelectItem>
 <SelectItem value="primary">Primary only</SelectItem>
 <SelectItem value="backup">Backups only</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.availability ?? 'all'}
 onChange={(e) => onFiltersChange({ availability: e.target.value as EmergencyContactFilters['availability'] })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Availability" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All availability</SelectItem>
 <SelectItem value="24_7">24/7</SelectItem>
 <SelectItem value="business_hours">Business hours</SelectItem>
 <SelectItem value="night_only">Night only</SelectItem>
 <SelectItem value="weekends">Weekends</SelectItem>
 <SelectItem value="on_call">On call</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </Card>

 {filteredContacts.length === 0 ? (
 <Card className="p-xl text-center text-muted-foreground space-y-md">
 <ShieldAlert className="h-icon-2xl w-icon-2xl mx-auto text-muted-foreground" />
 <p>No emergency contacts match the selected filters.</p>
 </Card>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
 {filteredContacts.map(contact => {
 const verification = verificationVariant[contact.verification_status] ?? verificationVariant.pending;
 const selected = selectedIds.includes(contact.id);
 return (
 <Card key={contact.id} className="p-md space-y-md border-border">
 <div className="flex items-start justify-between gap-sm">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs">
 <Checkbox
 checked={selected}
 onChange={(event: ChangeEvent<HTMLInputElement>) =>
 onToggleSelect(contact.id, event.target.checked)
 }
 />
 <h3 className="text-lg font-semibold">{contact.name}</h3>
 </div>
 <div className="flex items-center gap-xs text-sm text-muted-foreground">
 <User className="h-icon-xs w-icon-xs" />
 <span>{contact.relationship}</span>
 </div>
 </div>
 <div className="flex flex-col items-end gap-xs">
 <Badge variant={verification.variant}>{verification.label}</Badge>
 <div className="flex items-center gap-xs">
 {contact.is_primary ? <Badge variant="primary">Primary</Badge> : null}
 {contact.is_backup ? <Badge variant="secondary">Backup</Badge> : null}
 </div>
 </div>
 </div>

 <div className="space-y-xs text-sm text-muted-foreground">
 <div className="flex items-center gap-xs">
 <PhoneCall className="h-icon-xs w-icon-xs" />
 <span>{formatPhone(contact.phone_primary)}</span>
 </div>
 {contact.phone_secondary ? (
 <div className="flex items-center gap-xs">
 <UserCheck className="h-icon-xs w-icon-xs" />
 <span>{formatPhone(contact.phone_secondary)}</span>
 </div>
 ) : null}
 {contact.email ? (
 <div className="flex items-center gap-xs">
 <Mail className="h-icon-xs w-icon-xs" />
 <span>{contact.email}</span>
 </div>
 ) : null}
 {formatAddress(contact) ? (
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 <span>{formatAddress(contact)}</span>
 </div>
 ) : null}
 </div>

 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span>Priority: {contact.priority_level.toUpperCase()}</span>
 {contact.availability ? <span>Availability: {contact.availability.replace('_', ' ')}</span> : null}
 </div>

 <div className="flex items-center justify-between gap-xs">
 <div className="flex gap-xs">
 <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
 Edit
 </Button>
 <Button variant="outline" size="sm" onClick={() => onDelete(contact)}>
 <Trash2 className="mr-1 h-icon-xs w-icon-xs" />
 Remove
 </Button>
 </div>
 {contact.verification_status !== 'verified' ? (
 <Button size="sm" onClick={() => onVerify(contact)}>
 Verify
 </Button>
 ) : null}
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>
 );
}
