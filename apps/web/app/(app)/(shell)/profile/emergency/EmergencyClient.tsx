'use client';

import { FileText, Contact2, Users, Table, BarChart3, RefreshCw, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
 Button,
 Card,
 Tabs,
 TabsList,
 TabsTrigger,
 TabsContent,
 Badge
} from '@ghxstship/ui';
import type {
 EmergencyContact,
 EmergencyContactFilters,
 EmergencyContactSort,
 EmergencyContactStats,
 EmergencyContactAnalytics,
 EmergencyViewType,
 EmergencyContactFormData
} from './types';
import {
 VIEW_CONFIG,
 QUICK_FILTERS,
 createEmptyFormData,
 createEmptyStats,
 createEmptyAnalytics,
 validateEmergencyForm,
 formatPhone
} from './types';
import EmergencyFormView from './views/EmergencyFormView';
import EmergencyCardView from './views/EmergencyCardView';
import EmergencyRosterView from './views/EmergencyRosterView';
import EmergencyTableView from './views/EmergencyTableView';
import EmergencyAnalyticsView from './views/EmergencyAnalyticsView';

const DEFAULT_FILTERS: EmergencyContactFilters = {
 search: '',
 priority: 'all',
 verification_status: 'all',
 is_primary: 'all',
 availability: 'all'
};

const DEFAULT_SORT: EmergencyContactSort = {
 field: 'priority_level',
 direction: 'asc'
};

interface EmergencyClientProps {
 orgId: string;
 userId: string;
}

interface FetchContactsResponse {
 contacts: EmergencyContact[];
 total: number;
 stats: EmergencyContactStats;
}

function EmergencyClient({ orgId, userId }: EmergencyClientProps) {
 const [contacts, setContacts] = useState<EmergencyContact[]>([]);
 const [stats, setStats] = useState<EmergencyContactStats>(createEmptyStats());
 const [analytics, setAnalytics] = useState<EmergencyContactAnalytics>(createEmptyAnalytics());
 const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
 const [formData, setFormData] = useState<EmergencyContactFormData>(createEmptyFormData());
 const [formErrors, setFormErrors] = useState<Record<string, string>({});
 const [filters, setFilters] = useState<EmergencyContactFilters>(DEFAULT_FILTERS);
 const [sort, setSort] = useState<EmergencyContactSort>(DEFAULT_SORT);
 const [view, setView] = useState<EmergencyViewType>('form');
 const [selectedIds, setSelectedIds] = useState<string[]>([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [analyticsLoading, setAnalyticsLoading] = useState(false);

 const selectedContact = useMemo(() => {
 if (!selectedContactId) return null;
 return contacts.find(contact => contact.id === selectedContactId) ?? null;
 }, [contacts, selectedContactId]);

 const fetchContacts = useCallback(async () => {
 try {
 setLoading(true);
 const params = new URLSearchParams();
 params.append('view_all', 'true');
 Object.entries(filters).forEach(([key, value]) => {
 if (value !== undefined && value !== null) {
 params.append(key, String(value));
 }
 });

 const response = await fetch(`/api/v1/profile/emergency?${params.toString()}`);
 if (!response.ok) {
 throw new Error('Failed to load emergency contacts');
 }

 const data = await response.json() as FetchContactsResponse;
 const nextContacts = data.contacts ?? [];
 setContacts(nextContacts);
 setStats(data.stats ?? createEmptyStats());

 setSelectedIds(prev => prev.filter(id => nextContacts.some(contact => contact.id === id)));

 if (nextContacts.length === 0) {
 setSelectedContactId(null);
 setFormData(createEmptyFormData());
 return;
 }

 const existingSelection = selectedContactId
 ? nextContacts.find(contact => contact.id === selectedContactId)
 : undefined;

 const nextSelected = existingSelection
 || nextContacts.find(contact => contact.is_primary)
 || nextContacts[0];

 setSelectedContactId(nextSelected.id);
 setFormData(mapContactToForm(nextSelected));
 } catch (error) {
 console.error('Error loading emergency contacts:', error);
 setContacts([]);
 setStats(createEmptyStats());
 setSelectedContactId(null);
 setFormData(createEmptyFormData());
 } finally {
 setLoading(false);
 }
 }, [filters, selectedContactId]);

 const fetchAnalytics = useCallback(async () => {
 try {
 setAnalyticsLoading(true);
 const response = await fetch('/api/v1/profile/emergency/analytics');
 if (!response.ok) {
 throw new Error('Failed to load emergency analytics');
 }
 const data = await response.json() as EmergencyContactAnalytics;
 setAnalytics(data);
 } catch (error) {
 console.error('Error fetching emergency analytics:', error);
 setAnalytics(createEmptyAnalytics());
 } finally {
 setAnalyticsLoading(false);
 }
 }, []);

 useEffect(() => {
 void fetchContacts();
 }, [fetchContacts]);

 useEffect(() => {
 if (view === 'analytics') {
 void fetchAnalytics();
 }
 }, [view, fetchAnalytics]);

 const handleFieldChange = useCallback((field: keyof EmergencyContactFormData, value: EmergencyContactFormData[keyof EmergencyContactFormData]) => {
 setFormData(prev => ({
 ...prev,
 [field]: value
 }));
 setFormErrors(prev => {
 if (!prev[field]) return prev;
 const next = { ...prev };
 delete next[field];
 return next;
 });
 }, []);

 const handleNewContact = useCallback(() => {
 setSelectedContactId(null);
 setFormData(createEmptyFormData());
 setFormErrors({});
 }, []);

 const handleSave = useCallback(async () => {
 const errors = validateEmergencyForm(formData);
 if (Object.keys(errors).length > 0) {
 setFormErrors(errors);
 return;
 }

 const payload = mapFormToPayload(formData);

 try {
 setSaving(true);
 const endpoint = selectedContact
 ? `/api/v1/profile/emergency?contact_id=${selectedContact.id}`
 : '/api/v1/profile/emergency';

 const response = await fetch(endpoint, {
 method: selectedContact ? 'PUT' : 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload)
 });

 if (!response.ok) {
 throw new Error('Failed to save emergency contact');
 }

 await Promise.all([
 fetchContacts(),
 view === 'analytics' ? fetchAnalytics() : Promise.resolve(),
 ]);
 } catch (error) {
 console.error('Error saving emergency contact:', error);
 } finally {
 setSaving(false);
 }
}, [fetchAnalytics, fetchContacts, formData, selectedContact, view]);

  const handleVerify = useCallback(async (contactId: string) => {
    try {
      const response = await fetch(`/api/v1/profile/emergency?contact_id=${contactId}&action=verify`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to verify emergency contact');
      }
      await fetchContacts();
    } catch (error) {
      console.error('Error verifying emergency contact:', error);
    }
  }, [fetchContacts]);

  const handleVerifyContact = useCallback((contact: EmergencyContact) => {
    void handleVerify(contact.id);
  }, [handleVerify]);

  const handleDelete = useCallback(async (contactId: string) => {
    if (!confirm('Delete this emergency contact?')) {
      return;
    }
    try {
      const response = await fetch(`/api/v1/profile/emergency?contact_id=${contactId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete emergency contact');
      }
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
    }
  }, [fetchContacts]);

 const handleSelectContact = useCallback((contact: EmergencyContact) => {
 setSelectedContactId(contact.id);
 setFormData(mapContactToForm(contact));
 setView('form');
 }, []);

 const handleSelectItem = useCallback((id: string, selected: boolean) => {
 setSelectedIds(prev => {
 if (selected) {
 return prev.includes(id) ? prev : [...prev, id];
 }
 return prev.filter(existing => existing !== id);
 });
 }, []);

 const handleSelectAll = useCallback((ids: string[], selected: boolean) => {
 setSelectedIds(selected ? Array.from(new Set([...selectedIds, ...ids])) : []);
 }, [selectedIds]);

 const handleFiltersChange = useCallback((nextFilters: Partial<EmergencyContactFilters>) => {
 setFilters(prev => ({ ...prev, ...nextFilters }));
 }, []);

 const handleSortChange = useCallback((nextSort: EmergencyContactSort) => {
 setSort(nextSort);
 }, []);

 const handleExport = useCallback((list: EmergencyContact[]) => {
 const exportList = list.length > 0 ? list : contacts.filter(contact => selectedIds.includes(contact.id));
 if (exportList.length === 0) {
 console.warn('No contacts selected for export');
 return;
 }

 const rows = [
 ['Name', 'Relationship', 'Priority', 'Primary Phone', 'Email', 'Address', 'Verification', 'Primary', 'Backup'],
 ...exportList.map(contact => [
 contact.name,
 contact.relationship,
 contact.priority_level,
 formatPhone(contact.phone_primary),
 contact.email ?? '',
 formatAddressString(contact),
 contact.verification_status,
 contact.is_primary ? 'Yes' : 'No',
 contact.is_backup ? 'Yes' : 'No',
 ]),
 ];

 const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
 const blob = new Blob([csv], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `emergency-contacts-${new Date().toISOString().split('T')[0]}.csv`;
 link.click();
 URL.revokeObjectURL(url);
 }, [contacts, selectedIds]);

 const iconMap: Record<EmergencyViewType, LucideIcon> = useMemo(() => ({
 form: FileText,
 card: Contact2,
 roster: Users,
 table: Table,
 analytics: BarChart3
 }), []);

 const quickFilterValue = useMemo(() => {
 if (filters.is_primary === 'primary') return 'primary';
 if (filters.is_primary === 'backup') return 'backup';
 if (filters.priority === 'critical') return 'critical';
 if (filters.verification_status === 'pending') return 'pending';
 return 'all';
 }, [filters]);

 return (
 <div className="space-y-lg">
 <Card className="p-md flex flex-col gap-md md:flex-row md:items-center md:justify-between">
 <div className="space-y-xs">
 <div className="flex items-center gap-xs">
 <Badge variant="outline">Emergency</Badge>
 <span className="text-sm text-muted-foreground">
 {selectedContact?.verification_status === 'verified' ? (
 <span className="text-green-600 flex items-center gap-xs">
 <ShieldCheck className="h-icon-xs w-icon-xs" /> Contact verified
 </span>
 ) : (
 <span className="text-yellow-600 flex items-center gap-xs">
 <ShieldAlert className="h-icon-xs w-icon-xs" /> Verification pending
 </span>
 )}
 </span>
 </div>
 <h1 className="text-2xl font-semibold">Emergency Contacts</h1>
 <p className="text-sm text-muted-foreground">
 {selectedContact
 ? `${selectedContact.name} · ${selectedContact.relationship} · ${formatPhone(selectedContact.phone_primary)}`
 : 'Create a new emergency contact or select one from the roster.'}
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-xs">
 <Button variant="outline" size="sm" onClick={handleNewContact}>
 New Contact
 </Button>
 <Button variant="outline" size="sm" onClick={() => {
 fetchContacts();
 if (view === 'analytics') fetchAnalytics();
 }}>
 <RefreshCw className="mr-2 h-icon-xs w-icon-xs" />
 Refresh
 </Button>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex flex-wrap gap-xs">
 {QUICK_FILTERS.map(filter => (
 <Button
 key={filter.value}
 variant={quickFilterValue === filter.value ? 'default' : 'outline'}
 size="sm"
 onClick={() => {
 switch (filter.value) {
 case 'primary':
 setFilters(prev => ({ ...prev, is_primary: 'primary' }));
 break;
 case 'backup':
 setFilters(prev => ({ ...prev, is_primary: 'backup' }));
 break;
 case 'critical':
 setFilters(prev => ({ ...prev, priority: 'critical' }));
 break;
 case 'pending':
 setFilters(prev => ({ ...prev, verification_status: 'pending' }));
 break;
 default:
 setFilters(DEFAULT_FILTERS);
 }
 }}
 >
 {filter.label}
 </Button>
 ))}
 </div>
 </Card>

 <Tabs value={view} onValueChange={(value) => setView(value as EmergencyViewType)}>
 <TabsList className="grid grid-cols-5 w-full">
 {Object.entries(VIEW_CONFIG).map(([key, { label }]) => {
 const Icon = iconMap[key as EmergencyViewType] ?? FileText;
 return (
 <TabsTrigger key={key} value={key} className="flex items-center gap-xs">
 <Icon className="h-icon-xs w-icon-xs" />
 {label}
 </TabsTrigger>
 );
 })}
 </TabsList>

 <TabsContent value="form">
 <EmergencyFormView
 contact={selectedContact}
 formData={formData}
 formErrors={formErrors}
 loading={loading}
 saving={saving}
 onFieldChange={handleFieldChange}
 onSave={handleSave}
 onVerify={selectedContact ? () => handleVerify(selectedContact.id) : undefined}
 />
 </TabsContent>

 <TabsContent value="card">
 <EmergencyCardView
 contact={selectedContact}
 loading={loading}
 onEdit={() => setView('form')}
 onVerify={selectedContact ? () => handleVerify(selectedContact.id) : undefined}
 />
 </TabsContent>

 <TabsContent value="roster">
 <EmergencyRosterView
 contacts={contacts}
 loading={loading}
 selectedIds={selectedIds}
 filters={filters}
 onToggleSelect={handleSelectItem}
 onToggleSelectAll={(selected) => handleSelectAll(contacts.map(contact => contact.id), selected)}
 onFiltersChange={handleFiltersChange}
 onExport={handleExport}
 onEdit={handleSelectContact}
 onDelete={handleDelete}
 onVerify={handleVerifyContact}
 />
 </TabsContent>

 <TabsContent value="table">
 <EmergencyTableView
 contacts={contacts}
 loading={loading}
 selectedIds={selectedIds}
 filters={filters}
 sort={sort}
 onToggleSelect={handleSelectItem}
 onToggleAll={(selected) => handleSelectAll(contacts.map(contact => contact.id), selected)}
 onFiltersChange={handleFiltersChange}
 onSortChange={handleSortChange}
 onExport={handleExport}
 onEdit={handleSelectContact}
 onVerify={handleVerifyContact}
 />
 </TabsContent>

 <TabsContent value="analytics">
 <EmergencyAnalyticsView
 stats={stats}
 analytics={analytics}
 loading={loading}
 analyticsLoading={analyticsLoading}
 />
 </TabsContent>
 </Tabs>
 </div>
 );
}

function mapContactToForm(contact: EmergencyContact): EmergencyContactFormData {
 return {
 name: contact.name,
 relationship: contact.relationship,
 phone_primary: contact.phone_primary,
 phone_secondary: contact.phone_secondary ?? '',
 email: contact.email ?? '',
 address: contact.address ?? '',
 city: contact.city ?? '',
 state_province: contact.state_province ?? '',
 country: contact.country ?? '',
 postal_code: contact.postal_code ?? '',
 notes: contact.notes ?? '',
 is_primary: contact.is_primary,
 is_backup: contact.is_backup,
 priority_level: contact.priority_level,
 availability: contact.availability ?? '24_7',
 response_time_minutes: contact.response_time_minutes ?? 15,
 verification_status: contact.verification_status
 };
}

function mapFormToPayload(data: EmergencyContactFormData) {
 return {
 name: data.name,
 relationship: data.relationship,
 phone_primary: data.phone_primary,
 phone_secondary: data.phone_secondary || null,
 email: data.email || null,
 address: data.address || null,
 city: data.city || null,
 state_province: data.state_province || null,
 country: data.country || null,
 postal_code: data.postal_code || null,
 notes: data.notes || null,
 is_primary: data.is_primary,
 is_backup: data.is_backup,
 priority_level: data.priority_level,
 availability: data.availability || null,
 response_time_minutes: data.response_time_minutes ?? null,
 verification_status: data.verification_status
 };
}

function formatAddressString(contact: EmergencyContact): string {
 return [
 contact.address ?? '',
 contact.city ?? '',
 contact.state_province ?? '',
 contact.postal_code ?? '',
 contact.country ?? '',
 ].filter(Boolean).join(', ');
}

// Wrapper component for ModuleTemplate compatibility
export function EmergencyTabComponent({ user, orgId }: { user: unknown; orgId: string }) {
 return <EmergencyClient orgId={orgId} userId={user?.id || ''} />;
}

export default EmergencyClient;
