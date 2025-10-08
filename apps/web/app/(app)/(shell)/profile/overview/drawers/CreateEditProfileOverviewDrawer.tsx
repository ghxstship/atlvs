'use client';

import { User, Mail, Phone, MapPin, Briefcase, Save, X, Upload, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import {
 Drawer,
 Form,
 FormField,
 FormItem,
 FormLabel,
 FormControl,
 FormMessage,
 Input,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Button,
 Badge,
 Avatar,
 Progress,
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger
} from '@ghxstship/ui';
import type { ProfileOverview } from '../types';
import { getStatusColor, getCompletionColor, getProfileCompletionTasks } from '../types';

const profileOverviewSchema = z.object({
 job_title: z.string().optional(),
 department: z.string().optional(),
 employee_id: z.string().optional(),
 phone_primary: z.string().optional(),
 location: z.string().optional(),
 bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
 status: z.enum(['active', 'inactive', 'pending', 'suspended'])
});

type ProfileOverviewFormData = z.infer<typeof profileOverviewSchema>;

interface CreateEditProfileOverviewDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 profile?: ProfileOverview | null;
 onSave: (data: ProfileOverviewFormData) => Promise<void>;
 loading?: boolean;
 mode: 'create' | 'edit' | 'view';
}

export default function CreateEditProfileOverviewDrawer({
 isOpen,
 onClose,
 profile,
 onSave,
 loading = false,
 mode
}: CreateEditProfileOverviewDrawerProps) {
 const [activeTab, setActiveTab] = useState('basic');
 const [showPreview, setShowPreview] = useState(false);

 const form = useForm<ProfileOverviewFormData>({
 resolver: zodResolver(profileOverviewSchema),
 defaultValues: {
 job_title: '',
 department: '',
 employee_id: '',
 phone_primary: '',
 location: '',
 bio: '',
 status: 'active'
 }
 });

 // Reset form when profile changes
 useEffect(() => {
 if (profile) {
 form.reset({
 job_title: profile.job_title || '',
 department: profile.department || '',
 employee_id: profile.employee_id || '',
 phone_primary: profile.phone_primary || '',
 location: profile.location || '',
 bio: profile.bio || '',
 status: profile.status
 });
 } else {
 form.reset({
 job_title: '',
 department: '',
 employee_id: '',
 phone_primary: '',
 location: '',
 bio: '',
 status: 'active'
 });
 }
 }, [profile, form]);

 const handleSubmit = async (data: ProfileOverviewFormData) => {
 try {
 await onSave(data);
 onClose();
 } catch (error) {
 console.error('Error saving profile:', error);
 }
 };

 const getTitle = () => {
 switch (mode) {
 case 'create':
 return 'Create Profile Overview';
 case 'edit':
 return 'Edit Profile Overview';
 case 'view':
 return 'Profile Overview Details';
 default:
 return 'Profile Overview';
 }
 };

 const isReadOnly = mode === 'view';
 const completionTasks = profile ? getProfileCompletionTasks(profile) : [];

 return (
 <Drawer
 isOpen={isOpen}
 onClose={onClose}
 title={getTitle()}
 size="lg"
 >
 <div className="stack-lg">
 {/* Profile Header (for edit/view modes) */}
 {profile && (
 <div className="p-lg bg-secondary/30 rounded-lg">
 <div className="flex items-center gap-lg mb-md">
 <Avatar
 src={profile.avatar_url}
 alt={profile.full_name}
 fallback={profile.full_name.charAt(0)}
 size="lg"
 />
 <div className="flex-1">
 <div className="flex items-center gap-md mb-sm">
 <h3 className="text-heading-4">{profile.full_name}</h3>
 <Badge variant={getStatusColor(profile.status) as unknown}>
 {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
 </Badge>
 </div>
 <div className="text-body-sm color-muted">{profile.email}</div>
 </div>
 </div>

 {/* Profile Completion */}
 <div className="flex items-center gap-md">
 <div className="flex-1">
 <div className="flex items-center justify-between mb-xs">
 <span className="text-body-sm">Profile Completion</span>
 <span className="text-body-sm font-medium">
 {profile.profile_completion_percentage}%
 </span>
 </div>
 <Progress 
 value={profile.profile_completion_percentage} 
 className="h-2"
 variant={getCompletionColor(profile.profile_completion_percentage) as unknown}
 />
 </div>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setShowPreview(!showPreview)}
 >
 {showPreview ? <EyeOff className="h-icon-xs w-icon-xs" /> : <Eye className="h-icon-xs w-icon-xs" />}
 {showPreview ? 'Hide' : 'Show'} Preview
 </Button>
 </div>
 </div>
 )}

 {/* Preview Mode */}
 {showPreview && profile && (
 <div className="p-lg bg-accent/5 rounded-lg border border-accent/20">
 <h4 className="text-body font-medium mb-md">Profile Preview</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <div>
 <h5 className="text-body-sm font-medium mb-sm">Professional Information</h5>
 <div className="stack-xs text-body-sm">
 <div><strong>Job Title:</strong> {profile.job_title || 'Not specified'}</div>
 <div><strong>Department:</strong> {profile.department || 'Not specified'}</div>
 <div><strong>Employee ID:</strong> {profile.employee_id || 'Not specified'}</div>
 </div>
 </div>
 <div>
 <h5 className="text-body-sm font-medium mb-sm">Contact Information</h5>
 <div className="stack-xs text-body-sm">
 <div><strong>Phone:</strong> {profile.phone_primary || 'Not specified'}</div>
 <div><strong>Location:</strong> {profile.location || 'Not specified'}</div>
 </div>
 </div>
 </div>
 {profile.bio && (
 <div className="mt-md">
 <h5 className="text-body-sm font-medium mb-sm">Bio</h5>
 <p className="text-body-sm color-muted">{profile.bio}</p>
 </div>
 )}
 </div>
 )}

 {/* Form */}
 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="stack-lg">
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="grid w-full grid-cols-3">
 <TabsTrigger value="basic">Basic Info</TabsTrigger>
 <TabsTrigger value="professional">Professional</TabsTrigger>
 <TabsTrigger value="completion">Completion</TabsTrigger>
 </TabsList>

 {/* Basic Information Tab */}
 <TabsContent value="basic" className="stack-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Primary Phone</FormLabel>
 <FormControl>
 <div className="relative">
 <Phone className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-muted" />
 <Input
 {...field}
 placeholder="+1 (555) 123-4567"
 className="pl-10"
 disabled={isReadOnly}
 />
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Location</FormLabel>
 <FormControl>
 <div className="relative">
 <MapPin className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-muted" />
 <Input
 {...field}
 placeholder="New York, NY"
 className="pl-10"
 disabled={isReadOnly}
 />
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Status</FormLabel>
 <FormControl>
 <Select
 value={field.value}
 onValueChange={field.onChange}
 disabled={isReadOnly}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="active">Active</SelectItem>
 <SelectItem value="inactive">Inactive</SelectItem>
 <SelectItem value="pending">Pending</SelectItem>
 <SelectItem value="suspended">Suspended</SelectItem>
 </SelectContent>
 </Select>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Bio</FormLabel>
 <FormControl>
 <Textarea
 {...field}
 placeholder="Tell us about yourself..."
 rows={4}
 disabled={isReadOnly}
 />
 </FormControl>
 <div className="flex justify-between">
 <FormMessage />
 <span className="text-body-xs color-muted">
 {field.value?.length || 0}/500 characters
 </span>
 </div>
 </FormItem>
 )}
 />
 </TabsContent>

 {/* Professional Information Tab */}
 <TabsContent value="professional" className="stack-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Job Title</FormLabel>
 <FormControl>
 <div className="relative">
 <Briefcase className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-muted" />
 <Input
 {...field}
 placeholder="Software Engineer"
 className="pl-10"
 disabled={isReadOnly}
 />
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Department</FormLabel>
 <FormControl>
 <Input
 {...field}
 placeholder="Engineering"
 disabled={isReadOnly}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 
 render={({ field }) => (
 <FormItem>
 <FormLabel>Employee ID</FormLabel>
 <FormControl>
 <Input
 {...field}
 placeholder="EMP001"
 disabled={isReadOnly}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </TabsContent>

 {/* Completion Tab */}
 <TabsContent value="completion" className="stack-lg">
 {profile ? (
 <div>
 <h4 className="text-body font-medium mb-md">Profile Completion Tasks</h4>
 <div className="stack-md">
 {completionTasks.map((task, index) => (
 <div
 key={index}
 className={`
 flex items-center gap-md p-md rounded-lg border
 ${task.completed 
 ? 'bg-success/10 border-success/20' 
 : task.priority === 'high'
 ? 'bg-destructive/10 border-destructive/20'
 : 'bg-warning/10 border-warning/20'
 }
 `}
 >
 <div className={`
 h-icon-xs w-icon-xs rounded-full flex items-center justify-center
 ${task.completed ? 'bg-success' : 'bg-secondary'}
 `}>
 {task.completed && (
 <div className="h-2 w-2 bg-white rounded-full" />
 )}
 </div>
 <div className="flex-1">
 <div className={`
 text-body-sm font-medium
 ${task.completed ? 'line-through color-muted' : ''}
 `}>
 {task.task}
 </div>
 <div className="text-body-xs color-muted">
 Priority: {task.priority}
 </div>
 </div>
 <Badge 
 variant={task.completed ? 'success' : task.priority === 'high' ? 'destructive' : 'warning'}
 size="sm"
 >
 {task.completed ? 'Complete' : 'Pending'}
 </Badge>
 </div>
 ))}
 </div>

 <div className="mt-lg p-md bg-info/10 rounded-lg border border-info/20">
 <h5 className="text-body-sm font-medium mb-sm color-info">
 Completion Tips
 </h5>
 <ul className="text-body-sm color-muted stack-xs">
 <li>• Complete high-priority tasks first to improve your profile score</li>
 <li>• Add professional certifications to showcase your expertise</li>
 <li>• Keep your contact information up to date</li>
 <li>• Write a compelling bio to help colleagues get to know you</li>
 </ul>
 </div>
 </div>
 ) : (
 <div className="text-center py-lg color-muted">
 <User className="h-icon-lg w-icon-lg mx-auto mb-md opacity-50" />
 <p>Completion tracking will be available after creating the profile</p>
 </div>
 )}
 </TabsContent>
 </Tabs>

 {/* Form Actions */}
 {!isReadOnly && (
 <div className="flex items-center justify-end gap-md pt-lg border-t">
 <Button
 type="button"
 variant="outline"
 onClick={onClose}
 disabled={loading}
 >
 <X className="h-icon-xs w-icon-xs mr-sm" />
 Cancel
 </Button>
 <Button
 type="submit"
 disabled={loading}
 loading={loading}
 >
 <Save className="h-icon-xs w-icon-xs mr-sm" />
 {mode === 'create' ? 'Create Profile' : 'Save Changes'}
 </Button>
 </div>
 )}
 </form>
 </Form>
 </div>
 </Drawer>
 );
}
