'use client';

import { FileText, CreditCard, List, Map, BarChart3, RefreshCw, ShieldCheck, AlertTriangle, type LucideIcon } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
 Button, 
 Card,
 Tabs,
 TabsList,
 TabsTrigger,
 TabsContent,
 Badge,
} from '@ghxstship/ui';
import type { 
 ContactInfo,
 ContactFilters,
 ContactSort,
 ContactStats,
 ContactAnalytics,
 ViewType,
 ContactFormData,
} from './types';
import {
 VIEW_CONFIG,
 QUICK_FILTERS,
 createEmptyContact,
 createEmptyContactStats,
 createEmptyContactAnalytics,
 validateContactForm,
} from './types';
import ContactFormView from './views/ContactFormView';
import ContactCardView from './views/ContactCardView';
import ContactListView from './views/ContactListView';
import ContactMapView from './views/ContactMapView';
import ContactAnalyticsView from './views/ContactAnalyticsView';

const DEFAULT_FILTERS: ContactFilters = {
 search: '',
 verification_status: 'all',
 preferred_contact_method: 'all',
 has_emergency_contact: false,
};

const DEFAULT_SORT: ContactSort = {
 field: 'phone_primary',
 direction: 'asc',
};

interface ContactClientProps {
 orgId: string;
 userId: string;
}

export default function ContactClient({ orgId, userId }: ContactClientProps) {
 const [contact, setContact] = useState<ContactInfo | null>(null);
 const [contactsList, setContactsList] = useState<ContactInfo[]>([]);
 const [stats, setStats] = useState<ContactStats>(createEmptyContactStats());
 const [analytics, setAnalytics] = useState<ContactAnalytics>(createEmptyContactAnalytics());
 const [formData, setFormData] = useState<ContactFormData>(createEmptyContact());
 const [formErrors, setFormErrors] = useState<Record<string, string>({});
 const [filters, setFilters] = useState<ContactFilters>(DEFAULT_FILTERS);
 const [sort, setSort] = useState<ContactSort>(DEFAULT_SORT);
 const [view, setView] = useState<ViewType>('form');
 const [selectedItems, setSelectedItems] = useState<string[]>([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [analyticsLoading, setAnalyticsLoading] = useState(false);
 const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

 const fetchContact = useCallback(async () => {
 try {
 setLoading(true);
 const response = await fetch(`/api/v1/profile/contact?user_id=${userId}`);
 if (!response.ok) throw new Error('Failed to fetch contact');
 const data = await response.json();
 setContact(data);
 setFormData({
 phone_primary: data.phone_primary || '',
 phone_secondary: data.phone_secondary || '',
 phone_mobile: data.phone_mobile || '',
 phone_work: data.phone_work || '',
 phone_extension: data.phone_extension || '',
 address_line1: data.address_line1 || '',
 address_line2: data.address_line2 || '',
 city: data.city || '',
 state_province: data.state_province || '',
 postal_code: data.postal_code || '',
 country: data.country || '',
 billing_address_line1: data.billing_address_line1 || '',
 billing_address_line2: data.billing_address_line2 || '',
 billing_city: data.billing_city || '',
 billing_state_province: data.billing_state_province || '',
 billing_postal_code: data.billing_postal_code || '',
 billing_country: data.billing_country || '',
 billing_same_as_primary: data.billing_same_as_primary || false,
 emergency_contact_name: data.emergency_contact_name || '',
 emergency_contact_relationship: data.emergency_contact_relationship || '',
 emergency_contact_phone: data.emergency_contact_phone || '',
 emergency_contact_email: data.emergency_contact_email || '',
 timezone: data.timezone || '',
 preferred_contact_method: data.preferred_contact_method || 'email',
 do_not_contact: data.do_not_contact || false,
 contact_notes: data.contact_notes || '',
 });
 } catch (error) {
 console.error('Error fetching contact:', error);
 setContact(null);
 } finally {
 setLoading(false);
 }
 }, [userId]);

 const fetchContactsList = useCallback(async () => {
 try {
 const params = new URLSearchParams();
 params.append('view_all', 'true');
 Object.entries(filters).forEach(([key, value]) => {
 if (value !== undefined && value !== null) {
 params.append(key, String(value));
 }
 });

 const response = await fetch(`/api/v1/profile/contact?${params.toString()}`);
 if (!response.ok) {
 if (response.status === 403) {
 setContactsList(prev => (contact ? [contact] : prev));
 setStats(createEmptyContactStats());
 return;
 }
 throw new Error('Failed to fetch contacts list');
 }
 const data = await response.json();
 setContactsList(data.contacts || []);
 setStats(data.stats || createEmptyContactStats());
 } catch (error) {
 console.error('Error fetching contacts list:', error);
 setContactsList(contact ? [contact] : []);
 setStats(createEmptyContactStats());
 }
 }, [filters, contact]);

 const fetchAnalytics = useCallback(async () => {
 try {
 setAnalyticsLoading(true);
 const response = await fetch(`/api/v1/profile/contact/analytics`);
 if (!response.ok) throw new Error('Failed to fetch analytics');
 const data = await response.json();
 setAnalytics(data);
 } catch (error) {
 console.error('Error fetching contact analytics:', error);
 setAnalytics(createEmptyContactAnalytics());
 } finally {
 setAnalyticsLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchContact();
 }, [fetchContact]);

 useEffect(() => {
 fetchContactsList();
 }, [fetchContactsList]);

 useEffect(() => {
 if (view === 'analytics') {
 fetchAnalytics();
 }
 }, [view, fetchAnalytics]);

 const handleFieldChange = useCallback((field: keyof ContactFormData, value: unknown) => {
 setFormData(prev => ({
 ...prev,
 [field]: value,
 }));
 setFormErrors(prev => {
 if (!prev[field]) return prev;
 const next = { ...prev };
 delete next[field];
 return next;
 });
 }, []);

 const handleSave = useCallback(async () => {
 const errors = validateContactForm(formData);
 if (Object.keys(errors).length > 0) {
 setFormErrors(errors);
 return;
 }

 try {
 setSaving(true);
 const response = await fetch(`/api/v1/profile/contact?user_id=${userId}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(formData),
 });

 if (!response.ok) throw new Error('Failed to save contact');

 await Promise.all([
 fetchContact(),
 fetchContactsList(),
 view === 'analytics' ? fetchAnalytics() : Promise.resolve(),
 ]);
 } catch (error) {
 console.error('Error saving contact:', error);
 } finally {
 setSaving(false);
 }
 }, [formData, fetchContact, fetchContactsList, fetchAnalytics, userId, view]);

 const handleVerify = useCallback(async () => {
 try {
 const response = await fetch(`/api/v1/profile/contact?user_id=${userId}&action=verify`, {
 method: 'POST',
 });
 if (!response.ok) throw new Error('Failed to verify contact');
 await Promise.all([
 fetchContact(),
 fetchContactsList(),
 ]);
 } catch (error) {
 console.error('Error verifying contact:', error);
 }
 }, [fetchContact, fetchContactsList, userId]);

 const handleSelectContact = useCallback((contact: ContactInfo) => {
 setSelectedContactId(contact.id);
 setContact(contact);
 setFormData({
 phone_primary: contact.phone_primary || '',
 phone_secondary: contact.phone_secondary || '',
 phone_mobile: contact.phone_mobile || '',
 phone_work: contact.phone_work || '',
 phone_extension: contact.phone_extension || '',
 address_line1: contact.address_line1 || '',
 address_line2: contact.address_line2 || '',
 city: contact.city || '',
 state_province: contact.state_province || '',
 postal_code: contact.postal_code || '',
 country: contact.country || '',
 billing_address_line1: contact.billing_address_line1 || '',
 billing_address_line2: contact.billing_address_line2 || '',
 billing_city: contact.billing_city || '',
 billing_state_province: contact.billing_state_province || '',
 billing_postal_code: contact.billing_postal_code || '',
 billing_country: contact.billing_country || '',
 billing_same_as_primary: contact.billing_same_as_primary || false,
 emergency_contact_name: contact.emergency_contact_name || '',
 emergency_contact_relationship: contact.emergency_contact_relationship || '',
 emergency_contact_phone: contact.emergency_contact_phone || '',
 emergency_contact_email: contact.emergency_contact_email || '',
 timezone: contact.timezone || '',
 preferred_contact_method: contact.preferred_contact_method || 'email',
 do_not_contact: contact.do_not_contact || false,
 contact_notes: contact.contact_notes || '',
 });
 }, []);

 const handleSelectItem = useCallback((id: string, selected: boolean) => {
 setSelectedItems(prev => {
 if (selected) {
 return prev.includes(id) ? prev : [...prev, id];
 }
 return prev.filter(itemId => itemId !== id);
 });
 }, []);

 const handleSelectAll = useCallback((ids: string[], selected: boolean) => {
 setSelectedItems(selected ? Array.from(new Set([...selectedItems, ...ids])) : []);
 }, [selectedItems]);

 const iconMap: Record<ViewType, LucideIcon> = useMemo(() => ({
 form: FileText,
 card: CreditCard,
 list: List,
 map: Map,
 analytics: BarChart3,
 }), []);

 const selectedContact = selectedContactId
 ? contactsList.find(c => c.id === selectedContactId) || contact
 : contact;

 return (
 <div className="space-y-6">
 <Card className="p-4 flex items-center justify-between">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <Badge variant="outline">Contact</Badge>
 <span className="text-sm text-muted-foreground">
 {contact?.verification_status === 'verified' ? (
 <span className="text-green-600 flex items-center gap-1">
 <ShieldCheck className="h-4 w-4" /> Contact verified
 </span>
 ) : (
 <span className="text-yellow-600 flex items-center gap-1">
 <AlertTriangle className="h-4 w-4" /> Verification pending
 </span>
 )}
 </span>
 </div>
 <h1 className="text-2xl font-semibold">
 Contact Information
 </h1>
 </div>
 <Button variant="outline" size="sm" onClick={() => {
 fetchContact();
 fetchContactsList();
 if (view === 'analytics') fetchAnalytics();
 }}>
 <RefreshCw className="mr-2 h-4 w-4" />
 Refresh
 </Button>
 </Card>

 <Tabs value={view} onValueChange={(value) => setView(value as ViewType)}>
 <TabsList className="grid grid-cols-5 w-full">
 {Object.entries(VIEW_CONFIG).map(([key, { label, icon }]) => {
 const Icon = iconMap[key as ViewType] ?? FileText;
 return (
 <TabsTrigger key={key} value={key} className="flex items-center gap-2">
 <Icon className="h-4 w-4" />
 {label}
 </TabsTrigger>
 );
 })}
 </TabsList>

 <TabsContent value="form">
 <ContactFormView
 contact={selectedContact}
 formData={formData}
 formErrors={formErrors}
 loading={loading}
 saving={saving}
 onFieldChange={handleFieldChange}
 onSave={handleSave}
 onVerify={handleVerify}
 />
 </TabsContent>

 <TabsContent value="card">
 <ContactCardView
 contact={selectedContact}
 loading={loading}
 onEdit={() => setView('form')}
 onVerify={contact?.verification_status !== 'verified' ? handleVerify : undefined}
 />
 </TabsContent>

 <TabsContent value="list">
 <ContactListView
 contacts={contactsList}
 loading={loading}
 selectedItems={selectedItems}
 filters={filters}
 sort={sort}
 onSelectItem={handleSelectItem}
 onSelectAll={handleSelectAll}
 onChangeFilters={(newFilters) => {
 setFilters(prev => ({ ...prev, ...newFilters }));
 }}
 onChangeSort={setSort}
 onExport={(contact) => {
 const contactsToExport = contact ? [contact] : contactsList.filter(c => selectedItems.includes(c.id));
 const rows = [
 ['Name', 'Primary Phone', 'Preferred Method', 'City', 'State', 'Country'],
 ...contactsToExport.map(item => [
 item.emergency_contact_name || '',
 item.phone_primary || '',
 item.preferred_contact_method || '',
 item.city || '',
 item.state_province || '',
 item.country || '',
 ]),
 ];
 const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
 const blob = new Blob([csvContent], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = contact ? `contact-${contact.id}.csv` : `contacts-${new Date().toISOString().split('T')[0]}.csv`;
 link.click();
 URL.revokeObjectURL(url);
 }}
 onViewContact={handleSelectContact}
 />
 </TabsContent>

 <TabsContent value="map">
 <ContactMapView
 contacts={contactsList}
 loading={loading}
 selectedContactId={selectedContactId}
 onSelectContact={handleSelectContact}
 />
 </TabsContent>

 <TabsContent value="analytics">
 <ContactAnalyticsView
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
