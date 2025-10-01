'use client';

import { Plus, X, Calendar, Building, MapPin, Award, Star, Tag, ExternalLink, DollarSign } from "lucide-react";
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Drawer,
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
 Separator,
 useToast,
} from '@ghxstship/ui';
import type { 
 HistoryEntry, 
 HistoryEntryType, 
 EmploymentType, 
 EducationLevel, 
 ProjectStatus,
 HistoryVisibility 
} from '../types';

const historyEntrySchema = z.object({
 entry_type: z.enum(['employment', 'education', 'project', 'achievement', 'certification', 'volunteer', 'internship', 'freelance', 'other']),
 title: z.string().min(1, 'Title is required'),
 organization: z.string().optional(),
 location: z.string().optional(),
 start_date: z.string().min(1, 'Start date is required'),
 end_date: z.string().optional(),
 is_current: z.boolean().default(false),
 description: z.string().optional(),
 skills_gained: z.array(z.string()).default([]),
 achievements: z.array(z.string()).default([]),
 references: z.string().optional(),
 website_url: z.string().url().optional().or(z.literal('')),
 salary_range: z.string().optional(),
 employment_type: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'internship', 'volunteer']).optional(),
 education_level: z.enum(['high_school', 'associate', 'bachelor', 'master', 'doctorate', 'certificate', 'bootcamp', 'other']).optional(),
 grade_gpa: z.string().optional(),
 project_status: z.enum(['completed', 'in_progress', 'on_hold', 'cancelled']).optional(),
 visibility: z.enum(['public', 'organization', 'private']).default('organization'),
 tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof historyEntrySchema>;

interface CreateHistoryDrawerProps {
 open: boolean;
 onClose: () => void;
 onSave: (data: Omit<HistoryEntry, 'id' | 'organization_id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
 loading?: boolean;
}

const ENTRY_TYPE_OPTIONS: { value: HistoryEntryType; label: string }[] = [
 { value: 'employment', label: 'Employment' },
 { value: 'education', label: 'Education' },
 { value: 'project', label: 'Project' },
 { value: 'achievement', label: 'Achievement' },
 { value: 'certification', label: 'Certification' },
 { value: 'volunteer', label: 'Volunteer Work' },
 { value: 'internship', label: 'Internship' },
 { value: 'freelance', label: 'Freelance Work' },
 { value: 'other', label: 'Other' },
];

const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
 { value: 'full_time', label: 'Full Time' },
 { value: 'part_time', label: 'Part Time' },
 { value: 'contract', label: 'Contract' },
 { value: 'freelance', label: 'Freelance' },
 { value: 'internship', label: 'Internship' },
 { value: 'volunteer', label: 'Volunteer' },
];

const EDUCATION_LEVEL_OPTIONS: { value: EducationLevel; label: string }[] = [
 { value: 'high_school', label: 'High School' },
 { value: 'associate', label: 'Associate Degree' },
 { value: 'bachelor', label: 'Bachelor Degree' },
 { value: 'master', label: 'Master Degree' },
 { value: 'doctorate', label: 'Doctorate' },
 { value: 'certificate', label: 'Certificate' },
 { value: 'bootcamp', label: 'Bootcamp' },
 { value: 'other', label: 'Other' },
];

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
 { value: 'completed', label: 'Completed' },
 { value: 'in_progress', label: 'In Progress' },
 { value: 'on_hold', label: 'On Hold' },
 { value: 'cancelled', label: 'Cancelled' },
];

const VISIBILITY_OPTIONS: { value: HistoryVisibility; label: string }[] = [
 { value: 'public', label: 'Public' },
 { value: 'organization', label: 'Organization' },
 { value: 'private', label: 'Private' },
];

export default function CreateHistoryDrawer({
 open,
 onClose,
 onSave,
 loading = false,
}: CreateHistoryDrawerProps) {
 const { addToast } = useToast();
 const [newSkill, setNewSkill] = useState('');
 const [newAchievement, setNewAchievement] = useState('');
 const [newTag, setNewTag] = useState('');

 const form = useForm<FormData>({
 resolver: zodResolver(historyEntrySchema),
 defaultValues: {
 entry_type: 'employment',
 title: '',
 organization: '',
 location: '',
 start_date: '',
 end_date: '',
 is_current: false,
 description: '',
 skills_gained: [],
 achievements: [],
 references: '',
 website_url: '',
 salary_range: '',
 grade_gpa: '',
 visibility: 'organization',
 tags: [],
 },
 });

 const { watch, setValue, getValues } = form;
 const entryType = watch('entry_type');
 const isCurrent = watch('is_current');
 const skills = watch('skills_gained');
 const achievements = watch('achievements');
 const tags = watch('tags');

 const handleAddSkill = useCallback(() => {
 if (newSkill.trim() && !skills.includes(newSkill.trim())) {
 setValue('skills_gained', [...skills, newSkill.trim()]);
 setNewSkill('');
 }
 }, [newSkill, skills, setValue]);

 const handleRemoveSkill = useCallback((skillToRemove: string) => {
 setValue('skills_gained', skills.filter(skill => skill !== skillToRemove));
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
 title: 'History Entry Created',
 description: 'Your history entry has been successfully created.',
 type: 'success',
 });
 form.reset();
 onClose();
 } catch (error) {
 addToast({
 title: 'Error',
 description: 'Failed to create history entry. Please try again.',
 type: 'error',
 });
 }
 }, [onSave, addToast, form, onClose]);

 const handleClose = useCallback(() => {
 form.reset();
 setNewSkill('');
 setNewAchievement('');
 setNewTag('');
 onClose();
 }, [form, onClose]);

 return (
 <Drawer
 open={open}
 onClose={handleClose}
 title="Add History Entry"
 description="Create a new entry for your professional history"
 >
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
 {/* Basic Information */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Basic Information</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="entry_type">Entry Type *</Label>
 <Select
 value={getValues('entry_type')}
 onValueChange={(value) => setValue('entry_type', value as HistoryEntryType)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {ENTRY_TYPE_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {form.formState.errors.entry_type && (
 <p className="text-sm text-destructive">{form.formState.errors.entry_type.message}</p>
 )}
 </div>

 <div className="space-y-xs">
 <Label htmlFor="visibility">Visibility</Label>
 <Select
 value={getValues('visibility')}
 onValueChange={(value) => setValue('visibility', value as HistoryVisibility)}
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

 <div className="space-y-xs">
 <Label htmlFor="title">Title *</Label>
 <Input
 {...form.register('title')}
 placeholder="e.g., Senior Software Engineer, Bachelor of Computer Science"
 />
 {form.formState.errors.title && (
 <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="organization">Organization</Label>
 <Input
 {...form.register('organization')}
 placeholder="Company, School, or Organization"
 />
 </div>

 <div className="space-y-xs">
 <Label htmlFor="location">Location</Label>
 <Input
 {...form.register('location')}
 placeholder="City, State/Country"
 />
 </div>
 </div>
 </div>

 <Separator />

 {/* Dates */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Timeline</h3>
 
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
 <Label>This is my current role/position</Label>
 </div>
 </div>

 <Separator />

 {/* Type-specific Fields */}
 {(entryType === 'employment' || entryType === 'internship' || entryType === 'freelance') && (
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Employment Details</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="employment_type">Employment Type</Label>
 <Select
 value={getValues('employment_type') || ''}
 onValueChange={(value) => setValue('employment_type', value as EmploymentType)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select type" />
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
 <Label htmlFor="salary_range">Salary Range</Label>
 <Input
 {...form.register('salary_range')}
 placeholder="e.g., $80,000 - $100,000"
 />
 </div>
 </div>
 </div>
 )}

 {entryType === 'education' && (
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Education Details</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="education_level">Education Level</Label>
 <Select
 value={getValues('education_level') || ''}
 onValueChange={(value) => setValue('education_level', value as EducationLevel)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select level" />
 </SelectTrigger>
 <SelectContent>
 {EDUCATION_LEVEL_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="grade_gpa">Grade/GPA</Label>
 <Input
 {...form.register('grade_gpa')}
 placeholder="e.g., 3.8, First Class Honours"
 />
 </div>
 </div>
 </div>
 )}

 {entryType === 'project' && (
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Project Details</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-xs">
 <Label htmlFor="project_status">Project Status</Label>
 <Select
 value={getValues('project_status') || ''}
 onValueChange={(value) => setValue('project_status', value as ProjectStatus)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 {PROJECT_STATUS_OPTIONS.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-xs">
 <Label htmlFor="website_url">Project URL</Label>
 <Input
 {...form.register('website_url')}
 placeholder="https://project-url.com"
 />
 {form.formState.errors.website_url && (
 <p className="text-sm text-destructive">{form.formState.errors.website_url.message}</p>
 )}
 </div>
 </div>
 </div>
 )}

 <Separator />

 {/* Description */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Description</h3>
 
 <div className="space-y-xs">
 <Label htmlFor="description">Description</Label>
 <Textarea
 {...form.register('description')}
 placeholder="Describe your role, responsibilities, and key contributions..."
 rows={4}
 />
 </div>
 </div>

 <Separator />

 {/* Skills */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Skills Gained</h3>
 
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
 <h3 className="text-lg font-semibold">Achievements</h3>
 
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

 {/* Additional Information */}
 <div className="space-y-md">
 <h3 className="text-lg font-semibold">Additional Information</h3>
 
 <div className="space-y-md">
 <div className="space-y-xs">
 <Label htmlFor="references">References</Label>
 <Textarea
 {...form.register('references')}
 placeholder="Contact information for references..."
 rows={2}
 />
 </div>

 {/* Tags */}
 <div className="space-y-sm">
 <Label>Tags</Label>
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
 </div>

 {/* Actions */}
 <div className="flex justify-end gap-sm pt-lg border-t">
 <Button type="button" variant="outline" onClick={handleClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 {loading ? 'Creating...' : 'Create Entry'}
 </Button>
 </div>
 </form>
 </Drawer>
 );
}
