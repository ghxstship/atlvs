'use client';

import { Users, Briefcase, DollarSign, Star, Award, Clock } from "lucide-react";
import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Select, Card, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import type { VendorProfile } from '../types';

interface CreateVendorClientProps {
 mode: 'create' | 'edit' | 'view';
 vendor?: VendorProfile | null;
 onSuccess: () => void;
 onCancel: () => void;
}

interface VendorFormData {
 business_name: string;
 business_type: 'individual' | 'company' | 'agency';
 display_name: string;
 tagline: string;
 bio: string;
 email: string;
 phone: string;
 website: string;
 primary_category: string;
 categories: string[];
 skills: string[];
 years_experience: number;
 team_size: number;
 hourly_rate: number;
 currency: string;
 availability_status: 'available' | 'busy' | 'unavailable';
 response_time: string;
}

export default function CreateVendorClient({ mode, vendor, onSuccess, onCancel }: CreateVendorClientProps) {
 const [formData, setFormData] = useState<VendorFormData>({
 business_name: '',
 business_type: 'individual',
 display_name: '',
 tagline: '',
 bio: '',
 email: '',
 phone: '',
 website: '',
 primary_category: '',
 categories: [],
 skills: [],
 years_experience: 0,
 team_size: 1,
 hourly_rate: 0,
 currency: 'USD',
 availability_status: 'available',
 response_time: '1 day'
 });
 
 const [loading, setLoading] = useState(false);
 const [currentSkill, setCurrentSkill] = useState('');
 const [currentCategory, setCurrentCategory] = useState('');

 const supabase = createBrowserClient();

 useEffect(() => {
 if (vendor && mode !== 'create') {
 setFormData({
 business_name: vendor.business_name || '',
 business_type: vendor.business_type || 'individual',
 display_name: vendor.display_name || '',
 tagline: vendor.tagline || '',
 bio: vendor.bio || '',
 email: vendor.email || '',
 phone: vendor.phone || '',
 website: vendor.website || '',
 primary_category: vendor.primary_category || '',
 categories: vendor.categories || [],
 skills: vendor.skills || [],
 years_experience: vendor.years_experience || 0,
 team_size: vendor.team_size || 1,
 hourly_rate: vendor.hourly_rate || 0,
 currency: vendor.currency || 'USD',
 availability_status: vendor.availability_status || 'available',
 response_time: vendor.response_time || '1 day'
 });
 }
 }, [vendor, mode]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (mode === 'view') return;

 setLoading(true);

 try {
 if (mode === 'create') {
 const { error } = await supabase
 .from('opendeck_vendor_profiles')
 .insert([formData]);

 if (error) throw error;
 } else {
 const { error } = await supabase
 .from('opendeck_vendor_profiles')
 .update(formData)
 .eq('id', vendor?.id);

 if (error) throw error;
 }

 onSuccess();
 } catch (error) {
 console.error('Error saving vendor profile:', error);
 } finally {
 setLoading(false);
 }
 };

 const addSkill = () => {
 if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
 setFormData(prev => ({
 ...prev,
 skills: [...prev.skills, currentSkill.trim()]
 }));
 setCurrentSkill('');
 }
 };

 const removeSkill = (skillToRemove: string) => {
 setFormData(prev => ({
 ...prev,
 skills: prev.skills.filter(skill => skill !== skillToRemove)
 }));
 };

 const addCategory = () => {
 if (currentCategory.trim() && !formData.categories.includes(currentCategory.trim())) {
 setFormData(prev => ({
 ...prev,
 categories: [...prev.categories, currentCategory.trim()]
 }));
 setCurrentCategory('');
 }
 };

 const removeCategory = (categoryToRemove: string) => {
 setFormData(prev => ({
 ...prev,
 categories: prev.categories.filter(cat => cat !== categoryToRemove)
 }));
 };

 const isReadOnly = mode === 'view';

 return (
 <form onSubmit={handleSubmit} className="stack-lg p-md">
 {/* Business Information */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <Briefcase className="h-icon-xs w-icon-xs" />
 Business Information
 </h3>
 <div className="stack-sm">
 <Input
 
 value={formData.business_name}
 onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
 placeholder="Your business or company name"
 required
 disabled={isReadOnly}
 />

 <Select
 
 value={formData.business_type}
 onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value as unknown }))}
 disabled={isReadOnly}
 >
 <option value="individual">Individual/Freelancer</option>
 <option value="company">Company</option>
 <option value="agency">Agency</option>
 </Select>

 <Input
 
 value={formData.display_name}
 onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
 placeholder="How you want to appear in listings"
 required
 disabled={isReadOnly}
 />

 <Input
 
 value={formData.tagline}
 onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
 placeholder="Brief description of what you do"
 disabled={isReadOnly}
 />

 <Textarea
 
 value={formData.bio}
 onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
 placeholder="Tell potential clients about your experience and expertise"
 rows={4}
 disabled={isReadOnly}
 />
 </div>
 </Card>

 {/* Contact Information */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Contact Information</h3>
 <div className="stack-sm">
 <div className="grid grid-cols-2 gap-sm">
 <Input
 
 type="email"
 value={formData.email}
 onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
 placeholder="your@email.com"
 required
 disabled={isReadOnly}
 />

 <Input
 
 value={formData.phone}
 onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
 placeholder="+1 (555) 123-4567"
 disabled={isReadOnly}
 />
 </div>

 <Input
 
 value={formData.website}
 onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
 placeholder="https://yourwebsite.com"
 disabled={isReadOnly}
 />
 </div>
 </Card>

 {/* Professional Details */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <Award className="h-icon-xs w-icon-xs" />
 Professional Details
 </h3>
 <div className="stack-sm">
 <Select
 
 value={formData.primary_category}
 onChange={(e) => setFormData(prev => ({ ...prev, primary_category: value }))}
 disabled={isReadOnly}
 >
 <option value="">Select primary category</option>
 <option value="audio_visual">Audio/Visual</option>
 <option value="lighting">Lighting</option>
 <option value="staging">Staging</option>
 <option value="production">Production</option>
 <option value="creative">Creative</option>
 <option value="technical">Technical</option>
 </Select>

 <div className="grid grid-cols-2 gap-sm">
 <Input
 
 type="number"
 value={formData.years_experience}
 onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
 placeholder="0"
 disabled={isReadOnly}
 />

 <Input
 
 type="number"
 value={formData.team_size}
 onChange={(e) => setFormData(prev => ({ ...prev, team_size: parseInt(e.target.value) || 1 }))}
 placeholder="1"
 disabled={isReadOnly}
 />
 </div>

 {/* Additional Categories */}
 <div>
 <label className="text-body-sm font-medium mb-xs block">Additional Categories</label>
 {!isReadOnly && (
 <div className="flex gap-sm mb-sm">
 <Select
 value={currentCategory}
 onValueChange={setCurrentCategory}
 >
 <option value="">Select category</option>
 <option value="audio_visual">Audio/Visual</option>
 <option value="lighting">Lighting</option>
 <option value="staging">Staging</option>
 <option value="production">Production</option>
 <option value="creative">Creative</option>
 <option value="technical">Technical</option>
 </Select>
 <Button type="button" onClick={addCategory} size="sm">
 Add
 </Button>
 </div>
 )}
 <div className="flex flex-wrap gap-xs">
 {formData.categories.map((category, index) => (
 <Badge key={index} variant="secondary" className="flex items-center gap-xs">
 {category.replace('_', ' ')}
 {!isReadOnly && (
 <button
 type="button"
 onClick={() => removeCategory(category)}
 className="ml-xs hover:text-destructive"
 >
 ×
 </button>
 )}
 </Badge>
 ))}
 </div>
 </div>

 {/* Skills */}
 <div>
 <label className="text-body-sm font-medium mb-xs block">Skills</label>
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
 {formData.skills.map((skill, index) => (
 <Badge key={index} variant="outline" className="flex items-center gap-xs">
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
 </div>
 </Card>

 {/* Pricing & Availability */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs" />
 Pricing & Availability
 </h3>
 <div className="stack-sm">
 <div className="grid grid-cols-2 gap-sm">
 <Input
 
 type="number"
 value={formData.hourly_rate}
 onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
 placeholder="0.00"
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

 <div className="grid grid-cols-2 gap-sm">
 <Select
 
 value={formData.availability_status}
 onChange={(e) => setFormData(prev => ({ ...prev, availability_status: e.target.value as unknown }))}
 disabled={isReadOnly}
 >
 <option value="available">Available</option>
 <option value="busy">Busy</option>
 <option value="unavailable">Unavailable</option>
 </Select>

 <Select
 
 value={formData.response_time}
 onChange={(e) => setFormData(prev => ({ ...prev, response_time: value }))}
 disabled={isReadOnly}
 >
 <option value="1 hour">Within 1 hour</option>
 <option value="4 hours">Within 4 hours</option>
 <option value="1 day">Within 1 day</option>
 <option value="2 days">Within 2 days</option>
 <option value="1 week">Within 1 week</option>
 </Select>
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
 {mode === 'create' ? 'Create Profile' : 'Update Profile'}
 </Button>
 )}
 </div>
 </form>
 );
}
