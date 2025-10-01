'use client';

import { Plus, X, Calendar, Building, MapPin, Award, Star, Tag, Briefcase, Users, Save, RefreshCw } from "lucide-react";
import { useState, useCallback } from 'react';
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
 Checkbox,
 Badge,
 Label,
 Card,
 Separator,
 useToast,
} from '@ghxstship/ui';
import type { 
 JobHistoryEntry, 
 JobHistoryFormData,
 EmploymentType, 
 CompanySize,
 JobVisibility 
} from '../types';

const jobHistorySchema = z.object({
 company_name: z.string().min(1, 'Company name is required'),
 job_title: z.string().min(1, 'Job title is required'),
 department: z.string().optional(),
 employment_type: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary', 'consultant']),
 start_date: z.string().min(1, 'Start date is required'),
 end_date: z.string().optional(),
 is_current: z.boolean().default(false),
 location: z.string().optional(),
 description: z.string().optional(),
 achievements: z.array(z.string()).default([]),
 skills_used: z.array(z.string()).default([]),
 responsibilities: z.array(z.string()).default([]),
 salary_range: z.string().optional(),
 supervisor_name: z.string().optional(),
 supervisor_contact: z.string().optional(),
 reason_for_leaving: z.string().optional(),
 company_size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
 industry: z.string().optional(),
 visibility: z.enum(['public', 'organization', 'private']).default('organization'),
 tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof jobHistorySchema>;

interface JobHistoryFormViewProps {
 entry?: JobHistoryEntry | null;
 onSave: (data: JobHistoryFormData) => Promise<void>;
 onCancel: () => void;
 loading?: boolean;
}

const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
 { value: 'full_time', label: 'Full Time' },
 { value: 'part_time', label: 'Part Time' },
 { value: 'contract', label: 'Contract' },
 { value: 'freelance', label: 'Freelance' },
 { value: 'internship', label: 'Internship' },
 { value: 'temporary', label: 'Temporary' },
 { value: 'consultant', label: 'Consultant' },
];

const COMPANY_SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
 { value: 'startup', label: 'Startup (1-10)' },
 { value: 'small', label: 'Small (11-50)' },
 { value: 'medium', label: 'Medium (51-200)' },
 { value: 'large', label: 'Large (201-1000)' },
 { value: 'enterprise', label: 'Enterprise (1000+)' },
];

const VISIBILITY_OPTIONS: { value: JobVisibility; label: string }[] = [
 { value: 'public', label: 'Public' },
 { value: 'organization', label: 'Organization' },
 { value: 'private', label: 'Private' },
];

const COMMON_INDUSTRIES = [
 'Technology',
 'Healthcare',
 'Finance',
 'Education',
 'Manufacturing',
 'Retail',
 'Consulting',
 'Media',
 'Real Estate',
 'Government',
 'Non-profit',
 'Other',
];

export default function JobHistoryFormView({
 entry,
 onSave,
 onCancel,
 loading = false,
}: JobHistoryFormViewProps) {
 const { addToast } = useToast();
 const [newSkill, setNewSkill] = useState('');
 const [newAchievement, setNewAchievement] = useState('');
 const [newResponsibility, setNewResponsibility] = useState('');
 const [newTag, setNewTag] = useState('');

 const form = useForm<FormData>({
 resolver: zodResolver(jobHistorySchema),
 defaultValues: entry ? {
 company_name: entry.company_name,
 job_title: entry.job_title,
 department: entry.department || '',
 employment_type: entry.employment_type,
 start_date: entry.start_date.split('T')[0],
 end_date: entry.end_date ? entry.end_date.split('T')[0] : '',
 is_current: entry.is_current,
 location: entry.location || '',
 description: entry.description || '',
 achievements: entry.achievements,
 skills_used: entry.skills_used,
 responsibilities: entry.responsibilities,
 salary_range: entry.salary_range || '',
 supervisor_name: entry.supervisor_name || '',
 supervisor_contact: entry.supervisor_contact || '',
 reason_for_leaving: entry.reason_for_leaving || '',
 company_size: entry.company_size || undefined,
 industry: entry.industry || '',
 visibility: entry.visibility,
 tags: entry.tags,
 } : {
 company_name: '',
 job_title: '',
 department: '',
 employment_type: 'full_time',
 start_date: '',
 end_date: '',
 is_current: false,
 location: '',
 description: '',
 achievements: [],
 skills_used: [],
 responsibilities: [],
 salary_range: '',
 supervisor_name: '',
 supervisor_contact: '',
 reason_for_leaving: '',
 industry: '',
 visibility: 'organization',
 tags: [],
 },
 });

 const { watch, setValue, getValues } = form;
 const isCurrent = watch('is_current');
 const skills = watch('skills_used');
 const achievements = watch('achievements');
 const responsibilities = watch('responsibilities');
 const tags = watch('tags');

 const handleAddSkill = useCallback(() => {
 if (newSkill.trim() && !skills.includes(newSkill.trim())) {
 setValue('skills_used', [...skills, newSkill.trim()]);
 setNewSkill('');
 }
 }, [newSkill, skills, setValue]);

 const handleRemoveSkill = useCallback((skillToRemove: string) => {
 setValue('skills_used', skills.filter(skill => skill !== skillToRemove));
 }, [skills, setValue]);

 const handleAddAchievement = useCallback(() => {
 if (newAchievement.trim() && !achievements.includes(newAchievement.trim())) {
 setValue('achievements', [...achievements, newAchievement.trim()]);
 setNewAchievement('');
 }
 }, [newAchievement, achievements, setValue]);

 const handleRemoveAchievement = useCallback((achievementToRemove: string) => {
 setValue('achievements', achievements.filter(achievement => achievement !== achievementToRemove));
 }, [achievements, setValue]);

 const handleAddResponsibility = useCallback(() => {
 if (newResponsibility.trim() && !responsibilities.includes(newResponsibility.trim())) {
 setValue('responsibilities', [...responsibilities, newResponsibility.trim()]);
 setNewResponsibility('');
 }
 }, [newResponsibility, responsibilities, setValue]);

 const handleRemoveResponsibility = useCallback((responsibilityToRemove: string) => {
 setValue('responsibilities', responsibilities.filter(responsibility => responsibility !== responsibilityToRemove));
 }, [responsibilities, setValue]);

 const handleAddTag = useCallback(() => {
 if (newTag.trim() && !tags.includes(newTag.trim())) {
 setValue('tags', [...tags, newTag.trim()]);
 setNewTag('');
 }
 }, [newTag, tags, setValue]);

 const handleRemoveTag = useCallback((tagToRemove: string) => {
 setValue('tags', tags.filter(tag => tag !== tagToRemove));
 }, [tags, setValue]);

 const onSubmit = useCallback(async (data: FormData) => {
 try {
 await onSave(data);
 addToast({
 title: entry ? 'Job Updated' : 'Job Added',
 description: `Your job history entry has been successfully ${entry ? 'updated' : 'created'}.`,
 type: 'success',
 });
 } catch (error) {
 addToast({
 title: 'Error',
 description: `Failed to ${entry ? 'update' : 'create'} job history entry. Please try again.`,
 type: 'error',
 });
 }
 }, [entry, onSave, addToast]);

 return (
 <div className="max-w-4xl mx-auto">
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-lg">
 <div>
 <h2 className="text-xl font-bold">
 {entry ? 'Edit Job History Entry' : 'Add Job History Entry'}
 </h2>
 <p className="text-muted-foreground">
 {entry ? 'Update your job history information' : 'Add a new position to your job history'}
 </p>
 </div>
 <div className="flex gap-sm">
 <Button variant="outline" onClick={onCancel}>
 Cancel
 </Button>
 <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
 {loading ? (
 <>
 <RefreshCw className="h-icon-xs w-icon-xs mr-xs animate-spin" />
 {entry ? 'Updating...' : 'Saving...'}
 </>
 ) : (
 <>
 <Save className="h-icon-xs w-icon-xs mr-xs" />
 {entry ? 'Update' : 'Save'}
 </>
 )}
 </Button>
 </div>
 </div>

 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
 {/* Basic Information */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold flex items-center gap-sm">
 <Briefcase className="h-icon-sm w-icon-sm" />
 Basic Information
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="company_name">Company Name *</Label>
 <Input
 {...form.register('company_name')}
 placeholder="e.g., Google, Microsoft, Startup Inc."
 />
 {form.formState.errors.company_name && (
 <p className="text-sm text-destructive">{form.formState.errors.company_name.message}</p>
 )}
 </div>

 <div className="space-y-xs">
 <Label htmlFor="job_title">Job Title *</Label>
 <Input
 {...form.register('job_title')}
 placeholder="e.g., Senior Software Engineer, Product Manager"
 />
 {form.formState.errors.job_title && (
 <p className="text-sm text-destructive">{form.formState.errors.job_title.message}</p>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="department">Department</Label>
 <Input
 {...form.register('department')}
 placeholder="e.g., Engineering, Marketing, Sales"
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="employment_type">Employment Type *</Label>
 <Select
 value={getValues('employment_type')}
 onValueChange={(value) => setValue('employment_type', value as EmploymentType)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="visibility">Visibility</Label>
 <Select
 value={getValues('visibility')}
 onValueChange={(value) => setValue('visibility', value as JobVisibility)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {VISIBILITY_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="location">Location</Label>
 <Input
 {...form.register('location')}
 placeholder="e.g., San Francisco, CA or Remote"
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="salary_range">Salary Range</Label>
 <Input
 {...form.register('salary_range')}
 placeholder="e.g., $80,000 - $120,000"
 />
 </div>
 </div>
 </div>

 <Separator />

 {/* Timeline */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold flex items-center gap-sm">
 <Calendar className="h-icon-sm w-icon-sm" />
 Timeline
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="start_date">Start Date *</Label>
 <Input
 {...form.register('start_date')}
 type="date"
 />
 {form.formState.errors.start_date && (
 <p className="text-sm text-destructive">{form.formState.errors.start_date.message}</p>
 )}
 </div>

 <div className="space-y-xs">
 <Label htmlFor="end_date">End Date</Label>
 <Input
 {...form.register('end_date')}
 type="date"
 disabled={isCurrent}
 />
 </div>
 </div>

 <div className="flex items-center space-x-xs">
 <Checkbox
 checked={isCurrent}
 onCheckedChange={(checked) => setValue('is_current', !!checked)}
 />
 <Label>This is my current position</Label>
 </div>

 {!isCurrent && (
 <div className="space-y-xs">
 <Label htmlFor="reason_for_leaving">Reason for Leaving</Label>
 <Textarea
 {...form.register('reason_for_leaving')}
 placeholder="e.g., Career advancement, relocation, company restructuring..."
 rows={2}
 />
 </div>
 )}
 </div>

 <Separator />

 {/* Company Details */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold flex items-center gap-sm">
 <Building className="h-icon-sm w-icon-sm" />
 Company Details
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="company_size">Company Size</Label>
 <Select
 value={getValues('company_size') || ''}
 onValueChange={(value) => setValue('company_size', value as CompanySize)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select company size" />
 </SelectTrigger>
 <SelectContent>
 {COMPANY_SIZE_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="industry">Industry</Label>
 <Select
 value={getValues('industry') || ''}
 onValueChange={(value) => setValue('industry', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select industry" />
 </SelectTrigger>
 <SelectContent>
 {COMMON_INDUSTRIES.map((industry) => (
 <SelectItem key={industry} value={industry}>
 {industry}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="supervisor_name">Supervisor Name</Label>
 <Input
 {...form.register('supervisor_name')}
 placeholder="e.g., John Smith"
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="supervisor_contact">Supervisor Contact</Label>
 <Input
 {...form.register('supervisor_contact')}
 placeholder="e.g., john.smith@company.com"
 />
 </div>
 </div>
 </div>

 <Separator />

 {/* Job Description */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Job Description</h3>
 
 <div className="space-y-xs">
 <Label htmlFor="description">Description</Label>
 <Textarea
 {...form.register('description')}
 placeholder="Describe your role, the company, and your overall experience..."
 rows={4}
 />
 </div>
 </div>

 <Separator />

 {/* Responsibilities */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Key Responsibilities</h3>
 
 <div className="space-y-sm">
 <div className="flex gap-sm">
 <Input
 value={newResponsibility}
 onChange={(e) => setNewResponsibility(e.target.value)}
 placeholder="Add a key responsibility..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResponsibility())}
 />
 <Button type="button" onClick={handleAddResponsibility} size="sm">
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 
 {responsibilities.length > 0 && (
 <div className="space-y-xs">
 {responsibilities.map((responsibility, index) => (
 <div key={index} className="flex items-start gap-sm p-sm bg-muted rounded">
 <span className="flex-1 text-sm">{responsibility}</span>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 className="h-auto p-0 hover:bg-transparent"
 onClick={() => handleRemoveResponsibility(responsibility)}
 >
 <X className="h-3 w-3" />
 </Button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 <Separator />

 {/* Skills */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold flex items-center gap-sm">
 <Star className="h-icon-sm w-icon-sm" />
 Skills Used
 </h3>
 
 <div className="space-y-sm">
 <div className="flex gap-sm">
 <Input
 value={newSkill}
 onChange={(e) => setNewSkill(e.target.value)}
 placeholder="Add a skill..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
 />
 <Button type="button" onClick={handleAddSkill} size="sm">
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 
 {skills.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {skills.map((skill, index) => (
 <Badge key={index} variant="secondary" className="flex items-center gap-xs">
 {skill}
 <Button
 type="button"
 variant="ghost"
 size="sm"
 className="h-auto p-0 hover:bg-transparent"
 onClick={() => handleRemoveSkill(skill)}
 >
 <X className="h-3 w-3" />
 </Button>
 </Badge>
 ))}
 </div>
 )}
 </div>
 </div>

 <Separator />

 {/* Achievements */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold flex items-center gap-sm">
 <Award className="h-icon-sm w-icon-sm" />
 Achievements
 </h3>
 
 <div className="space-y-sm">
 <div className="flex gap-sm">
 <Input
 value={newAchievement}
 onChange={(e) => setNewAchievement(e.target.value)}
 placeholder="Add an achievement..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
 />
 <Button type="button" onClick={handleAddAchievement} size="sm">
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 
 {achievements.length > 0 && (
 <div className="space-y-xs">
 {achievements.map((achievement, index) => (
 <div key={index} className="flex items-start gap-sm p-sm bg-muted rounded">
 <Award className="h-icon-xs w-icon-xs text-yellow-500 mt-0.5 flex-shrink-0" />
 <span className="flex-1 text-sm">{achievement}</span>
 <Button
 type="button"
 variant="ghost"
 size="sm"
 className="h-auto p-0 hover:bg-transparent"
 onClick={() => handleRemoveAchievement(achievement)}
 >
 <X className="h-3 w-3" />
 </Button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 <Separator />

 {/* Tags */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold flex items-center gap-sm">
 <Tag className="h-icon-sm w-icon-sm" />
 Tags
 </h3>
 
 <div className="space-y-sm">
 <div className="flex gap-sm">
 <Input
 value={newTag}
 onChange={(e) => setNewTag(e.target.value)}
 placeholder="Add a tag..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
 />
 <Button type="button" onClick={handleAddTag} size="sm">
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 
 {tags.length > 0 && (
 <div className="flex flex-wrap gap-xs">
 {tags.map((tag, index) => (
 <Badge key={index} variant="outline" className="flex items-center gap-xs">
 <Tag className="h-3 w-3" />
 {tag}
 <Button
 type="button"
 variant="ghost"
 size="sm"
 className="h-auto p-0 hover:bg-transparent"
 onClick={() => handleRemoveTag(tag)}
 >
 <X className="h-3 w-3" />
 </Button>
 </Badge>
 ))}
 </div>
 )}
 </div>
 </div>
 </form>
 </Card>
 </div>
 );
}
