'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, UnifiedInput, Badge } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { AssignmentService } from './lib/assignmentService';
import type { CreateAssignmentData } from './types';

interface CreateAssignmentClientProps {
 orgId: string;
}

export default function CreateAssignmentClient({ orgId }: CreateAssignmentClientProps) {
 const t = useTranslations('people.assignments');
 const router = useRouter();
 const sb = useMemo(() => createBrowserClient(), []);
 const assignmentService = useMemo(() => new AssignmentService(), []);

 const [loading, setLoading] = useState(false);
 const [projects, setProjects] = useState<any[]>([]);
 const [skills, setSkills] = useState<string[]>([]);
 const [newSkill, setNewSkill] = useState('');
 
 const [formData, setFormData] = useState<CreateAssignmentData>({
 project_id: '',
 role: '',
 required_count: 1,
 department: '',
 skills_required: [],
 hourly_rate: undefined,
 notes: ''
 });

  const loadProjects = useCallback(async () => {
 try {
 const { data, error } = await sb
 .from('projects')
 .select('id, name, status')
 .eq('organization_id', orgId)
 .eq('status', 'active')
 .order('name');

 if (error) throw error;
 setProjects(data || []);
 } catch (error) {
 console.error('Error loading projects:', error);
 }
 }, [orgId, sb]);

 useEffect(() => {
 loadProjects();
 }, [loadProjects]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.project_id || !formData.role) return;

 setLoading(true);
 try {
 await assignmentService.createAssignment(orgId, {
 ...formData,
 skills_required: skills
 });

 router.push('/people/assignments');
 } catch (error) {
 console.error('Error creating assignment:', error);
 } finally {
 setLoading(false);
 }
 };

 const addSkill = () => {
 if (newSkill.trim() && !skills.includes(newSkill.trim())) {
 setSkills([...skills, newSkill.trim()]);
 setNewSkill('');
 }
 };

 const removeSkill = (skillToRemove: string) => {
 setSkills(skills.filter(skill => skill !== skillToRemove));
 };

 return (
 <div className="stack-lg">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3 font-anton uppercase">Create Assignment</h1>
 <p className="text-body-sm color-muted">Create a new project assignment</p>
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
 <label className="block text-body-sm form-label mb-xs">Project *</label>
 <select
 value={formData.project_id}
 onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
 className="w-full px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
 required
 >
 <option value="">Select project...</option>
 {projects.map(project => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Role *</label>
 <UnifiedInput
 type="text"
 value={formData.role}
 onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
 placeholder="e.g. Senior Camera Operator"
 required
 />
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Department</label>
 <UnifiedInput
 type="text"
 value={formData.department}
 onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
 placeholder="e.g. Production"
 />
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Required Count *</label>
 <UnifiedInput
 type="number"
 min="1"
 value={formData.required_count}
 onChange={(e) => setFormData(prev => ({ ...prev, required_count: parseInt(e.target.value) || 1 }))}
 required
 />
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Hourly Rate</label>
 <UnifiedInput
 type="number"
 step="0.01"
 value={formData.hourly_rate || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || undefined }))}
 placeholder="0.00"
 />
 </div>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Skills Required</label>
 <div className="flex gap-sm mb-sm">
 <UnifiedInput
 type="text"
 value={newSkill}
 onChange={(e) => setNewSkill(e.target.value)}
 placeholder="Add a skill..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
 />
 <Button type="button" onClick={addSkill} variant="outline">
 Add
 </Button>
 </div>
 {skills.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {skills.map((skill, index) => (
 <Badge 
 key={index} 
 variant="secondary" 
 className="cursor-pointer"
 onClick={() => removeSkill(skill)}
 >
 {skill} ×
 </Badge>
 ))}
 </div>
 )}
 </div>

 <div>
 <label className="block text-body-sm form-label mb-xs">Notes</label>
 <textarea
 value={formData.notes}
 onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
 placeholder="Additional requirements or notes..."
 className="w-full px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background min-h-[100px]"
 />
 </div>

 <div className="flex gap-sm">
 <Button type="submit" loading={loading}>
 Create Assignment
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
