'use client';

import { Plus, Trash2, Clock, User, MapPin } from "lucide-react";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Button,
 Input,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Label,
 Card,
 Badge,
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerFooter,
} from '@ghxstship/ui';
import { callSheetsService, type CallSheet, type CrewCall, type TalentCall, type EmergencyContact } from '../lib/callSheetsService';

const callSheetSchema = z.object({
 title: z.string().min(1, 'Title is required'),
 description: z.string().optional(),
 call_date: z.string().min(1, 'Call date is required'),
 call_time: z.string().optional(),
 location: z.string().optional(),
 weather: z.string().optional(),
 special_instructions: z.string().optional(),
 project_id: z.string().optional(),
 event_id: z.string().optional(),
 status: z.enum(['draft', 'published', 'distributed', 'completed', 'cancelled']).optional(),
});

type CallSheetFormData = z.infer<typeof callSheetSchema>;

interface EditCallSheetDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 callSheet: CallSheet;
 currentUserId: string;
 projects?: Array<{ id: string; name: string }>;
 events?: Array<{ id: string; title: string }>;
 onSuccess?: () => void;
}

export default function EditCallSheetDrawer({
 open,
 onOpenChange,
 callSheet,
 currentUserId,
 projects = [],
 events = [],
 onSuccess,
}: EditCallSheetDrawerProps) {
 const [loading, setLoading] = useState(false);
 const [activeTab, setActiveTab] = useState<'details' | 'crew' | 'talent' | 'contacts'>('details');
 const [crewCalls, setCrewCalls] = useState<CrewCall[]>(callSheet.crew_calls || []);
 const [talentCalls, setTalentCalls] = useState<TalentCall[]>(callSheet.talent_calls || []);
 const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(callSheet.emergency_contacts || []);

 const form = useForm<CallSheetFormData>({
 resolver: zodResolver(callSheetSchema),
 defaultValues: {
 title: callSheet.title,
 description: callSheet.description || '',
 call_date: callSheet.call_date,
 call_time: callSheet.call_time || '',
 location: callSheet.location || '',
 weather: callSheet.weather || '',
 special_instructions: callSheet.special_instructions || '',
 project_id: callSheet.project_id || '',
 event_id: callSheet.event_id || '',
 status: callSheet.status,
 },
 });

 useEffect(() => {
 if (callSheet) {
 form.reset({
 title: callSheet.title,
 description: callSheet.description || '',
 call_date: callSheet.call_date,
 call_time: callSheet.call_time || '',
 location: callSheet.location || '',
 weather: callSheet.weather || '',
 special_instructions: callSheet.special_instructions || '',
 project_id: callSheet.project_id || '',
 event_id: callSheet.event_id || '',
 status: callSheet.status,
 });
 setCrewCalls(callSheet.crew_calls || []);
 setTalentCalls(callSheet.talent_calls || []);
 setEmergencyContacts(callSheet.emergency_contacts || []);
 }
 }, [callSheet, form]);

 const onSubmit = async (data: CallSheetFormData) => {
 try {
 setLoading(true);
 
 const callSheetData: Partial<CallSheet> = {
 ...data,
 project_id: data.project_id || null,
 event_id: data.event_id || null,
 crew_calls: crewCalls,
 talent_calls: talentCalls,
 emergency_contacts: emergencyContacts,
 };

 await callSheetsService.updateCallSheet(callSheet.id, currentUserId, callSheetData);
 
 onOpenChange(false);
 onSuccess?.();
 } catch (error) {
 console.error('Error updating call sheet:', error);
 } finally {
 setLoading(false);
 }
 };

 const addCrewCall = () => {
 const newCrewCall: CrewCall = {
 id: crypto.randomUUID(),
 department: '',
 role: '',
 person_name: '',
 call_time: '',
 location: '',
 notes: '',
 };
 setCrewCalls([...crewCalls, newCrewCall]);
 };

 const updateCrewCall = (index: number, field: keyof CrewCall, value: string) => {
 const updated = [...crewCalls];
 updated[index] = { ...updated[index], [field]: value };
 setCrewCalls(updated);
 };

 const removeCrewCall = (index: number) => {
 setCrewCalls(crewCalls.filter((_, i) => i !== index));
 };

 const addTalentCall = () => {
 const newTalentCall: TalentCall = {
 id: crypto.randomUUID(),
 talent_name: '',
 role: '',
 call_time: '',
 makeup_time: '',
 wardrobe_time: '',
 location: '',
 notes: '',
 };
 setTalentCalls([...talentCalls, newTalentCall]);
 };

 const updateTalentCall = (index: number, field: keyof TalentCall, value: string) => {
 const updated = [...talentCalls];
 updated[index] = { ...updated[index], [field]: value };
 setTalentCalls(updated);
 };

 const removeTalentCall = (index: number) => {
 setTalentCalls(talentCalls.filter((_, i) => i !== index));
 };

 const addEmergencyContact = () => {
 const newContact: EmergencyContact = {
 id: crypto.randomUUID(),
 name: '',
 role: '',
 phone: '',
 email: '',
 };
 setEmergencyContacts([...emergencyContacts, newContact]);
 };

 const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
 const updated = [...emergencyContacts];
 updated[index] = { ...updated[index], [field]: value };
 setEmergencyContacts(updated);
 };

 const removeEmergencyContact = (index: number) => {
 setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
 };

 const tabs = [
 { id: 'details', label: 'Details' },
 { id: 'crew', label: `Crew (${crewCalls.length})` },
 { id: 'talent', label: `Talent (${talentCalls.length})` },
 { id: 'contacts', label: `Emergency (${emergencyContacts.length})` },
 ];

 return (
 <Drawer open={open} onClose={() => onOpenChange(false)}>
 <DrawerContent className="max-w-4xl mx-auto">
 <DrawerHeader>
 <DrawerTitle>Edit Call Sheet</DrawerTitle>
 </DrawerHeader>

 <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
 <div className="flex-1 px-lg">
 {/* Tab Navigation */}
 <div className="flex space-x-xs mb-6 border-b">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 type="button"
 onClick={() => setActiveTab(tab.id as unknown)}
 className={`px-md py-xs text-sm font-medium border-b-2 transition-colors ${
 activeTab === tab.id
 ? 'border-primary text-primary'
 : 'border-transparent text-muted-foreground hover:text-foreground'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* Tab Content */}
 {activeTab === 'details' && (
 <div className="space-y-md">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <Label htmlFor="title">Title *</Label>
 <Input
 
 {...form.register('title')}
 placeholder="Call sheet title"
 />
 {form.formState.errors.title && (
 <p className="text-sm text-destructive mt-1">
 {form.formState.errors.title.message}
 </p>
 )}
 </div>

 <div>
 <Label htmlFor="status">Status</Label>
 <Select
 value={form.watch('status')}
 onValueChange={(value) => form.setValue('status', value as unknown)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="draft">Draft</SelectItem>
 <SelectItem value="published">Published</SelectItem>
 <SelectItem value="distributed">Distributed</SelectItem>
 <SelectItem value="completed">Completed</SelectItem>
 <SelectItem value="cancelled">Cancelled</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div>
 <Label htmlFor="call_date">Call Date *</Label>
 <Input
 
 type="date"
 {...form.register('call_date')}
 />
 {form.formState.errors.call_date && (
 <p className="text-sm text-destructive mt-1">
 {form.formState.errors.call_date.message}
 </p>
 )}
 </div>

 <div>
 <Label htmlFor="call_time">Call Time</Label>
 <Input
 
 type="time"
 {...form.register('call_time')}
 />
 </div>

 <div>
 <Label htmlFor="location">Location</Label>
 <Input
 
 {...form.register('location')}
 placeholder="Shooting location"
 />
 </div>

 <div>
 <Label htmlFor="weather">Weather</Label>
 <Input
 
 {...form.register('weather')}
 placeholder="Weather conditions"
 />
 </div>

 <div>
 <Label htmlFor="project_id">Project</Label>
 <Select
 value={form.watch('project_id')}
 onValueChange={(value) => form.setValue('project_id', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select project" />
 </SelectTrigger>
 <SelectContent>
 {projects.map((project) => (
 <SelectItem key={project.id} value={project.id}>
 {project.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div>
 <Label htmlFor="event_id">Event</Label>
 <Select
 value={form.watch('event_id')}
 onValueChange={(value) => form.setValue('event_id', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select event" />
 </SelectTrigger>
 <SelectContent>
 {events.map((event) => (
 <SelectItem key={event.id} value={event.id}>
 {event.title}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 <div>
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 {...form.register('description')}
 placeholder="Call sheet description"
 rows={3}
 />
 </div>

 <div>
 <Label htmlFor="special_instructions">Special Instructions</Label>
 <Textarea
 
 {...form.register('special_instructions')}
 placeholder="Any special instructions for the crew"
 rows={3}
 />
 </div>
 </div>
 )}

 {activeTab === 'crew' && (
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold">Crew Calls</h3>
 <Button type="button" onClick={addCrewCall} size="sm">
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 Add Crew
 </Button>
 </div>

 {crewCalls.map((crew, index) => (
 <Card key={crew.id} className="p-md">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline">Crew #{index + 1}</Badge>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeCrewCall(index)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
 <div>
 <Label>Department</Label>
 <Input
 value={crew.department}
 onChange={(e) => updateCrewCall(index, 'department', e.target.value)}
 placeholder="Camera, Sound, etc."
 />
 </div>

 <div>
 <Label>Role</Label>
 <Input
 value={crew.role}
 onChange={(e) => updateCrewCall(index, 'role', e.target.value)}
 placeholder="Director, DP, etc."
 />
 </div>

 <div>
 <Label>Person Name</Label>
 <Input
 value={crew.person_name || ''}
 onChange={(e) => updateCrewCall(index, 'person_name', e.target.value)}
 placeholder="Person assigned"
 />
 </div>

 <div>
 <Label>Call Time</Label>
 <Input
 type="time"
 value={crew.call_time}
 onChange={(e) => updateCrewCall(index, 'call_time', e.target.value)}
 />
 </div>

 <div>
 <Label>Location</Label>
 <Input
 value={crew.location || ''}
 onChange={(e) => updateCrewCall(index, 'location', e.target.value)}
 placeholder="Meeting location"
 />
 </div>

 <div>
 <Label>Notes</Label>
 <Input
 value={crew.notes || ''}
 onChange={(e) => updateCrewCall(index, 'notes', e.target.value)}
 placeholder="Additional notes"
 />
 </div>
 </div>
 </Card>
 ))}

 {crewCalls.length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 <User className="h-icon-2xl w-icon-2xl mx-auto mb-4" />
 <p>No crew calls added yet</p>
 </div>
 )}
 </div>
 )}

 {activeTab === 'talent' && (
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold">Talent Calls</h3>
 <Button type="button" onClick={addTalentCall} size="sm">
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 Add Talent
 </Button>
 </div>

 {talentCalls.map((talent, index) => (
 <Card key={talent.id} className="p-md">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline">Talent #{index + 1}</Badge>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeTalentCall(index)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
 <div>
 <Label>Talent Name</Label>
 <Input
 value={talent.talent_name}
 onChange={(e) => updateTalentCall(index, 'talent_name', e.target.value)}
 placeholder="Actor/performer name"
 />
 </div>

 <div>
 <Label>Role</Label>
 <Input
 value={talent.role || ''}
 onChange={(e) => updateTalentCall(index, 'role', e.target.value)}
 placeholder="Character/role"
 />
 </div>

 <div>
 <Label>Call Time</Label>
 <Input
 type="time"
 value={talent.call_time}
 onChange={(e) => updateTalentCall(index, 'call_time', e.target.value)}
 />
 </div>

 <div>
 <Label>Makeup Time</Label>
 <Input
 type="time"
 value={talent.makeup_time || ''}
 onChange={(e) => updateTalentCall(index, 'makeup_time', e.target.value)}
 />
 </div>

 <div>
 <Label>Wardrobe Time</Label>
 <Input
 type="time"
 value={talent.wardrobe_time || ''}
 onChange={(e) => updateTalentCall(index, 'wardrobe_time', e.target.value)}
 />
 </div>

 <div>
 <Label>Location</Label>
 <Input
 value={talent.location || ''}
 onChange={(e) => updateTalentCall(index, 'location', e.target.value)}
 placeholder="Meeting location"
 />
 </div>
 </div>

 <div className="mt-3">
 <Label>Notes</Label>
 <Textarea
 value={talent.notes || ''}
 onChange={(e) => updateTalentCall(index, 'notes', e.target.value)}
 placeholder="Additional notes for talent"
 rows={2}
 />
 </div>
 </Card>
 ))}

 {talentCalls.length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 <User className="h-icon-2xl w-icon-2xl mx-auto mb-4" />
 <p>No talent calls added yet</p>
 </div>
 )}
 </div>
 )}

 {activeTab === 'contacts' && (
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold">Emergency Contacts</h3>
 <Button type="button" onClick={addEmergencyContact} size="sm">
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 Add Contact
 </Button>
 </div>

 {emergencyContacts.map((contact, index) => (
 <Card key={contact.id} className="p-md">
 <div className="flex items-start justify-between mb-3">
 <Badge variant="outline">Contact #{index + 1}</Badge>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => removeEmergencyContact(index)}
 >
 <Trash2 className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
 <div>
 <Label>Name</Label>
 <Input
 value={contact.name}
 onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
 placeholder="Contact name"
 />
 </div>

 <div>
 <Label>Role</Label>
 <Input
 value={contact.role}
 onChange={(e) => updateEmergencyContact(index, 'role', e.target.value)}
 placeholder="Producer, Director, etc."
 />
 </div>

 <div>
 <Label>Phone</Label>
 <Input
 value={contact.phone}
 onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
 placeholder="Phone number"
 />
 </div>

 <div>
 <Label>Email</Label>
 <Input
 type="email"
 value={contact.email || ''}
 onChange={(e) => updateEmergencyContact(index, 'email', e.target.value)}
 placeholder="Email address"
 />
 </div>
 </div>
 </Card>
 ))}

 {emergencyContacts.length === 0 && (
 <div className="text-center py-xl text-muted-foreground">
 <User className="h-icon-2xl w-icon-2xl mx-auto mb-4" />
 <p>No emergency contacts added yet</p>
 </div>
 )}
 </div>
 )}
 </div>

 <DrawerFooter>
 <div className="flex justify-end space-x-xs">
 <Button
 type="button"
 variant="outline"
 onClick={() => onOpenChange(false)}
 disabled={loading}
 >
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 {loading ? 'Updating...' : 'Update Call Sheet'}
 </Button>
 </div>
 </DrawerFooter>
 </form>
 </DrawerContent>
 </Drawer>
 );
}
