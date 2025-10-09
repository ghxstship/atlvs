'use client';

import { Briefcase, DollarSign, MapPin, Calendar, Users, Clock } from "lucide-react";
import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Select, Card, Badge } from '@ghxstship/ui';
import type { MarketplaceProject } from '../types';

interface CreateProjectClientProps {
 mode: 'create' | 'edit' | 'view';
 project?: MarketplaceProject | null;
 onSuccess: () => void;
 onCancel: () => void;
}

interface ProjectFormData {
 title: string;
 description: string;
 category: string;
 subcategory?: string;
 scope: string;
 budget_type: 'fixed' | 'hourly' | 'not_specified';
 budget_min?: number;
 budget_max?: number;
 currency: string;
 start_date?: string;
 end_date?: string;
 duration?: string;
 location_type: 'remote' | 'onsite' | 'hybrid';
 experience_level: 'entry' | 'intermediate' | 'expert';
 skills_required: string[];
 deliverables: Array<{
 title: string;
 description: string;
 due_date?: string;
 }>;
 visibility: 'public' | 'private' | 'invite_only';
 is_urgent: boolean;
}

export default function CreateProjectClient({ mode, project, onSuccess, onCancel }: CreateProjectClientProps) {
 const [formData, setFormData] = useState<ProjectFormData>({
 title: '',
 description: '',
 category: '',
 subcategory: '',
 scope: '',
 budget_type: 'not_specified',
 budget_min: undefined,
 budget_max: undefined,
 currency: 'USD',
 start_date: '',
 end_date: '',
 duration: '',
 location_type: 'remote',
 experience_level: 'intermediate',
 skills_required: [],
 deliverables: [],
 visibility: 'public',
 is_urgent: false
 });
 
 const [loading, setLoading] = useState(false);
 const [currentSkill, setCurrentSkill] = useState('');
 const [currentDeliverable, setCurrentDeliverable] = useState({
 title: '',
 description: '',
 due_date: ''
 });

 useEffect(() => {
 if (project && mode !== 'create') {
 setFormData({
 title: project.title,
 description: project.description,
 category: project.category || '',
 subcategory: project.subcategory || '',
 scope: project.scope || '',
 budget_type: project.budget_type || 'not_specified',
 budget_min: project.budget_min || undefined,
 budget_max: project.budget_max || undefined,
 currency: project.currency || 'USD',
 start_date: project.start_date || '',
 end_date: project.end_date || '',
 duration: project.duration || '',
 location_type: project.location_type || 'remote',
 experience_level: project.experience_level || 'intermediate',
 skills_required: project.skills_required || [],
 deliverables: project.deliverables || [],
 visibility: project.visibility || 'public',
 is_urgent: project.is_urgent || false
 });
 }
 }, [project, mode]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (mode === 'view') return;

 setLoading(true);

 try {
 const url = '/api/v1/marketplace/projects';
 const method = mode === 'create' ? 'POST' : 'PUT';
 const body = mode === 'edit' ? { id: project?.id, ...formData } : formData;

 const response = await fetch(url, {
 method,
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body)
 });

 if (response.ok) {
 onSuccess();
 } else {
 const error = await response.json();
 console.error('Error saving project:', error);
 }
 } catch (error) {
 console.error('Error saving project:', error);
 } finally {
 setLoading(false);
 }
 };

 const addSkill = () => {
 if (currentSkill.trim() && !formData.skills_required.includes(currentSkill.trim())) {
 setFormData(prev => ({
 ...prev,
 skills_required: [...prev.skills_required, currentSkill.trim()]
 }));
 setCurrentSkill('');
 }
 };

 const removeSkill = (skillToRemove: string) => {
 setFormData(prev => ({
 ...prev,
 skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
 }));
 };

 const addDeliverable = () => {
 if (currentDeliverable.title.trim()) {
 setFormData(prev => ({
 ...prev,
 deliverables: [...prev.deliverables, { ...currentDeliverable }]
 }));
 setCurrentDeliverable({ title: '', description: '', due_date: '' });
 }
 };

 const removeDeliverable = (index: number) => {
 setFormData(prev => ({
 ...prev,
 deliverables: prev.deliverables.filter((_, i) => i !== index)
 }));
 };

 const isReadOnly = mode === 'view';

 return (
 <form onSubmit={handleSubmit} className="stack-lg p-md">
 {/* Basic Information */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <Briefcase className="h-icon-xs w-icon-xs" />
 Project Details
 </h3>
 <div className="stack-sm">
 <Input
 
 value={formData.title}
 onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
 placeholder="Enter project title"
 required
 disabled={isReadOnly}
 />
 
 <Textarea
 
 value={formData.description}
 onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
 placeholder="Describe your project"
 rows={4}
 disabled={isReadOnly}
 />

 <div className="grid grid-cols-2 gap-sm">
 <Select
 
 value={formData.category}
 onChange={(e) => setFormData(prev => ({ ...prev, category: value }))}
 disabled={isReadOnly}
 >
 <option value="">Select category</option>
 <option value="audio_visual">Audio/Visual</option>
 <option value="lighting">Lighting</option>
 <option value="staging">Staging</option>
 <option value="production">Production</option>
 <option value="creative">Creative</option>
 <option value="technical">Technical</option>
 </Select>

 <Select
 
 value={formData.experience_level}
 onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value as unknown }))}
 disabled={isReadOnly}
 >
 <option value="entry">Entry Level</option>
 <option value="intermediate">Intermediate</option>
 <option value="expert">Expert</option>
 </Select>
 </div>

 <Textarea
 
 value={formData.scope}
 onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
 placeholder="Detailed scope of work"
 rows={3}
 disabled={isReadOnly}
 />
 </div>
 </Card>

 {/* Budget & Timeline */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs" />
 Budget & Timeline
 </h3>
 <div className="stack-sm">
 <Select
 
 value={formData.budget_type}
 onChange={(e) => setFormData(prev => ({ ...prev, budget_type: e.target.value as unknown }))}
 disabled={isReadOnly}
 >
 <option value="not_specified">Not Specified</option>
 <option value="fixed">Fixed Price</option>
 <option value="hourly">Hourly Rate</option>
 </Select>

 {formData.budget_type !== 'not_specified' && (
 <div className="grid grid-cols-3 gap-sm">
 <Input
 
 type="number"
 value={formData.budget_min || ''}
 onChange={(e) => setFormData(prev => ({ 
 ...prev, 
 budget_min: e.target.value ? parseFloat(e.target.value) : undefined 
 }))}
 placeholder="Minimum"
 disabled={isReadOnly}
 />
 
 <Input
 
 type="number"
 value={formData.budget_max || ''}
 onChange={(e) => setFormData(prev => ({ 
 ...prev, 
 budget_max: e.target.value ? parseFloat(e.target.value) : undefined 
 }))}
 placeholder="Maximum"
 disabled={isReadOnly}
 />
 
 <Select
 
 value={formData.currency}
 onChange={(e) => setFormData(prev => ({ ...prev, currency: value }))}
 disabled={isReadOnly}
 >
 <option value="USD">USD</option>
 <option value="EUR">EUR</option>
 <option value="GBP">GBP</option>
 <option value="CAD">CAD</option>
 </Select>
 </div>
 )}

 <div className="grid grid-cols-2 gap-sm">
 <Input
 
 type="date"
 value={formData.start_date}
 onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
 disabled={isReadOnly}
 />
 
 <Input
 
 type="date"
 value={formData.end_date}
 onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
 disabled={isReadOnly}
 />
 </div>

 <Input
 
 value={formData.duration}
 onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
 placeholder="e.g., 2 weeks, 1 month"
 disabled={isReadOnly}
 />
 </div>
 </Card>

 {/* Location & Requirements */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 Location & Requirements
 </h3>
 <div className="stack-sm">
 <Select
 
 value={formData.location_type}
 onChange={(e) => setFormData(prev => ({ ...prev, location_type: e.target.value as unknown }))}
 disabled={isReadOnly}
 >
 <option value="remote">Remote</option>
 <option value="onsite">On-site</option>
 <option value="hybrid">Hybrid</option>
 </Select>

 {/* Skills Required */}
 <div>
 <label className="text-body-sm font-medium mb-xs block">Skills Required</label>
 {!isReadOnly && (
 <div className="flex gap-sm mb-sm">
 <Input
 value={currentSkill}
 onChange={(e) => setCurrentSkill(e.target.value)}
 placeholder="Add a skill"
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
 />
 <Button type="button" onClick={addSkill} size="sm">
 Add
 </Button>
 </div>
 )}
 <div className="flex flex-wrap gap-xs">
 {formData.skills_required.map((skill, index) => (
 <Badge key={index} variant="secondary" className="flex items-center gap-xs">
 {skill}
 {!isReadOnly && (
 <button
 type="button"
 onClick={() => removeSkill(skill)}
 className="ml-xs hover:text-destructive"
 >
 ×
 </button>
 )}
 </Badge>
 ))}
 </div>
 </div>

 {/* Project Settings */}
 <div className="grid grid-cols-2 gap-sm">
 <Select
 
 value={formData.visibility}
 onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as unknown }))}
 disabled={isReadOnly}
 >
 <option value="public">Public</option>
 <option value="private">Private</option>
 <option value="invite_only">Invite Only</option>
 </Select>

 <div className="flex items-center gap-sm pt-6">
 <input
 type="checkbox"
 
 checked={formData.is_urgent}
 onChange={(e) => setFormData(prev => ({ ...prev, is_urgent: e.target.checked }))}
 disabled={isReadOnly}
 />
 <label htmlFor="urgent" className="text-body-sm">
 Urgent project
 </label>
 </div>
 </div>
 </div>
 </Card>

 {/* Deliverables */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <Clock className="h-icon-xs w-icon-xs" />
 Deliverables
 </h3>
 <div className="stack-sm">
 {!isReadOnly && (
 <div className="grid grid-cols-3 gap-sm p-sm border rounded">
 <Input
 placeholder="Deliverable title"
 value={currentDeliverable.title}
 onChange={(e) => setCurrentDeliverable(prev => ({ ...prev, title: e.target.value }))}
 />
 <Input
 placeholder="Description"
 value={currentDeliverable.description}
 onChange={(e) => setCurrentDeliverable(prev => ({ ...prev, description: e.target.value }))}
 />
 <div className="flex gap-xs">
 <Input
 type="date"
 value={currentDeliverable.due_date}
 onChange={(e) => setCurrentDeliverable(prev => ({ ...prev, due_date: e.target.value }))}
 />
 <Button type="button" onClick={addDeliverable} size="sm">
 Add
 </Button>
 </div>
 </div>
 )}
 
 <div className="stack-xs">
 {formData.deliverables.map((deliverable, index) => (
 <div key={index} className="flex items-center justify-between p-sm bg-muted rounded">
 <div>
 <div className="font-medium">{deliverable.title}</div>
 {deliverable.description && (
 <div className="text-body-sm color-muted">{deliverable.description}</div>
 )}
 {deliverable.due_date && (
 <div className="text-body-sm color-muted">Due: {deliverable.due_date}</div>
 )}
 </div>
 {!isReadOnly && (
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={() => removeDeliverable(index)}
 >
 Remove
 </Button>
 )}
 </div>
 ))}
 </div>
 </div>
 </Card>

 {/* Actions */}
 <div className="flex justify-end gap-sm pt-md border-t">
 <Button type="button" variant="outline" onClick={onCancel}>
 {isReadOnly ? 'Close' : 'Cancel'}
 </Button>
 {!isReadOnly && (
 <Button type="submit" loading={loading}>
 {mode === 'create' ? 'Post Project' : 'Update Project'}
 </Button>
 )}
 </div>
 </form>
 );
}
