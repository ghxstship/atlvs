'use client';

import { X, Save, Plus, Trash2, User, Building, Calendar, ExternalLink } from "lucide-react";
import { useState, useEffect } from 'react';
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
 Label,
 Badge,
 Card,
} from '@ghxstship/ui';
import type { ProfessionalProfile, ProfessionalFormData } from '../types';
import {
 EMPLOYMENT_TYPE_LABELS,
 PROFILE_STATUS_LABELS,
 COMMON_SKILLS,
 validateProfessionalForm,
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
 status: z.enum(['active', 'inactive', 'pending', 'suspended']),
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
 managers> = [],
 departments = [],
 loading = false,
}: CreateProfessionalDrawerProps) {
 const [skills, setSkills] = useState<string[]>([]);
 const [newSkill, setNewSkill] = useState('');
 const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 watch,
 setValue,
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
 status: 'active',
 },
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
 status: profile.status,
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
 status: 'active',
 });
 setSkills([]);
 }
 }, [profile, reset]);

 const onSubmit = async (data: FormData) => {
 const formData: ProfessionalFormData = {
 ...data,
 skills,
 } as ProfessionalFormData;

 await onSave(formData);
 };

 const addSkill = (skill: string) => {
 const trimmedSkill = skill.trim();
 if (trimmedSkill && !skills.includes(trimmedSkill)) {
 setSkills([...skills, trimmedSkill]);
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
 <div className="absolute inset-0 bg-black/50" onClick={onClose} />
 <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-background shadow-xl">
 <div className="flex h-full flex-col">
 {/* Header */}
 <div className="flex items-center justify-between border-b p-6">
 <div>
 <h2 className="text-xl font-semibold">
 {profile ? 'Edit Professional Profile' : 'Create Professional Profile'}
 </h2>
 <p className="text-sm text-muted-foreground">
 {profile ? 'Update the professional profile information' : 'Add professional information to the profile'}
 </p>
 </div>
 <Button variant="ghost" size="sm" onClick={onClose}>
 <X className="h-4 w-4" />
 </Button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-6">
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
 {/* Basic Information */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-4">
 <User className="h-5 w-5 text-primary" />
 <h3 className="font-medium">Basic Information</h3>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label htmlFor="job_title">Job Title</Label>
 <Input
 
 {...register('job_title')}
 placeholder="e.g. Software Engineer"
 />
 </div>
 <div>
 <Label htmlFor="employee_id">Employee ID</Label>
 <Input
 
 {...register('employee_id')}
 placeholder="e.g. EMP001"
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
 {departments.map((dept) => (
 <SelectItem key={dept} value={dept}>
 {dept}
 </SelectItem>
 ))}
 <SelectItem value="Engineering">Engineering</SelectItem>
 <SelectItem value="Design">Design</SelectItem>
 <SelectItem value="Product">Product</SelectItem>
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
 onValueChange={(value) => setValue('employment_type', value as unknown)}
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
 
 type="date"
 {...register('hire_date')}
 />
 </div>
 <div>
 <Label htmlFor="status">Status</Label>
 <Select
 value={watch('status')}
 onValueChange={(value) => setValue('status', value as unknown)}
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
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-4">
 <Building className="h-5 w-5 text-primary" />
 <h3 className="font-medium">Management</h3>
 </div>
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
 <SelectItem value="">No Manager</SelectItem>
 {managers.map((manager) => (
 <SelectItem key={manager.id} value={manager.id}>
 {manager.name} ({manager.email})
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </Card>

 {/* About */}
 <Card className="p-4">
 <h3 className="font-medium mb-4">About</h3>
 <div>
 <Label htmlFor="bio">Bio</Label>
 <Textarea
 
 {...register('bio')}
 placeholder="Tell us about yourself, your experience, and what you do..."
 rows={4}
 />
 </div>
 </Card>

 {/* Skills */}
 <Card className="p-4">
 <h3 className="font-medium mb-4">Skills</h3>
 <div className="space-y-4">
 <div className="relative">
 <div className="flex gap-2">
 <Input
 value={newSkill}
 onChange={(e) => {
 setNewSkill(e.target.value);
 setShowSkillSuggestions(e.target.value.length > 0);
 }}
 placeholder="Add a skill"
 onKeyPress={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 addSkill(newSkill);
 }
 }}
 onFocus={() => setShowSkillSuggestions(newSkill.length > 0)}
 />
 <Button 
 type="button" 
 variant="outline" 
 onClick={() => addSkill(newSkill)}
 >
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 
 {/* Skill Suggestions */}
 {showSkillSuggestions && filteredSkillSuggestions.length > 0 && (
 <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
 {filteredSkillSuggestions.slice(0, 8).map((skill) => (
 <button
 key={skill}
 type="button"
 className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
 onClick={() => addSkill(skill)}
 >
 {skill}
 </button>
 ))}
 </div>
 )}
 </div>
 
 <div className="flex flex-wrap gap-2">
 {skills.map((skill) => (
 <Badge
 key={skill}
 variant="secondary"
 className="cursor-pointer"
 onClick={() => removeSkill(skill)}
 >
 {skill} <X className="h-3 w-3 ml-1" />
 </Badge>
 ))}
 </div>
 </div>
 </Card>

 {/* Online Presence */}
 <Card className="p-4">
 <div className="flex items-center gap-2 mb-4">
 <ExternalLink className="h-5 w-5 text-primary" />
 <h3 className="font-medium">Online Presence</h3>
 </div>
 <div className="grid grid-cols-1 gap-4">
 <div>
 <Label htmlFor="linkedin_url">LinkedIn URL</Label>
 <Input
 
 {...register('linkedin_url')}
 placeholder="https://linkedin.com/in/username"
 />
 </div>
 <div>
 <Label htmlFor="website_url">Website URL</Label>
 <Input
 
 {...register('website_url')}
 placeholder="https://yourwebsite.com"
 />
 </div>
 </div>
 </Card>
 </form>
 </div>

 {/* Footer */}
 <div className="border-t p-6">
 <div className="flex items-center justify-end gap-3">
 <Button variant="outline" onClick={onClose} disabled={loading}>
 Cancel
 </Button>
 <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
 <Save className="h-4 w-4 mr-2" />
 {loading ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
 </Button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
