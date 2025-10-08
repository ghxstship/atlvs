'use client';

import { X, Save, Plus, User, Building, ExternalLink } from "lucide-react";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
 Badge,
 Card
} from '@ghxstship/ui';
import type { ProfessionalProfile, ProfessionalFormData, EmploymentType, ProfileStatus } from '../types';
import {
 EMPLOYMENT_TYPE_LABELS,
 PROFILE_STATUS_LABELS,
 COMMON_SKILLS
} from '../types';

const formSchema = z.object({
 job_title: z.string().optional(),
 department: z.string().optional(),
 employee_id: z.string().optional(),
 hire_date: z.string().optional(),
 employment_type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'intern']).optional(),
 manager_id: z.string().optional(),
 bio: z.string().optional(),
 linkedin_url: z.string().url().optional().or(z.literal('')),
 website_url: z.string().url().optional().or(z.literal('')),
 status: z.enum(['active', 'inactive', 'pending', 'suspended'])
});

type FormData = z.infer<typeof formSchema>;

interface CreateProfessionalDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 onSave: (data: ProfessionalFormData) => Promise<void>;
 profile?: ProfessionalProfile | null;
 managers?: Array<{ id: string; name: string; email: string }>;
 departments?: string[];
 loading?: boolean;
}

export default function CreateProfessionalDrawer({
 isOpen,
 onClose,
 onSave,
 profile,
 managers = [],
 departments = [],
 loading = false
}: CreateProfessionalDrawerProps) {
 const [skills, setSkills] = useState<string[]>([]);
 const [newSkill, setNewSkill] = useState('');
 const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

 const {
 register,
 handleSubmit,
 formState: { errors: _errors },
 reset,
 watch,
 setValue
 } = useForm<FormData>({
 resolver: zodResolver(formSchema),
 defaultValues: {
 job_title: '',
 department: '',
 employee_id: '',
 hire_date: '',
 employment_type: 'full-time',
 manager_id: '',
 bio: '',
 linkedin_url: '',
 website_url: '',
 status: 'active'
 }
 });

 // Load profile data when editing
 useEffect(() => {
 if (profile) {
 reset({
 job_title: profile.job_title || '',
 department: profile.department || '',
 employee_id: profile.employee_id || '',
 hire_date: profile.hire_date || '',
 employment_type: profile.employment_type || 'full-time',
 manager_id: profile.manager_id || '',
 bio: profile.bio || '',
 linkedin_url: profile.linkedin_url || '',
 website_url: profile.website_url || '',
 status: profile.status
 });
 setSkills(profile.skills || []);
 } else {
 reset({
 job_title: '',
 department: '',
 employee_id: '',
 hire_date: '',
 employment_type: 'full-time',
 manager_id: '',
 bio: '',
 linkedin_url: '',
 website_url: '',
 status: 'active'
 });
 setSkills([]);
 }
 }, [profile, reset]);

 const onSubmit = async (data: FormData) => {
 await onSave({
 ...data,
 skills
 } as ProfessionalFormData);
 };

 const addSkill = (skill: string) => {
 if (skill && !skills.includes(skill)) {
 setSkills([...skills, skill]);
 setNewSkill('');
 setShowSkillSuggestions(false);
 }
 };

 const removeSkill = (skillToRemove: string) => {
 setSkills(skills.filter(skill => skill !== skillToRemove));
 };

 const filteredSkillSuggestions = COMMON_SKILLS.filter(skill => 
 skill.toLowerCase().includes(newSkill.toLowerCase()) && 
 !skills.includes(skill)
 );

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 overflow-hidden">
 <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
 
 <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-background shadow-lg overflow-y-auto">
 <div className="sticky top-0 z-10 bg-background border-b border-border p-md flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <User className="h-icon-sm w-icon-sm" />
 <h2 className="text-lg font-semibold">
 {profile ? 'Edit Professional Profile' : 'Create Professional Profile'}
 </h2>
 </div>
 <Button variant="ghost" size="sm" onClick={onClose}>
 <X className="h-icon-xs w-icon-xs" />
 </Button>
 </div>

 <form onSubmit={handleSubmit(onSubmit)} className="p-lg space-y-lg">
 {/* Basic Information */}
 <Card className="p-lg">
 <h3 className="text-md font-semibold mb-md flex items-center gap-xs">
 <User className="h-icon-sm w-icon-sm" />
 Basic Information
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <Label htmlFor="job_title">Job Title</Label>
 <Input
 id="job_title"
 placeholder="e.g., Senior Developer"
 {...register('job_title')}
 />
 </div>
 <div>
 <Label htmlFor="employee_id">Employee ID</Label>
 <Input
 id="employee_id"
 placeholder="e.g., EMP-001"
 {...register('employee_id')}
 />
 </div>
 <div>
 <Label htmlFor="department">Department</Label>
 <Select
 value={watch('department')}
 onValueChange={(value) => setValue('department', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select department" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Engineering">Engineering</SelectItem>
 <SelectItem value="Product">Product</SelectItem>
 <SelectItem value="Design">Design</SelectItem>
 <SelectItem value="Marketing">Marketing</SelectItem>
 <SelectItem value="Sales">Sales</SelectItem>
 <SelectItem value="Operations">Operations</SelectItem>
 <SelectItem value="HR">Human Resources</SelectItem>
 <SelectItem value="Finance">Finance</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="employment_type">Employment Type</Label>
 <Select
 value={watch('employment_type')}
 onValueChange={(value) => setValue('employment_type', value as EmploymentType)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label htmlFor="hire_date">Hire Date</Label>
 <Input
 id="hire_date"
 type="date"
 {...register('hire_date')}
 />
 </div>
 <div>
 <Label htmlFor="status">Status</Label>
 <Select
 value={watch('status')}
 onValueChange={(value) => setValue('status', value as ProfileStatus)}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(PROFILE_STATUS_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </Card>

 {/* Management */}
 <Card className="p-lg">
 <h3 className="text-md font-semibold mb-md flex items-center gap-xs">
 <Building className="h-icon-sm w-icon-sm" />
 Management
 </h3>
 <div>
 <Label htmlFor="manager_id">Manager</Label>
 <Select
 value={watch('manager_id')}
 onValueChange={(value) => setValue('manager_id', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select manager" />
 </SelectTrigger>
 <SelectContent>
 {managers.map((manager) => (
 <SelectItem key={manager.id} value={manager.id}>
 {manager.name} ({manager.email})
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </Card>

 {/* Skills */}
 <Card className="p-lg">
 <h3 className="text-md font-semibold mb-md">Skills</h3>
 <div className="space-y-md">
 <div className="relative">
 <div className="flex gap-xs">
 <Input
 placeholder="Add a skill..."
 value={newSkill}
 onChange={(e) => {
 setNewSkill(e.target.value);
 setShowSkillSuggestions(e.target.value.length > 0);
 }}
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 addSkill(newSkill);
 }
 }}
 />
 <Button
 type="button"
 variant="outline"
 onClick={() => addSkill(newSkill)}
 >
 <Plus className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 {showSkillSuggestions && filteredSkillSuggestions.length > 0 && (
 <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
 {filteredSkillSuggestions.map((skill) => (
 <button
 key={skill}
 type="button"
 className="w-full text-left px-3 py-2 hover:bg-muted cursor-pointer"
 onClick={() => addSkill(skill)}
 >
 {skill}
 </button>
 ))}
 </div>
 )}
 </div>
 <div className="flex flex-wrap gap-xs">
 {skills.map((skill) => (
 <Badge key={skill} variant="secondary" className="flex items-center gap-xs">
 {skill}
 <button
 type="button"
 onClick={() => removeSkill(skill)}
 className="ml-1 hover:text-destructive"
 >
 <X className="h-3 w-3" />
 </button>
 </Badge>
 ))}
 </div>
 </div>
 </Card>

 {/* Bio */}
 <Card className="p-lg">
 <h3 className="text-md font-semibold mb-md">Bio</h3>
 <Textarea
 placeholder="Tell us about yourself..."
 rows={4}
 {...register('bio')}
 />
 </Card>

 {/* Links */}
 <Card className="p-lg">
 <h3 className="text-md font-semibold mb-md flex items-center gap-xs">
 <ExternalLink className="h-icon-sm w-icon-sm" />
 Professional Links
 </h3>
 <div className="space-y-md">
 <div>
 <Label htmlFor="linkedin_url">LinkedIn URL</Label>
 <Input
 id="linkedin_url"
 type="url"
 placeholder="https://linkedin.com/in/..."
 {...register('linkedin_url')}
 />
 </div>
 <div>
 <Label htmlFor="website_url">Website URL</Label>
 <Input
 id="website_url"
 type="url"
 placeholder="https://..."
 {...register('website_url')}
 />
 </div>
 </div>
 </Card>

 {/* Actions */}
 <div className="flex justify-end gap-sm sticky bottom-0 bg-background pt-md border-t border-border">
 <Button type="button" variant="outline" onClick={onClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={loading}>
 <Save className="mr-2 h-icon-xs w-icon-xs" />
 {loading ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
 </Button>
 </div>
 </form>
 </div>
 </div>
 );
}
