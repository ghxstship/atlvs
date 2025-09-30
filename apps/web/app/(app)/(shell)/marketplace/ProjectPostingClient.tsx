'use client';

import { Plus, Edit, Trash2, Eye, Calendar, DollarSign, MapPin, Users, Paperclip, Search, AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
 Card,
 Button,
 Badge,
 UnifiedInput,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { AppDrawer } from '@ghxstship/ui';

type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'completed' | string;
type ProjectExperienceLevel = 'entry' | 'intermediate' | 'expert';
type ProjectBudgetType = 'fixed' | 'hourly' | 'not_specified';
type ProjectLocationType = 'remote' | 'onsite' | 'hybrid';
type ProjectVisibility = 'public' | 'private' | 'invite_only';

interface ProjectFormData {
 title: string;
 description: string;
 category: string;
 subcategory: string;
 scope: string;
 skillsRequired: string;
 experienceLevel: ProjectExperienceLevel;
 budgetType: ProjectBudgetType;
 budgetMin: string;
 budgetMax: string;
 currency: string;
 startDate: string;
 endDate: string;
 duration: string;
 isUrgent: boolean;
 locationType: ProjectLocationType;
 visibility: ProjectVisibility;
}

interface ProjectProposalCount {
 count?: number | null;
}

interface OpenDeckProject {
 id: string;
 title?: string | null;
 description?: string | null;
 category?: string | null;
 subcategory?: string | null;
 scope?: string | null;
 skills_required?: string[] | null;
 experience_level?: string | null;
 budget_type?: string | null;
 budget_min?: number | null;
 budget_max?: number | null;
 currency?: string | null;
 start_date?: string | null;
 end_date?: string | null;
 duration?: string | null;
 is_urgent?: boolean | null;
 location_type?: string | null;
 visibility?: string | null;
 status: ProjectStatus;
 proposals?: ProjectProposalCount[];
 created_at: string;
 client_id: string;
 organization_id: string;
 is_demo?: boolean | null;
}

interface ProjectPostingClientProps {
 userId: string;
 orgId: string;
}

const categories = [
 'Audio & Sound',
 'Lighting Design',
 'Stage Production',
 'Video & Projection',
 'Event Management',
 'Artist Services',
 'Logistics & Transport',
 'Catering & Hospitality',
 'Security & Safety',
 'Marketing & Promotion',
];

const experienceLevelOptions: ReadonlyArray<{ value: ProjectExperienceLevel; label: string }> = [
 { value: 'entry', label: 'Entry Level' },
 { value: 'intermediate', label: 'Intermediate' },
 { value: 'expert', label: 'Expert' },
];

const budgetTypeOptions: ReadonlyArray<{ value: ProjectBudgetType; label: string }> = [
 { value: 'fixed', label: 'Fixed Price' },
 { value: 'hourly', label: 'Hourly Rate' },
 { value: 'not_specified', label: 'Not Specified' },
];

const locationTypeOptions: ReadonlyArray<{ value: ProjectLocationType; label: string }> = [
 { value: 'remote', label: 'Remote' },
 { value: 'onsite', label: 'Onsite' },
 { value: 'hybrid', label: 'Hybrid' },
];

const visibilityOptions: ReadonlyArray<{ value: ProjectVisibility; label: string }> = [
 { value: 'public', label: 'Public' },
 { value: 'private', label: 'Private' },
 { value: 'invite_only', label: 'Invite Only' },
];

const createInitialFormData = (): ProjectFormData => ({
 title: '',
 description: '',
 category: '',
 subcategory: '',
 scope: '',
 skillsRequired: '',
 experienceLevel: 'entry',
 budgetType: 'not_specified',
 budgetMin: '',
 budgetMax: '',
 currency: 'USD',
 startDate: '',
 endDate: '',
 duration: '',
 isUrgent: false,
 locationType: 'remote',
 visibility: 'public',
});

export default function ProjectPostingClient({ userId, orgId }: ProjectPostingClientProps) {
 const supabase = createBrowserClient();
 const [projects, setProjects] = useState<OpenDeckProject[]>([]);
 const [loading, setLoading] = useState(true);
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [selectedProject, setSelectedProject] = useState<OpenDeckProject | null>(null);
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [filterStatus, setFilterStatus] = useState('all');
 const [searchQuery, setSearchQuery] = useState('');
 const [formData, setFormData] = useState<ProjectFormData>(() => createInitialFormData());

 useEffect(() => {
 loadProjects();
 }, [userId, orgId]);

 const loadProjects = useCallback(async () => {
 setLoading(true);
 try {
 const { data, error: fetchError } = await supabase
 .from('opendeck_projects')
 .select(
 `*, proposals:opendeck_proposals(count)`
 )
 .eq('client_id', userId)
 .order('created_at', { ascending: false });

 if (fetchError) {
 throw fetchError;
 }

 setProjects((data || []) as OpenDeckProject[]);
 } catch (fetchErr) {
 console.error('Error loading projects:', fetchErr);
 } finally {
 setLoading(false);
 }
 }, [supabase, userId]);

 const updateForm = useCallback(<Key extends keyof ProjectFormData>(field: Key, value: ProjectFormData[Key]) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 }, []);

 const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
 const { name, value, type, checked } = event.target;
 if (type === 'checkbox') {
 updateForm(name as keyof ProjectFormData, checked as ProjectFormData[keyof ProjectFormData]);
 return;
 }
 updateForm(name as keyof ProjectFormData, value as ProjectFormData[keyof ProjectFormData]);
 }, [updateForm]);

 const handleTextareaChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
 const { name, value } = event.target;
 updateForm(name as keyof ProjectFormData, value as ProjectFormData[keyof ProjectFormData]);
 }, [updateForm]);

 const handleSelectChange = useCallback(<Key extends keyof ProjectFormData>(field: Key) => (value: string) => {
 updateForm(field, value as ProjectFormData[Key]);
 }, [updateForm]);

 const handleOpenDrawer = useCallback((project?: OpenDeckProject) => {
 if (project) {
 setSelectedProject(project);
 setFormData({
 title: project.title ?? '',
 description: project.description ?? '',
 category: project.category ?? '',
 subcategory: project.subcategory ?? '',
 scope: project.scope ?? '',
 skillsRequired: (project.skills_required ?? []).join(', '),
 experienceLevel: (project.experience_level as ProjectExperienceLevel) || 'entry',
 budgetType: (project.budget_type as ProjectBudgetType) || 'not_specified',
 budgetMin: project.budget_min != null ? String(project.budget_min) : '',
 budgetMax: project.budget_max != null ? String(project.budget_max) : '',
 currency: project.currency ?? 'USD',
 startDate: project.start_date ?? '',
 endDate: project.end_date ?? '',
 duration: project.duration ?? '',
 isUrgent: project.is_urgent ?? false,
 locationType: (project.location_type as ProjectLocationType) || 'remote',
 visibility: (project.visibility as ProjectVisibility) || 'public',
 });
 } else {
 setSelectedProject(null);
 setFormData(createInitialFormData());
 }

 setError(null);
 setDrawerOpen(true);
 }, []);

 const handleCloseDrawer = useCallback(() => {
 if (isSubmitting) {
 return;
 }

 setDrawerOpen(false);
 setSelectedProject(null);
 setFormData(createInitialFormData());
 setError(null);
 }, [isSubmitting]);

 const deleteProject = useCallback(async (id: string) => {
 if (!confirm('Are you sure you want to delete this project?')) {
 return;
 }

 try {
 const { error: deleteError } = await supabase
 .from('opendeck_projects')
 .delete()
 .eq('id', id);

 if (deleteError) {
 throw deleteError;
 }

 loadProjects();
 } catch (deleteErr) {
 console.error('Error deleting project:', deleteErr);
 }
 }, [loadProjects, supabase]);

 const filteredProjects = useMemo(() => {
 return projects.filter(project => {
 const title = project.title || '';
 const description = project.description || '';
 const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
 const matchesSearch =
 title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 description.toLowerCase().includes(searchQuery.toLowerCase());

 return matchesStatus && matchesSearch;
 });
 }, [filterStatus, projects, searchQuery]);

 const statusItems = useMemo(() => (
 <>
 <SelectItem value="all">All Projects</SelectItem>
 <SelectItem value="draft">Draft</SelectItem>
 <SelectItem value="open">Open</SelectItem>
 <SelectItem value="in_progress">In Progress</SelectItem>
 <SelectItem value="completed">Completed</SelectItem>
 </>
 ), []);

 const experienceLevelItems = useMemo(() => experienceLevelOptions.map(option => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 )), []);

 const budgetTypeItems = useMemo(() => budgetTypeOptions.map(option => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 )), []);

 const locationTypeItems = useMemo(() => locationTypeOptions.map(option => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 )), []);

 const visibilityItems = useMemo(() => visibilityOptions.map(option => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 )), []);

 const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();

 const trimmedTitle = formData.title.trim();
 const trimmedDescription = formData.description.trim();
 const trimmedScope = formData.scope.trim();
 const trimmedCategory = formData.category.trim();
 const trimmedSkills = formData.skillsRequired.split(',').map(skill => skill.trim()).filter(Boolean);

 if (trimmedTitle.length < 5) {
 setError('Title must be at least 5 characters.');
 return;
 }

 if (trimmedDescription.length < 50) {
 setError('Description must be at least 50 characters.');
 return;
 }

 if (!trimmedCategory) {
 setError('Category is required.');
 return;
 }

 if (trimmedScope.length < 20) {
 setError('Scope must be at least 20 characters.');
 return;
 }

 if (trimmedSkills.length === 0) {
 setError('Please specify at least one required skill.');
 return;
 }

 const budgetMinValue = parseFloat(formData.budgetMin.trim());
 const budgetMaxValue = parseFloat(formData.budgetMax.trim());

 if (formData.budgetType !== 'not_specified') {
 if (Number.isNaN(budgetMinValue) || budgetMinValue < 0) {
 setError('Minimum budget must be a non-negative number.');
 return;
 }

 if (Number.isNaN(budgetMaxValue) || budgetMaxValue < 0) {
 setError('Maximum budget must be a non-negative number.');
 return;
 }

 if (budgetMaxValue < budgetMinValue) {
 setError('Maximum budget must be greater than or equal to minimum budget.');
 return;
 }
 }

 setError(null);
 setIsSubmitting(true);

 const payload = {
 title: trimmedTitle,
 description: trimmedDescription,
 category: trimmedCategory,
 subcategory: formData.subcategory.trim() || undefined,
 scope: trimmedScope,
 skills_required: trimmedSkills,
 experience_level: formData.experienceLevel,
 budget_type: formData.budgetType,
 budget_min: formData.budgetType === 'not_specified' ? null : budgetMinValue,
 budget_max: formData.budgetType === 'not_specified' ? null : budgetMaxValue,
 currency: formData.currency,
 start_date: formData.startDate || undefined,
 end_date: formData.endDate || undefined,
 duration: formData.duration.trim() || undefined,
 is_urgent: formData.isUrgent,
 location_type: formData.locationType,
 visibility: formData.visibility,
 client_id: userId,
 organization_id: orgId,
 status: selectedProject?.status || 'open',
 };

 try {
 if (selectedProject) {
 const { error: updateError } = await supabase
 .from('opendeck_projects')
 .update(payload)
 .eq('id', selectedProject.id);

 if (updateError) {
 throw updateError;
 }
 } else {
 const { error: insertError } = await supabase
 .from('opendeck_projects')
 .insert(payload);

 if (insertError) {
 throw insertError;
 }
 }

 setDrawerOpen(false);
 setSelectedProject(null);
 setFormData(createInitialFormData());
 loadProjects();
 } catch (submitError) {
 console.error('Error saving project:', submitError);
 setError(submitError instanceof Error ? submitError.message : 'An unexpected error occurred while saving the project.');
 } finally {
 setIsSubmitting(false);
 }
 }, [formData, loadProjects, orgId, selectedProject, supabase, userId]);

 const isSubmitDisabled = useMemo(() => {
 return (
 isSubmitting ||
 !formData.title.trim() ||
 formData.title.trim().length < 5 ||
 !formData.description.trim() ||
 formData.description.trim().length < 50 ||
 !formData.category.trim() ||
 !formData.scope.trim() ||
 formData.scope.trim().length < 20 ||
 formData.skillsRequired.split(',').map(skill => skill.trim()).filter(Boolean).length === 0
 );
 }, [formData, isSubmitting]);

 if (loading) {
 return (
 <div className="brand-marketplace flex items-center justify-center h-64">
 <div className="brand-marketplace animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
 </div>
 );
 }

 return (
 <div className="brand-marketplace stack-lg">
 <div className="brand-marketplace flex justify-between items-center">
 <div>
 <h2 className="text-heading-3">Project Postings</h2>
 <p className="color-muted">Manage your project briefs and proposals</p>
 </div>
 <Button onClick={() => handleOpenDrawer()}>
 <Plus className="h-4 w-4 mr-sm" />
 Post New Project
 </Button>
 </div>

 <Card className="p-md">
 <div className="brand-marketplace flex flex-col md:flex-row gap-md">
 <div className="brand-marketplace flex-1">
 <div className="brand-marketplace relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 color-muted" />
 <UnifiedInput
 placeholder="Search projects..."
 value={searchQuery}
 onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
 className="pl-2xl"
 />
 </div>
 </div>
 <Select value={filterStatus} onValueChange={setFilterStatus}>
 <SelectTrigger className="w-[180px]">
 <SelectValue placeholder="Filter by status" />
 </SelectTrigger>
 <SelectContent>{statusItems}</SelectContent>
 </Select>
 <div className="brand-marketplace flex gap-sm">
 <Button
 variant={viewMode === 'grid' ? 'default' : 'outline'}
 onClick={() => setViewMode('grid')}
 >
 Grid
 </Button>
 <Button
 variant={viewMode === 'list' ? 'default' : 'outline'}
 onClick={() => setViewMode('list')}
 >
 List
 </Button>
 </div>
 </div>
 </Card>

 {filteredProjects.length === 0 ? (
 <Card className="p-2xl text-center">
 <div className="brand-marketplace max-w-md mx-auto">
 <Paperclip className="h-12 w-12 mx-auto mb-md color-muted" />
 <h3 className="text-body text-heading-4 mb-sm">No projects found</h3>
 <p className="color-muted mb-md">
 Post your first project to start receiving proposals from vendors
 </p>
 <Button onClick={() => handleOpenDrawer()}>
 <Plus className="h-4 w-4 mr-sm" />
 Post New Project
 </Button>
 </div>
 </Card>
 ) : viewMode === 'grid' ? (
 <div className="brand-marketplace grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {filteredProjects.map(project => (
 <ProjectCard
 key={project.id}
 project={project}
 onEdit={handleOpenDrawer}
 onDelete={deleteProject}
 />
 ))}
 </div>
 ) : (
 <Card>
 <div className="brand-marketplace divide-y">
 {filteredProjects.map(project => (
 <ProjectListRow
 key={project.id}
 project={project}
 onEdit={handleOpenDrawer}
 onDelete={deleteProject}
 />
 ))}
 </div>
 </Card>
 )}

 <AppDrawer
 open={drawerOpen}
 onClose={handleCloseDrawer}
 record={selectedProject}
 mode={selectedProject ? 'edit' : 'create'}
 title={selectedProject ? 'Edit Project' : 'Post New Project'}
 fields={[]}
 loading={isSubmitting}
 tabs={[{
 key: 'details',
 label: 'Details',
 content: (
 <form onSubmit={handleSubmit} className="p-lg stack-md">
 <div>
 <label htmlFor="title" className="text-body-sm form-label">
 Project Title
 </label>
 <UnifiedInput
 
 
 value={formData.title}
 onChange={handleInputChange}
 placeholder="e.g., Stage Design for Music Festival"
 required
 />
 </div>

 <div>
 <label htmlFor="category" className="text-body-sm form-label">
 Category
 </label>
 <Select
 value={formData.category}
 onValueChange={handleSelectChange('category')}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select category" />
 </SelectTrigger>
 <SelectContent>
 {categories.map(cat => (
 <SelectItem key={cat} value={cat}>
 {cat}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div>
 <label htmlFor="description" className="text-body-sm form-label">
 Description
 </label>
 <Textarea
 
 
 value={formData.description}
 onChange={handleTextareaChange}
 placeholder="Describe your project requirements in detail..."
 rows={4}
 required
 />
 </div>

 <div>
 <label htmlFor="scope" className="text-body-sm form-label">
 Scope of Work
 </label>
 <Textarea
 
 
 value={formData.scope}
 onChange={handleTextareaChange}
 placeholder="Define the scope and deliverables..."
 rows={3}
 required
 />
 </div>

 <div>
 <label htmlFor="skillsRequired" className="text-body-sm form-label">
 Required Skills
 </label>
 <UnifiedInput
 
 
 value={formData.skillsRequired}
 onChange={handleInputChange}
 placeholder="Comma-separated list of skills"
 required
 />
 </div>

 <div className="brand-marketplace grid grid-cols-1 gap-md md:grid-cols-2">
 <div>
 <label className="text-body-sm form-label">Budget Type</label>
 <Select
 value={formData.budgetType}
 onValueChange={handleSelectChange('budgetType')}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>{budgetTypeItems}</SelectContent>
 </Select>
 </div>

 <div>
 <label className="text-body-sm form-label">Experience Level</label>
 <Select
 value={formData.experienceLevel}
 onValueChange={handleSelectChange('experienceLevel')}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>{experienceLevelItems}</SelectContent>
 </Select>
 </div>
 </div>

 {formData.budgetType !== 'not_specified' && (
 <div className="brand-marketplace grid grid-cols-1 gap-md md:grid-cols-2">
 <div>
 <label htmlFor="budgetMin" className="text-body-sm form-label">
 {formData.budgetType === 'hourly' ? 'Min Rate' : 'Min Budget'}
 </label>
 <UnifiedInput
 
 
 type="number"
 value={formData.budgetMin}
 onChange={handleInputChange}
 placeholder="0"
 min="0"
 step="0.01"
 />
 </div>
 <div>
 <label htmlFor="budgetMax" className="text-body-sm form-label">
 {formData.budgetType === 'hourly' ? 'Max Rate' : 'Max Budget'}
 </label>
 <UnifiedInput
 
 
 type="number"
 value={formData.budgetMax}
 onChange={handleInputChange}
 placeholder="0"
 min="0"
 step="0.01"
 />
 </div>
 </div>
 )}

 <div className="brand-marketplace grid grid-cols-1 gap-md md:grid-cols-2">
 <div>
 <label htmlFor="startDate" className="text-body-sm form-label">
 Start Date
 </label>
 <UnifiedInput
 
 
 type="date"
 value={formData.startDate}
 onChange={handleInputChange}
 />
 </div>
 <div>
 <label htmlFor="endDate" className="text-body-sm form-label">
 End Date
 </label>
 <UnifiedInput
 
 
 type="date"
 value={formData.endDate}
 onChange={handleInputChange}
 />
 </div>
 </div>

 <div>
 <label htmlFor="duration" className="text-body-sm form-label">
 Duration
 </label>
 <UnifiedInput
 
 
 value={formData.duration}
 onChange={handleInputChange}
 placeholder="e.g., 2 weeks, 1 month"
 />
 </div>

 <div className="brand-marketplace grid grid-cols-1 gap-md md:grid-cols-2">
 <div>
 <label className="text-body-sm form-label">Location Type</label>
 <Select
 value={formData.locationType}
 onValueChange={handleSelectChange('locationType')}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>{locationTypeItems}</SelectContent>
 </Select>
 </div>
 <div>
 <label className="text-body-sm form-label">Visibility</label>
 <Select
 value={formData.visibility}
 onValueChange={handleSelectChange('visibility')}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>{visibilityItems}</SelectContent>
 </Select>
 </div>
 </div>

 <div className="brand-marketplace flex items-center gap-sm pt-sm">
 <input
 
 
 type="checkbox"
 checked={formData.isUrgent}
 onChange={handleInputChange}
 className="rounded border-border"
 />
 <label htmlFor="isUrgent" className="text-body-sm">
 Mark as urgent project
 </label>
 </div>

 <div className="brand-marketplace flex items-center justify-between gap-sm pt-md">
 <div className="flex items-center gap-sm text-body-sm color-muted">
 {error && (
 <>
 <AlertCircle className="h-4 w-4 color-destructive" />
 <span className="color-destructive">{error}</span>
 </>
 )}
 </div>
 <div className="brand-marketplace flex items-center gap-sm">
 <Button type="button" variant="outline" onClick={handleCloseDrawer}>
 Cancel
 </Button>
 <Button type="submit" disabled={isSubmitDisabled}>
 {selectedProject ? 'Update Project' : 'Post Project'}
 </Button>
 </div>
 </div>
 </form>
 ),
 }]}
 />
 </div>
 );
}

interface ProjectCardProps {
 project: OpenDeckProject;
 onEdit: (project: OpenDeckProject) => void;
 onDelete: (id: string) => void;
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
 return (
 <Card className="p-lg hover:shadow-floating transition-shadow">
 <div className="brand-marketplace flex justify-between items-start mb-md">
 <div>
 <h3 className="text-body text-heading-4">{project.title}</h3>
 <p className="text-body-sm color-muted">{project.category}</p>
 </div>
 <Badge
 variant={
 project.status === 'open'
 ? 'success'
 : project.status === 'in_progress'
 ? 'warning'
 : 'secondary'
 }
 >
 {project.status}
 </Badge>
 </div>

 <p className="text-body-sm line-clamp-3 mb-md">{project.description}</p>

 <div className="brand-marketplace stack-sm mb-md">
 <div className="brand-marketplace flex items-center text-body-sm">
 <DollarSign className="h-4 w-4 mr-sm color-muted" />
 {project.budget_type === 'fixed'
 ? `$${project.budget_min?.toLocaleString()} - $${project.budget_max?.toLocaleString()}`
 : project.budget_type === 'hourly'
 ? `$${project.budget_min}/hr`
 : 'Budget not specified'}
 </div>
 <div className="brand-marketplace flex items-center text-body-sm">
 <Calendar className="h-4 w-4 mr-sm color-muted" />
 {project.duration || 'Timeline flexible'}
 </div>
 <div className="brand-marketplace flex items-center text-body-sm">
 <MapPin className="h-4 w-4 mr-sm color-muted" />
 {project.location_type || 'Remote'}
 </div>
 <div className="brand-marketplace flex items-center text-body-sm">
 <Users className="h-4 w-4 mr-sm color-muted" />
 {project.proposals?.[0]?.count || 0} proposals
 </div>
 </div>

 {project.is_urgent && (
 <Badge variant="destructive" className="mb-md">
 <AlertCircle className="h-3 w-3 mr-xs" />
 Urgent
 </Badge>
 )}

 <div className="brand-marketplace flex cluster-sm">
 <Button variant="outline" className="flex-1" onClick={() => onEdit(project)}>
 <Edit className="h-4 w-4 mr-xs" />
 Edit
 </Button>
 <Button variant="outline" className="flex-1">
 <Eye className="h-4 w-4 mr-xs" />
 View
 </Button>
 <Button variant="ghost" onClick={() => onDelete(project.id)}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </Card>
 );
}

interface ProjectListRowProps {
 project: OpenDeckProject;
 onEdit: (project: OpenDeckProject) => void;
 onDelete: (id: string) => void;
}

function ProjectListRow({ project, onEdit, onDelete }: ProjectListRowProps) {
 return (
 <div className="p-md hover:bg-accent/50 transition-colors">
 <div className="brand-marketplace flex items-center justify-between">
 <div className="brand-marketplace flex-1">
 <div className="brand-marketplace flex items-center gap-sm">
 <h3 className="text-body text-heading-4">{project.title}</h3>
 <Badge
 variant={
 project.status === 'open'
 ? 'success'
 : project.status === 'in_progress'
 ? 'warning'
 : 'secondary'
 }
 >
 {project.status}
 </Badge>
 {project.is_urgent && <Badge variant="destructive">Urgent</Badge>}
 </div>
 <p className="text-body-sm color-muted mt-xs">{project.description}</p>
 <div className="brand-marketplace flex items-center gap-md mt-sm text-body-sm color-muted">
 <span>{project.category}</span>
 <span>•</span>
 <span>{project.proposals?.[0]?.count || 0} proposals</span>
 <span>•</span>
 <span>Posted {new Date(project.created_at).toLocaleDateString()}</span>
 </div>
 </div>
 <div className="brand-marketplace flex items-center gap-sm">
 <Button variant="ghost" onClick={() => onEdit(project)}>
 <Edit className="h-4 w-4" />
 </Button>
 <Button variant="ghost">
 <Eye className="h-4 w-4" />
 </Button>
 <Button variant="ghost" onClick={() => onDelete(project.id)}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </div>
 );
}
