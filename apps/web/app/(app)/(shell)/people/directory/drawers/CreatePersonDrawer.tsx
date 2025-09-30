'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, UnifiedInput } from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import { usePostHog } from 'posthog-js/react';
import directoryService from '../lib/directoryService';
import type { Person } from '../types';

export type PersonStatus = 'active' | 'inactive' | 'terminated';

interface PersonFormData {
 firstName: string;
 lastName: string;
 email: string;
 phone: string;
 role: string;
 department: string;
 location: string;
 startDate: string;
 bio: string;
 skills: string;
 status: PersonStatus;
}

const statusOptions: ReadonlyArray<{ value: PersonStatus; label: string }> = [
 { value: 'active', label: 'Active' },
 { value: 'inactive', label: 'Inactive' },
 { value: 'terminated', label: 'Terminated' }
];

const createInitialFormData = (): PersonFormData => ({
 firstName: '',
 lastName: '',
 email: '',
 phone: '',
 role: '',
 department: '',
 location: '',
 startDate: '',
 bio: '',
 skills: '',
 status: 'active'
});

interface CreatePersonDrawerProps {
 orgId: string;
 open: boolean;
 onClose: () => void;
 onCreated?: (person: Person) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreatePersonDrawer({ orgId, open, onClose, onCreated }: CreatePersonDrawerProps) {
 const posthog = usePostHog();
 const supabase = createBrowserClient();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState<PersonFormData>(() => createInitialFormData());
 const [error, setError] = useState<string | null>(null);

 const trimmedEmail = formData.email.trim();
 const isSubmitDisabled =
 isSubmitting ||
 !formData.firstName.trim() ||
 !formData.lastName.trim() ||
 (trimmedEmail.length > 0 && !emailRegex.test(trimmedEmail));

 const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
 const { name, value } = event.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 }, []);

 const handleTextareaChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
 const { name, value } = event.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 }, []);

 const handleStatusChange = useCallback((value: string) => {
 setFormData(prev => ({ ...prev, status: value as PersonStatus }));
 }, []);

 const resetState = useCallback(() => {
 setFormData(createInitialFormData());
 setError(null);
 setIsSubmitting(false);
 }, []);

 const handleClose = useCallback(() => {
 if (!isSubmitting) {
 resetState();
 onClose();
 }
 }, [isSubmitting, onClose, resetState]);

 const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();

 const trimmedFirstName = formData.firstName.trim();
 const trimmedLastName = formData.lastName.trim();
 const trimmedEmailLocal = formData.email.trim();

 if (!trimmedFirstName) {
 setError('First name is required.');
 return;
 }

 if (!trimmedLastName) {
 setError('Last name is required.');
 return;
 }

 if (trimmedEmailLocal && !emailRegex.test(trimmedEmailLocal)) {
 setError('A valid email address is required.');
 return;
 }

 setError(null);

 try {
 setIsSubmitting(true);

 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error('User not authenticated');

 const skillsArray = formData.skills
 ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
 : [];

 const createdPerson = await directoryService.createPerson(orgId, {
 first_name: trimmedFirstName,
 last_name: trimmedLastName,
 email: trimmedEmailLocal || undefined,
 phone: formData.phone.trim() || undefined,
 role: formData.role.trim() || undefined,
 department: formData.department.trim() || undefined,
 location: formData.location.trim() || undefined,
 hire_date: formData.startDate || undefined,
 bio: formData.bio.trim() || undefined,
 skills: skillsArray,
 notes: undefined,
 status: formData.status
 });

 posthog?.capture('people_person_created', {
 person_id: createdPerson.id,
 first_name: trimmedFirstName,
 last_name: trimmedLastName,
 role: formData.role.trim() || undefined,
 department: formData.department.trim() || undefined,
 status: formData.status,
 organization_id: orgId
 });

 await supabase.from('activities').insert({
 organization_id: orgId,
 user_id: user.id,
 action: 'create',
 resource_type: 'person',
 resource_id: createdPerson.id,
 details: {
 first_name: trimmedFirstName,
 last_name: trimmedLastName,
 role: formData.role.trim() || undefined,
 department: formData.department.trim() || undefined,
 status: formData.status
 }
 });

 resetState();
 onClose();
 onCreated?.(createdPerson);
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Unknown error';
 console.error('Error creating person:', err);
 setError(message);
 posthog?.capture('people_person_creation_failed', {
 error: message,
 organization_id: orgId
 });
 } finally {
 setIsSubmitting(false);
 }
 }, [formData, onClose, onCreated, orgId, posthog, resetState, supabase]);

 return (
 <AppDrawer
 title="Add Person"
 open={open}
 onClose={handleClose}
 record={null}
 fields={[]}
 mode="create"
 loading={isSubmitting}
 tabs={[{
 key: 'details',
 label: 'Details',
 content: (
 <form onSubmit={handleSubmit} className="stack-lg">
 <div className="flex items-center gap-sm mb-lg">
 <div className="p-sm bg-accent/10 rounded-lg">
 <span className="text-heading-4">👤</span>
 </div>
 <div>
 <h3 className="form-label">Person Information</h3>
 <p className="text-body-sm color-foreground/70">
 Add a new person to your organization directory
 </p>
 </div>
 </div>

 <div className="stack-md">
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">First Name *</label>
 <UnifiedInput
 
 
 value={formData.firstName}
 onChange={handleInputChange}
 placeholder="John"
 required
 />
 </div>
 <div>
 <label className="block text-body-sm form-label mb-sm">Last Name *</label>
 <UnifiedInput
 
 
 value={formData.lastName}
 onChange={handleInputChange}
 placeholder="Smith"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Email</label>
 <UnifiedInput
 
 
 type="email"
 value={formData.email}
 onChange={handleInputChange}
 placeholder="john.smith@example.com"
 />
 </div>
 <div>
 <label className="block text-body-sm form-label mb-sm">Phone</label>
 <UnifiedInput
 
 
 value={formData.phone}
 onChange={handleInputChange}
 placeholder="+1 (555) 123-4567"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Role</label>
 <UnifiedInput
 
 
 value={formData.role}
 onChange={handleInputChange}
 placeholder="e.g., Production Manager"
 />
 </div>
 <div>
 <label className="block text-body-sm form-label mb-sm">Department</label>
 <UnifiedInput
 
 
 value={formData.department}
 onChange={handleInputChange}
 placeholder="e.g., Production, Technical"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Location</label>
 <UnifiedInput
 
 
 value={formData.location}
 onChange={handleInputChange}
 placeholder="Los Angeles, CA"
 />
 </div>
 <div>
 <label className="block text-body-sm form-label mb-sm">Start Date</label>
 <UnifiedInput
 
 
 type="date"
 value={formData.startDate}
 onChange={handleInputChange}
 />
 </div>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-sm">Status</label>
 <Select value={formData.status} onValueChange={handleStatusChange}>
 <SelectTrigger>
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 {statusOptions.map(option => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-sm">Skills</label>
 <UnifiedInput
 
 
 value={formData.skills}
 onChange={handleInputChange}
 placeholder="e.g., Lighting, Sound, Rigging (comma separated)"
 />
 <p className="text-body-sm color-muted mt-xs">Enter skills separated by commas</p>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-sm">Bio</label>
 <Textarea
 
 
 value={formData.bio}
 onChange={handleTextareaChange}
 placeholder="Brief professional background and experience"
 rows={3}
 />
 </div>
 </div>

 <div className="bg-accent/5 p-md rounded-lg">
 <h4 className="form-label color-accent mb-sm">Directory Guidelines</h4>
 <ul className="text-body-sm color-accent/80 stack-xs">
 <li>• Provide accurate contact information for effective communication</li>
 <li>• Include relevant skills to help with project assignments</li>
 <li>• Keep role and department information current</li>
 <li>• Use consistent location formatting for better organization</li>
 </ul>
 </div>

 {error && (
 <div className="flex items-center gap-sm text-body-sm color-destructive">
 {error}
 </div>
 )}

 <div className="flex justify-end gap-sm mt-lg">
 <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
 Cancel
 </Button>
 <Button type="submit" form="create-person-form" disabled={isSubmitDisabled}>
 {isSubmitting ? 'Creating…' : 'Create Person'}
 </Button>
 </div>
 </form>
 )
 }]}
 />
 );
}
