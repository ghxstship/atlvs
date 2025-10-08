'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2, Download, Filter, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useMemo, type ChangeEvent } from 'react';
import { Card, Badge, Button, Checkbox, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import type { ContactInfo, ContactFilters, ContactSort } from '../types';
import { formatPhoneNumber } from '../types';

interface ContactListViewProps {
 contacts: ContactInfo[];
 loading: boolean;
 selectedItems: string[];
 filters: ContactFilters;
 sort: ContactSort;
 onSelectItem: (id: string, selected: boolean) => void;
 onSelectAll: (ids: string[], selected: boolean) => void;
 onChangeFilters: (filters: Partial<ContactFilters>) => void;
 onChangeSort: (sort: ContactSort) => void;
 onExport: (contact?: ContactInfo) => void;
 onViewContact?: (contact: ContactInfo) => void;
}

const verificationBadges: Record<string, { label: string; variant: 'default' | 'outline' | 'destructive' | 'secondary' }> = {
 verified: { label: 'Verified', variant: 'default' },
 pending: { label: 'Pending Verification', variant: 'secondary' },
 unverified: { label: 'Unverified', variant: 'destructive' }
};

export default function ContactListView({
 contacts,
 loading,
 selectedItems,
 filters,
 sort,
 onSelectItem,
 onSelectAll,
 onChangeFilters,
 onChangeSort,
 onExport,
 onViewContact
}: ContactListViewProps) {
 const allSelected = contacts.length > 0 && contacts.every(contact => selectedItems.includes(contact.id));
 const someSelected = contacts.some(contact => selectedItems.includes(contact.id));

 const sortedContacts = useMemo(() => {
 const sorted = [...contacts];
 sorted.sort((a, b) => {
 const aValue = (a[sort.field] || '').toString().toLowerCase();
 const bValue = (b[sort.field] || '').toString().toLowerCase();
 if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
 if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
 return 0;
 });
 return sorted;
 }, [contacts, sort]);

 const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
 const checked = event.target.checked;
 onSelectAll(contacts.map(contact => contact.id), checked);
 };

 const handleSort = (field: keyof ContactInfo) => {
 const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
 onChangeSort({ field, direction });
 };

 if (loading) {
 return (
 <Card className="p-lg space-y-md">
 <div className="animate-pulse space-y-xs">
 <div className="h-icon-xs bg-muted rounded w-1/3"></div>
 <div className="h-icon-xs bg-muted rounded w-1/2"></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 {Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="h-component-md bg-muted rounded animate-pulse"></div>
 ))}
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-md">
 <Card className="p-md space-y-md">
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-md">
 <div className="flex flex-1 items-center gap-md">
 <div className="relative flex-1 max-w-lg">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search contacts by phone, address, or emergency contact..."
 value={filters.search || ''}
 onChange={(event) => onChangeFilters({ search: event.target.value })}
 className="pl-9"
 />
 </div>
 <Button variant="outline" size="sm" className="flex items-center gap-xs">
 <Filter className="h-icon-xs w-icon-xs" />
 Filters
 </Button>
 </div>

 <div className="flex items-center gap-xs">
 {selectedItems.length > 0 && (
 <Button variant="outline" size="sm" onClick={() => onExport()}>
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export Selected
 </Button>
 )}
 <Badge variant="secondary">
 {selectedItems.length > 0
 ? `${selectedItems.length} selected`
 : `${contacts.length} contacts`}
 </Badge>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <Select
 value={filters.verification_status || 'all'}
 onValueChange={(value) => onChangeFilters({ verification_status: value as ContactFilters['verification_status'] })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Verification status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Verification Status</SelectItem>
 <SelectItem value="verified">Verified</SelectItem>
 <SelectItem value="pending">Pending</SelectItem>
 <SelectItem value="unverified">Unverified</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.preferred_contact_method || 'all'}
 onValueChange={(value) => onChangeFilters({ preferred_contact_method: value as ContactFilters['preferred_contact_method'] })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Preferred contact method" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Contact Methods</SelectItem>
 <SelectItem value="email">Email</SelectItem>
 <SelectItem value="phone">Phone</SelectItem>
 <SelectItem value="sms">SMS</SelectItem>
 <SelectItem value="mail">Mail</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.has_emergency_contact ? 'true' : 'false'}
 onValueChange={(value) => onChangeFilters({ has_emergency_contact: value === 'true' })}
 >
 <SelectTrigger>
 <SelectValue placeholder="Emergency contact filter" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="false">All Contacts</SelectItem>
 <SelectItem value="true">With Emergency Contact</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </Card>

 <Card className="overflow-hidden">
 <table className="w-full text-sm">
 <thead className="bg-muted/50">
 <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
 <th className="p-sm w-icon-xl">
 <Checkbox
 checked={allSelected}
 indeterminate={someSelected && !allSelected}
 onChange={handleSelectAll}
 />
 </th>
 <th className="p-sm cursor-pointer" onClick={() => handleSort('phone_primary')}>
 Primary Phone
 </th>
 <th className="p-sm cursor-pointer" onClick={() => handleSort('address_line1')}>
 Address
 </th>
 <th className="p-sm cursor-pointer" onClick={() => handleSort('verification_status')}>
 Verification
 </th>
 <th className="p-sm">Emergency Contact</th>
 <th className="p-sm cursor-pointer" onClick={() => handleSort('preferred_contact_method')}>
 Preferred Method
 </th>
 <th className="p-sm">Actions</th>
 </tr>
 </thead>
 <tbody>
 {sortedContacts.length === 0 ? (
 <tr>
 <td colSpan={7} className="p-xl text-center text-muted-foreground">
 No contacts match the current filters.
 </td>
 </tr>
 ) : (
 sortedContacts.map(contact => {
 const isSelected = selectedItems.includes(contact.id);
 const verificationBadge = verificationBadges[contact.verification_status || 'unverified'];
 return (
 <tr key={contact.id} className="border-t border-border/60 hover:bg-muted/40">
 <td className="p-sm">
 <Checkbox
 checked={isSelected}
 onChange={(event) =>
 onSelectItem(contact.id, event.target.checked)
 }
 />
 </td>
 <td className="p-sm">
 <div className="flex items-center gap-xs">
 <Phone className="h-icon-xs w-icon-xs text-muted-foreground" />
 <span>{contact.phone_primary ? formatPhoneNumber(contact.phone_primary) : '—'}</span>
 </div>
 </td>
 <td className="p-sm">
 <div className="flex items-center gap-xs text-muted-foreground">
 <MapPin className="h-icon-xs w-icon-xs" />
 <span>
 {contact.address_line1
 ? `${contact.address_line1}, ${contact.city || ''} ${contact.state_province || ''}`
 : 'No address'}
 </span>
 </div>
 </td>
 <td className="p-sm">
 <Badge variant={verificationBadge.variant}>
 <div className="flex items-center gap-xs">
 <ShieldCheck className="h-icon-xs w-icon-xs" />
 {verificationBadge.label}
 </div>
 </Badge>
 </td>
 <td className="p-sm text-muted-foreground">
 {contact.emergency_contact_name || '—'}
 </td>
 <td className="p-sm capitalize text-muted-foreground">
 {contact.preferred_contact_method || 'email'}
 </td>
 <td className="p-sm">
 <div className="flex items-center gap-xs">
 {onViewContact && (
 <Button variant="ghost" size="sm" onClick={() => onViewContact(contact)}>
 View
 </Button>
 )}
 <Button variant="outline" size="sm" onClick={() => onExport(contact)}>
 Export
 </Button>
 </div>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </Card>
 </div>
 );
}
