'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, UnifiedInput } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import type { CreateTrainingRecordData } from './types';

interface CreateTrainingRecordClientProps {
 orgId: string;
}

export default function CreateTrainingRecordClient({ orgId }: CreateTrainingRecordClientProps) {
 const t = useTranslations('people.training');
 const router = useRouter();
 const sb = createBrowserClient();

 const [loading, setLoading] = useState(false);
 const [people, setPeople] = useState<any[]>([]);
 const [programs, setPrograms] = useState<any[]>([]);
 
 const [formData, setFormData] = useState<CreateTrainingRecordData>({
 person_id: '',
 program_id: '',
 notes: ''
 });

 useEffect(() => {
 loadData();
 }, [orgId]);

 const loadData = async () => {
 try {
 // Load people
 const { data: peopleData } = await sb
 .from('people')
 .select('id, first_name, last_name, department')
 .eq('organization_id', orgId)
 .eq('status', 'active')
 .order('first_name');

 setPeople(peopleData || []);

 // Load training programs
 const { data: programsData } = await sb
 .from('training_programs')
 .select('id, name, category, duration, required')
 .eq('organization_id', orgId)
 .order('name');

 setPrograms(programsData || []);
 } catch (error) {
 console.error('Error loading data:', error);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.person_id || !formData.program_id) return;

 setLoading(true);
 try {
 const { error } = await sb
 .from('training_records')
 .insert({
 ...formData,
 organization_id: orgId,
 status: 'enrolled',
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 });

 if (error) throw error;

 router.push('/people/training');
 } catch (error) {
 console.error('Error creating training record:', error);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="stack-lg">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3 font-anton uppercase">Enroll in Training</h1>
 <p className="text-body-sm color-muted">Enroll a person in a training program</p>
 </div>
 <Button variant="outline" onClick={() => router.back()}>
 Cancel
 </Button>
 </div>

 <Card>
 <div className="p-md">
 <form onSubmit={handleSubmit} className="stack-md">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-xs">Person *</label>
 <select
 value={formData.person_id}
 onChange={(e) => setFormData(prev => ({ ...prev, person_id: e.target.value }))}
 className="w-full px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
 required
 >
 <option value="">Select person...</option>
 {people.map(person => (
 <option key={person.id} value={person.id}>
 {person.first_name} {person.last_name} - {person.department}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Training Program *</label>
 <select
 value={formData.program_id}
 onChange={(e) => setFormData(prev => ({ ...prev, program_id: e.target.value }))}
 className="w-full px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
 required
 >
 <option value="">Select program...</option>
 {programs.map(program => (
 <option key={program.id} value={program.id}>
 {program.name} ({program.duration}h) - {program.category}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Notes</label>
 <textarea
 value={formData.notes}
 onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
 placeholder="Additional notes about this enrollment..."
 className="w-full px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background min-h-[100px]"
 />
 </div>

 <div className="flex gap-sm">
 <Button type="submit" loading={loading}>
 Enroll in Training
 </Button>
 <Button type="button" variant="outline" onClick={() => router.back()}>
 Cancel
 </Button>
 </div>
 </form>
 </div>
 </Card>
 </div>
 );
}
