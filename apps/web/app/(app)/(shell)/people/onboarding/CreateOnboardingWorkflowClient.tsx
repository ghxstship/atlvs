'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, UnifiedInput } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import type { CreateOnboardingWorkflowData } from './types';

interface CreateOnboardingWorkflowClientProps {
 orgId: string;
}

export default function CreateOnboardingWorkflowClient({ orgId }: CreateOnboardingWorkflowClientProps) {
 const t = useTranslations('people.onboarding');
 const router = useRouter();
 const sb = createBrowserClient();

 const [loading, setLoading] = useState(false);
 const [people, setPeople] = useState<any[]>([]);
 const [projects, setProjects] = useState<any[]>([]);
 
 const [formData, setFormData] = useState<CreateOnboardingWorkflowData>({
 person_id: '',
 project_id: '',
 start_date: new Date().toISOString().split('T')[0],
 target_completion_date: '',
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

 // Load projects
 const { data: projectsData } = await sb
 .from('projects')
 .select('id, name, status')
 .eq('organization_id', orgId)
 .eq('status', 'active')
 .order('name');

 setProjects(projectsData || []);
 } catch (error) {
 console.error('Error loading data:', error);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.person_id) return;

 setLoading(true);
 try {
 const { error } = await sb
 .from('onboarding_workflows')
 .insert({
 ...formData,
 organization_id: orgId,
 status: 'pending',
 progress_percentage: 0,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 });

 if (error) throw error;

 router.push('/people/onboarding');
 } catch (error) {
 console.error('Error creating onboarding workflow:', error);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="stack-lg">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3 font-anton uppercase">Create Onboarding Workflow</h1>
 <p className="text-body-sm color-muted">Start onboarding process for a new team member</p>
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
 <label className="block text-body-sm form-label mb-xs">Project (Optional)</label>
 <select
 value={formData.project_id}
 onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
 className="w-full px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
 >
 <option value="">No specific project</option>
 {projects.map(project => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Start Date *</label>
 <UnifiedInput
 type="date"
 value={formData.start_date}
 onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
 required
 />
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Target Completion Date</label>
 <UnifiedInput
 type="date"
 value={formData.target_completion_date}
 onChange={(e) => setFormData(prev => ({ ...prev, target_completion_date: e.target.value }))}
 />
 </div>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Notes</label>
 <textarea
 value={formData.notes}
 onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
 placeholder="Additional notes about this onboarding process..."
 className="w-full px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background min-h-[100px]"
 />
 </div>

 <div className="flex gap-sm">
 <Button type="submit" loading={loading}>
 Create Onboarding Workflow
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
