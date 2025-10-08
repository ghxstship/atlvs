'use client';
import { Activity, Award, Button, Calendar, Clock, FileText, Input, Play, Plus, Search, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Settings, Textarea, Trash2, TrendingUp, User } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import { AppDrawer, Button, Input, Select } from '@ghxstship/ui';
import { usePostHog } from 'posthog-js/react';
import directoryService from '../lib/directoryService';
import type { Person, UpdatePersonData } from '../types';

export type EditPersonDrawerMode = 'view' | 'edit';

interface EditPersonDrawerProps {
 orgId: string;
 person: Person | null;
 open: boolean;
 onClose: () => void;
 onUpdated?: (person: Person) => void;
}

type EditableFields = Pick<
 Person,
 | 'first_name'
 | 'last_name'
 | 'email'
 | 'phone'
 | 'role'
 | 'department'
 | 'location'
 | 'hire_date'
 | 'skills'
 | 'notes'
 | 'status'
> & { bio?: string };

type FormState = {
 [K in keyof EditableFields]: EditableFields[K] extends (infer R)[]
 ? string
 : EditableFields[K] extends string | null | undefined
 ? string
 : EditableFields[K];
};

const statusOptions: ReadonlyArray<{ value: Person['status']; label: string }> = [
 { value: 'active', label: 'Active' },
 { value: 'inactive', label: 'Inactive' },
 { value: 'terminated', label: 'Terminated' },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialFormState: FormState = {
 first_name: '',
 last_name: '',
 email: '',
 phone: '',
 role: '',
 department: '',
 location: '',
 hire_date: '',
 skills: '',
 notes: '',
 status: 'active',
 bio: ''
};

export default function EditPersonDrawer({ orgId, person, open, onClose, onUpdated }: EditPersonDrawerProps) {
 const posthog = usePostHog();
 const supabase = useMemo(() => createBrowserClient(), []);
 const [formState, setFormState] = useState<FormState>(initialFormState);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 if (!person || !open) {
 setFormState(initialFormState);
 setError(null);
 setIsSubmitting(false);
 return;
 }

 setFormState({
 first_name: person.first_name ?? '',
 last_name: person.last_name ?? '',
 email: person.email ?? '',
 phone: person.phone ?? '',
 role: person.role ?? '',
 department: person.department ?? '',
 location: person.location ?? '',
 hire_date: person.hire_date ?? '',
 skills: Array.isArray(person.skills) ? person.skills.join(', ') : '',
 notes: person.notes ?? '',
 status: person.status,
 bio: person.notes ?? ''
 });
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [person, open]);

 const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
 const { name, value } = event.target;
 setFormState((prev: unknown) => ({ ...prev, [name]: value }));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleTextareaChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
 const { name, value } = event.target;
 setFormState((prev: unknown) => ({ ...prev, [name]: value }));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleStatusChange = useCallback((value: string) => {
 setFormState((prev: unknown) => ({ ...prev, status: value as Person['status'] }));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const resetState = useCallback(() => {
 setFormState(initialFormState);
 setError(null);
 setIsSubmitting(false);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleClose = useCallback(() => {
 if (!isSubmitting) {
 resetState();
 onClose();
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [isSubmitting, onClose, resetState]);

 const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();
 if (!person) return;

 const trimmedFirstName = formState.first_name.trim();
 const trimmedLastName = formState.last_name.trim();
 const trimmedEmail = formState.email.trim();

 if (!trimmedFirstName) {
 setError('First name is required.');
 return;
 }

 if (!trimmedLastName) {
 setError('Last name is required.');
 return;
 }

 if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
 setError('Please provide a valid email address.');
 return;
 }

 setError(null);

 const updatePayload: UpdatePersonData = {
 first_name: trimmedFirstName,
 last_name: trimmedLastName,
 email: trimmedEmail || undefined,
 phone: formState.phone.trim() || undefined,
 role: formState.role.trim() || undefined,
 department: formState.department.trim() || undefined,
 location: formState.location.trim() || undefined,
 hire_date: formState.hire_date || undefined,
 skills: formState.skills
 ? formState.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
 : undefined,
 notes: formState.notes.trim() || undefined,
 status: formState.status
 };

 try {
 setIsSubmitting(true);
 const updated = await directoryService.updatePerson(person.id, orgId, updatePayload);

 posthog?.capture('people_person_updated', {
 person_id: updated.id,
 organization_id: orgId,
 status: updated.status,
 role: updated.role,
 department: updated.department
 });

 const { data: { user } } = await supabase.auth.getUser();
 if (user) {
 await supabase.from('activities').insert({
 organization_id: orgId,
 user_id: user.id,
 action: 'update',
 resource_type: 'person',
 resource_id: updated.id,
 details: {
 first_name: updated.first_name,
 last_name: updated.last_name,
 role: updated.role,
 department: updated.department,
 status: updated.status
 }
 });
 }

 resetState();
 onClose();
 onUpdated?.(updated);
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Unknown error';
 console.error('Error updating person:', err);
 setError(message);
 posthog?.capture('people_person_update_failed', {
 person_id: person.id,
 organization_id: orgId,
 error: message
 });
 } finally {
 setIsSubmitting(false);
 }
 }, [formState, person, orgId, onClose, onUpdated, posthog, resetState, supabase]);

 return (
 <AppDrawer
 title="Edit Person"
 open={open && !!person}
 onClose={handleClose}
 record={person}
 fields={[]}
 mode="edit"
 loading={isSubmitting}
 tabs={[{
 key: 'details',
 label: 'Details',
 content: (
 <form onSubmit={handleSubmit} className="stack-lg">
 <div className="stack-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">First Name *</label>
 <Input
 
 
 value={formState.first_name}
 onChange={handleInputChange}
 placeholder="Jane"
 required
 />
 </div>
 <div>
 <label className="block text-body-sm form-label mb-sm">Last Name *</label>
 <Input
 
 
 value={formState.last_name}
 onChange={handleInputChange}
 placeholder="Doe"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Email</label>
 <Input
 
 
 type="email"
 value={formState.email}
 onChange={handleInputChange}
 placeholder="jane.doe@example.com"
 />
 </div>
 <div>
 <label className="block text-body-sm form-label mb-sm">Phone</label>
 <Input
 
 
 value={formState.phone}
 onChange={handleInputChange}
 placeholder="+1 (555) 000-0000"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Role</label>
 <Input
 
 
 value={formState.role}
 onChange={handleInputChange}
 placeholder="Production Manager"
 />
 </div>
 <div>
 <label className="block text-body-sm form-label mb-sm">Department</label>
 <Input
 
 
 value={formState.department}
 onChange={handleInputChange}
 placeholder="Production"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Location</label>
 <Input
 
 
 value={formState.location}
 onChange={handleInputChange}
 placeholder="Los Angeles, CA"
 />
 </div>
 <div>
 <label className="block text-body-sm form-label mb-sm">Hire Date</label>
 <Input
 
 
 type="date"
 value={formState.hire_date}
 onChange={handleInputChange}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Status</label>
 <Select value={formState.status} onValueChange={handleStatusChange}>
 <SelectTrigger>
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 {statusOptions.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-sm">Skills</label>
 <Input
 
 
 value={formState.skills}
 onChange={handleInputChange}
 placeholder="Lighting, Sound, Rigging"
 />
 <p className="text-body-xs color-muted mt-xs">
 Separate multiple skills with commas.
 </p>
 </div>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-sm">Notes</label>
 <textarea
 
 
 value={formState.notes}
 onChange={handleTextareaChange}
 placeholder="Internal notes about this person"
 rows={3}
 />
 </div>
 </div>

 {error && <div className="text-body-sm color-destructive">{error}</div>}

 <div className="flex justify-end gap-sm">
 <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
 Cancel
 </Button>
 <Button type="submit" form="edit-person-form" disabled={isSubmitting}>
 {isSubmitting ? 'Saving…' : 'Save Changes'}
 </Button>
 </div>
 </form>
 )
 }]}
 />
 );
}
