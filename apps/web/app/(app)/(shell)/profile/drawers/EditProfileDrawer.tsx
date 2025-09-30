'use client';

import { User, Save, X, Building, MapPin, Shield } from "lucide-react";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
 Drawer,
 Button,
 Input,
 Label,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 useToast,
 Card,
 Badge,
 Tabs,
 TabsList,
 TabsTrigger,
 TabsContent,
} from '@ghxstship/ui';
// import { z } from 'zod';

import type { UserProfile, FieldConfig, UpdateProfileFormData } from '../types';
import { EMPLOYMENT_TYPES, PROFILE_STATUSES, DEPARTMENTS } from '../types';

const updateProfileSchema = z.object({
 id: z.string(),
 full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
 first_name: z.string().min(1, 'First name is required').optional(),
 last_name: z.string().min(1, 'Last name is required').optional(),
 email: z.string().email('Invalid email address').optional(),
 phone: z.string().optional(),
 department: z.string().optional(),
 position: z.string().optional(),
 manager_id: z.string().optional(),
 employment_type: z.enum(['full_time', 'part_time', 'contractor', 'intern']).optional(),
 hire_date: z.string().optional(),
 status: z.enum(['active', 'inactive', 'pending']).optional(),
 
 // Contact Information
 address_line1: z.string().optional(),
 address_line2: z.string().optional(),
 city: z.string().optional(),
 state: z.string().optional(),
 postal_code: z.string().optional(),
 country: z.string().optional(),
 
 // Emergency Contact
 emergency_contact_name: z.string().optional(),
 emergency_contact_phone: z.string().optional(),
 emergency_contact_relationship: z.string().optional(),
 
 // Additional Information
 bio: z.string().optional(),
 timezone: z.string().optional(),
 language: z.string().optional(),
});

type FormData = z.infer<typeof updateProfileSchema>;

interface EditProfileDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 profile?: UserProfile | null;
 onSave: (data: FormData) => Promise<void>;
 fieldConfig: FieldConfig[];
}

export default function EditProfileDrawer({
 isOpen,
 onClose,
 profile,
 onSave,
 fieldConfig
}: EditProfileDrawerProps) {
 const { toast } = useToast();
 const [loading, setLoading] = useState(false);
 const [activeTab, setActiveTab] = useState('basic');

 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 setValue,
 watch,
 trigger
 } = useForm<FormData>({
 resolver: zodResolver(updateProfileSchema),
 defaultValues: {
 id: profile?.id || '',
 full_name: profile?.full_name || '',
 first_name: profile?.first_name || '',
 last_name: profile?.last_name || '',
 email: profile?.email || '',
 phone: profile?.phone || '',
 department: profile?.department || '',
 position: profile?.position || '',
 employment_type: profile?.employment_type || 'full_time',
 status: profile?.status || 'pending',
 }
 });

 const watchedValues = watch();

 // Update form when profile changes
 useEffect(() => {
 if (profile) {
 reset({
 id: profile.id,
 full_name: profile.full_name,
 first_name: profile.first_name,
 last_name: profile.last_name,
 email: profile.email,
 phone: profile.phone || '',
 department: profile.department || '',
 position: profile.position || '',
 manager_id: profile.manager_id || '',
 employment_type: profile.employment_type || 'full_time',
 hire_date: profile.hire_date || '',
 status: profile.status,
 address_line1: profile.address_line1 || '',
 address_line2: profile.address_line2 || '',
 city: profile.city || '',
 state: profile.state || '',
 postal_code: profile.postal_code || '',
 country: profile.country || '',
 emergency_contact_name: profile.emergency_contact_name || '',
 emergency_contact_phone: profile.emergency_contact_phone || '',
 emergency_contact_relationship: profile.emergency_contact_relationship || '',
 bio: profile.bio || '',
 timezone: profile.timezone || '',
 language: profile.language || '',
 });
 }
 }, [profile, reset]);

 // Auto-generate full name from first and last name
 const handleNameChange = () => {
 const firstName = watchedValues.first_name || '';
 const lastName = watchedValues.last_name || '';
 if (firstName && lastName) {
 setValue('full_name', `${firstName} ${lastName}`);
 }
 };

 const handleSave = async (data: FormData) => {
 try {
 setLoading(true);
 await onSave(data);
 toast({
 title: 'Success',
 description: 'Profile updated successfully',
 });
 onClose();
 } catch (error) {
 toast({
 title: 'Error',
 description: 'Failed to update profile',
 variant: 'destructive',
 });
 } finally {
 setLoading(false);
 }
 };

 const handleClose = () => {
 setActiveTab('basic');
 onClose();
 };

 if (!profile) {
 return null;
 }

 return (
 <Drawer
 isOpen={isOpen}
 onClose={handleClose}
 title={`Edit Profile: ${profile.full_name}`}
 description="Update profile information and settings"
 size="lg"
 >
 <form onSubmit={handleSubmit(handleSave)} className="space-y-lg">
 {/* Profile Summary */}
 <Card className="p-md bg-muted/50">
 <div className="flex items-center gap-md">
 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
 <User className="h-6 w-6 text-primary" />
 </div>
 <div className="flex-1">
 <h3 className="font-semibold">{profile.full_name}</h3>
 <p className="text-sm text-muted-foreground">
 {profile.position} • {profile.department}
 </p>
 <div className="flex items-center gap-sm mt-xs">
 <Badge variant={profile.status === 'active' ? 'success' : 'secondary'}>
 {profile.status}
 </Badge>
 <span className="text-xs text-muted-foreground">
 {profile.completion_percentage}% complete
 </span>
 </div>
 </div>
 </div>
 </Card>

 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="grid w-full grid-cols-4">
 <TabsTrigger value="basic">
 <User className="h-4 w-4 mr-xs" />
 Basic
 </TabsTrigger>
 <TabsTrigger value="professional">
 <Building className="h-4 w-4 mr-xs" />
 Professional
 </TabsTrigger>
 <TabsTrigger value="contact">
 <MapPin className="h-4 w-4 mr-xs" />
 Contact
 </TabsTrigger>
 <TabsTrigger value="emergency">
 <Shield className="h-4 w-4 mr-xs" />
 Emergency
 </TabsTrigger>
 </TabsList>

 {/* Basic Information Tab */}
 <TabsContent value="basic" className="space-y-md">
 <Card className="p-md">
 <h3 className="font-semibold mb-md">Personal Information</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="first_name">First Name</Label>
 <Input
 
 {...register('first_name')}
 placeholder="Enter first name"
 onChange={(e) => {
 register('first_name').onChange(e);
 setTimeout(handleNameChange, 0);
 }}
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="last_name">Last Name</Label>
 <Input
 
 {...register('last_name')}
 placeholder="Enter last name"
 onChange={(e) => {
 register('last_name').onChange(e);
 setTimeout(handleNameChange, 0);
 }}
 />
 </div>

 <div className="space-y-sm md:col-span-2">
 <Label htmlFor="full_name">Full Name</Label>
 <Input
 
 {...register('full_name')}
 placeholder="Enter full name"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="email">Email Address</Label>
 <Input
 
 type="email"
 {...register('email')}
 placeholder="Enter email address"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="phone">Phone Number</Label>
 <Input
 
 {...register('phone')}
 placeholder="Enter phone number"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="status">Status</Label>
 <Select
 value={watchedValues.status}
 onValueChange={(value) => setValue('status', value as unknown)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 {PROFILE_STATUSES.map((status) => (
 <SelectItem key={status.value} value={status.value}>
 {status.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-sm md:col-span-2">
 <Label htmlFor="bio">Bio</Label>
 <Textarea
 
 {...register('bio')}
 placeholder="Enter a brief bio"
 rows={3}
 />
 </div>
 </div>
 </Card>
 </TabsContent>

 {/* Professional Information Tab */}
 <TabsContent value="professional" className="space-y-md">
 <Card className="p-md">
 <h3 className="font-semibold mb-md">Professional Details</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="position">Position</Label>
 <Input
 
 {...register('position')}
 placeholder="Enter job position"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="department">Department</Label>
 <Select
 value={watchedValues.department}
 onValueChange={(value) => setValue('department', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select department" />
 </SelectTrigger>
 <SelectContent>
 {DEPARTMENTS.map((dept) => (
 <SelectItem key={dept.value} value={dept.value}>
 {dept.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-sm">
 <Label htmlFor="employment_type">Employment Type</Label>
 <Select
 value={watchedValues.employment_type}
 onValueChange={(value) => setValue('employment_type', value as unknown)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select employment type" />
 </SelectTrigger>
 <SelectContent>
 {EMPLOYMENT_TYPES.map((type) => (
 <SelectItem key={type.value} value={type.value}>
 {type.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-sm">
 <Label htmlFor="hire_date">Hire Date</Label>
 <Input
 
 type="date"
 {...register('hire_date')}
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="manager_id">Manager ID</Label>
 <Input
 
 {...register('manager_id')}
 placeholder="Manager ID (optional)"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="timezone">Timezone</Label>
 <Select
 value={watchedValues.timezone}
 onValueChange={(value) => setValue('timezone', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select timezone" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="UTC">UTC</SelectItem>
 <SelectItem value="America/New_York">Eastern Time</SelectItem>
 <SelectItem value="America/Chicago">Central Time</SelectItem>
 <SelectItem value="America/Denver">Mountain Time</SelectItem>
 <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </Card>
 </TabsContent>

 {/* Contact Information Tab */}
 <TabsContent value="contact" className="space-y-md">
 <Card className="p-md">
 <h3 className="font-semibold mb-md">Address Information</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm md:col-span-2">
 <Label htmlFor="address_line1">Address Line 1</Label>
 <Input
 
 {...register('address_line1')}
 placeholder="Enter street address"
 />
 </div>

 <div className="space-y-sm md:col-span-2">
 <Label htmlFor="address_line2">Address Line 2</Label>
 <Input
 
 {...register('address_line2')}
 placeholder="Apartment, suite, etc. (optional)"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="city">City</Label>
 <Input
 
 {...register('city')}
 placeholder="Enter city"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="state">State/Province</Label>
 <Input
 
 {...register('state')}
 placeholder="Enter state or province"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="postal_code">Postal Code</Label>
 <Input
 
 {...register('postal_code')}
 placeholder="Enter postal code"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="country">Country</Label>
 <Input
 
 {...register('country')}
 placeholder="Enter country"
 />
 </div>
 </div>
 </Card>
 </TabsContent>

 {/* Emergency Contact Tab */}
 <TabsContent value="emergency" className="space-y-md">
 <Card className="p-md">
 <h3 className="font-semibold mb-md">Emergency Contact</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div className="space-y-sm">
 <Label htmlFor="emergency_contact_name">Contact Name</Label>
 <Input
 
 {...register('emergency_contact_name')}
 placeholder="Enter emergency contact name"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
 <Input
 
 {...register('emergency_contact_phone')}
 placeholder="Enter emergency contact phone"
 />
 </div>

 <div className="space-y-sm md:col-span-2">
 <Label htmlFor="emergency_contact_relationship">Relationship</Label>
 <Select
 value={watchedValues.emergency_contact_relationship}
 onValueChange={(value) => setValue('emergency_contact_relationship', value)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select relationship" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="spouse">Spouse</SelectItem>
 <SelectItem value="parent">Parent</SelectItem>
 <SelectItem value="child">Child</SelectItem>
 <SelectItem value="sibling">Sibling</SelectItem>
 <SelectItem value="friend">Friend</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </Card>
 </TabsContent>
 </Tabs>

 {/* Action Buttons */}
 <div className="flex justify-between pt-md border-t border-border">
 <div className="flex gap-sm">
 {activeTab !== 'basic' && (
 <Button
 type="button"
 variant="outline"
 onClick={() => {
 const tabs = ['basic', 'professional', 'contact', 'emergency'];
 const currentIndex = tabs.indexOf(activeTab);
 if (currentIndex > 0) {
 setActiveTab(tabs[currentIndex - 1]);
 }
 }}
 >
 Previous
 </Button>
 )}
 
 {activeTab !== 'emergency' && (
 <Button
 type="button"
 variant="outline"
 onClick={async () => {
 const isValid = await trigger();
 if (isValid) {
 const tabs = ['basic', 'professional', 'contact', 'emergency'];
 const currentIndex = tabs.indexOf(activeTab);
 if (currentIndex < tabs.length - 1) {
 setActiveTab(tabs[currentIndex + 1]);
 }
 }
 }}
 >
 Next
 </Button>
 )}
 </div>

 <div className="flex gap-sm">
 <Button
 type="button"
 variant="outline"
 onClick={handleClose}
 disabled={loading}
 >
 <X className="h-4 w-4 mr-sm" />
 Cancel
 </Button>
 <Button type="submit" loading={loading}>
 <Save className="h-4 w-4 mr-sm" />
 Save Changes
 </Button>
 </div>
 </div>
 </form>
 </Drawer>
 );
}
