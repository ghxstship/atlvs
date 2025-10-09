'use client';

import Image from 'next/image';
import { Camera, Save, User, Plus, X, Eye, EyeOff } from "lucide-react";
import { useState } from 'react';
import { 
 Button, 
 Input, 
 Textarea, 
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Card, 
 Avatar, 
 Badge,
 Skeleton
} from '@ghxstship/ui';
import type { UserProfile, FieldConfig } from '../types';
import { PROFILE_FIELD_CONFIG } from '../types';

interface ProfileFormViewProps {
 profile: UserProfile | null;
 loading: boolean;
 saving: boolean;
 onSave: (data: Partial<UserProfile>) => Promise<void>;
 onFieldVisibilityChange?: (fieldKey: string, visible: boolean) => void;
 visibleFields?: Set<string>;
 editableFields?: Set<string>;
}

export default function ProfileFormView({
 profile,
 loading,
 saving,
 onSave,
 onFieldVisibilityChange,
 visibleFields = new Set(PROFILE_FIELD_CONFIG.map(f => f.key)),
 editableFields = new Set(PROFILE_FIELD_CONFIG.map(f => f.key))
}: ProfileFormViewProps) {
 const [formData, setFormData] = useState<Partial<UserProfile>(profile || {});
 const [newTag, setNewTag] = useState('');
 const [activeTagField, setActiveTagField] = useState<string | null>(null);

 const handleInputChange = (field: keyof UserProfile, value: unknown) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 };

 const handleTagAdd = (field: 'languages' | 'skills', tag: string) => {
 if (!tag.trim()) return;
 
 const currentTags = (formData[field] as string[]) || [];
 if (!currentTags.includes(tag.trim())) {
 handleInputChange(field, [...currentTags, tag.trim()]);
 }
 setNewTag('');
 setActiveTagField(null);
 };

 const handleTagRemove = (field: 'languages' | 'skills', tag: string) => {
 const currentTags = (formData[field] as string[]) || [];
 handleInputChange(field, currentTags.filter(t => t !== tag));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 await onSave(formData);
 };

 const renderField = (fieldConfig: FieldConfig) => {
 if (!visibleFields.has(fieldConfig.key)) return null;
 
 const isEditable = editableFields.has(fieldConfig.key);
 const value = formData[fieldConfig.key];

 const fieldWrapper = (content: React.ReactNode) => (
 <div key={fieldConfig.key} className="space-y-xs">
 <div className="flex items-center justify-between">
 <label className="text-sm font-medium">
 {fieldConfig.label}
 {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
 </label>
 {onFieldVisibilityChange && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onFieldVisibilityChange(fieldConfig.key, false)}
 className="h-icon-md w-icon-md p-0"
 >
 <EyeOff className="h-3 w-3" />
 </Button>
 )}
 </div>
 {content}
 </div>
 );

 if (!isEditable) {
 return fieldWrapper(
 <div className="px-sm py-xs bg-muted/50 rounded-md text-sm">
 {Array.isArray(value) ? value.join(', ') : value || 'Not specified'}
 </div>
 );
 }

 switch (fieldConfig.type) {
 case 'select':
 return fieldWrapper(
 <Select
 value={e.target.value as string || ''}
 onValueChange={(newValue) => handleInputChange(fieldConfig.key, newValue)}
 >
 <SelectTrigger>
 <SelectValue placeholder={`Select ${fieldConfig.label.toLowerCase()}`} />
 </SelectTrigger>
 <SelectContent>
 {fieldConfig.options?.map(option => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 );

 case 'textarea':
 return fieldWrapper(
 <Textarea
 value={e.target.value as string || ''}
 onChange={(e) => handleInputChange(fieldConfig.key, e.target.value)}
 placeholder={fieldConfig.placeholder}
 maxLength={fieldConfig.validation?.maxLength}
 rows={3}
 />
 );

 case 'tags':
 const tags = (e.target.value as string[]) || [];
 return fieldWrapper(
 <div className="space-y-xs">
 <div className="flex flex-wrap gap-xs">
 {tags.map(tag => (
 <Badge
 key={tag}
 variant="secondary"
 className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
 onClick={() => handleTagRemove(fieldConfig.key as 'languages' | 'skills', tag)}
 >
 {tag}
 <X className="ml-1 h-3 w-3" />
 </Badge>
 ))}
 </div>
 {activeTagField === fieldConfig.key ? (
 <div className="flex gap-xs">
 <Input
 value={newTag}
 onChange={(e) => setNewTag(e.target.value)}
 placeholder={`Add ${fieldConfig.label.toLowerCase()}`}
 onKeyPress={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handleTagAdd(fieldConfig.key as 'languages' | 'skills', newTag);
 }
 }}
 autoFocus
 />
 <Button
 type="button"
 variant="outline"
 onClick={() => handleTagAdd(fieldConfig.key as 'languages' | 'skills', newTag)}
 >
 Add
 </Button>
 <Button
 type="button"
 variant="ghost"
 onClick={() => {
 setActiveTagField(null);
 setNewTag('');
 }}
 >
 Cancel
 </Button>
 </div>
 ) : (
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={() => setActiveTagField(fieldConfig.key)}
 className="w-fit"
 >
 <Plus className="mr-1 h-3 w-3" />
 Add {fieldConfig.label.slice(0, -1)}
 </Button>
 )}
 </div>
 );

 default:
 return fieldWrapper(
 <Input
 type={fieldConfig.type}
 value={e.target.value as string || ''}
 onChange={(e) => handleInputChange(fieldConfig.key, e.target.value)}
 placeholder={fieldConfig.placeholder}
 minLength={fieldConfig.validation?.minLength}
 maxLength={fieldConfig.validation?.maxLength}
 pattern={fieldConfig.validation?.pattern}
 />
 );
 }
 };

 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="flex flex-col items-center space-y-md">
 <Skeleton className="h-component-lg w-component-lg rounded-full" />
 <Skeleton className="h-icon-xs w-component-xl" />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 {Array.from({ length: 8 }).map((_, i) => (
 <div key={i} className="space-y-xs">
 <Skeleton className="h-icon-xs w-component-lg" />
 <Skeleton className="h-icon-xl w-full" />
 </div>
 ))}
 </div>
 </div>
 );
 }

 const groupedFields = PROFILE_FIELD_CONFIG.reduce((acc, field) => {
 if (!acc[field.section]) acc[field.section] = [];
 acc[field.section].push(field);
 return acc;
 }, {} as Record<string, FieldConfig[]>);

 return (
 <form onSubmit={handleSubmit} className="space-y-xl">
 {/* Avatar Section */}
 <div className="flex flex-col items-center space-y-md">
 <div className="relative">
 <Avatar className="h-component-lg w-component-lg">
 {formData.avatar_url ? (
 <Image src={formData.avatar_url} alt="Profile" width={48} height={48} className="h-full w-full object-cover" />
 ) : (
 <User className="h-icon-2xl w-icon-2xl" />
 )}
 </Avatar>
 <Button
 type="button"
 variant="outline"
 size="sm"
 className="absolute -bottom-2 -right-2 rounded-full h-icon-lg w-icon-lg p-0"
 >
 <Camera className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 
 {profile && (
 <div className="text-center space-y-xs">
 <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
 {profile.status}
 </Badge>
 <div className="text-sm text-muted-foreground">
 Profile {profile.profile_completion_percentage}% complete
 </div>
 </div>
 )}
 </div>

 {/* Form Sections */}
 {Object.entries(groupedFields).map(([section, fields]) => (
 <Card key={section} className="p-lg">
 <h3 className="text-lg font-semibold mb-4 capitalize">
 {section === 'basic' ? 'Basic Information' : 
 section === 'contact' ? 'Contact Information' : 
 section === 'professional' ? 'Professional Information' : 
 'Metadata'}
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 {fields.map(renderField)}
 </div>
 </Card>
 ))}

 {/* Hidden Fields */}
 {onFieldVisibilityChange && (
 <Card className="p-lg">
 <h3 className="text-lg font-semibold mb-4">Hidden Fields</h3>
 <div className="flex flex-wrap gap-xs">
 {PROFILE_FIELD_CONFIG
 .filter(field => !visibleFields.has(field.key))
 .map(field => (
 <Button
 key={field.key}
 type="button"
 variant="outline"
 size="sm"
 onClick={() => onFieldVisibilityChange(field.key, true)}
 className="h-icon-lg"
 >
 <Eye className="mr-1 h-3 w-3" />
 {field.label}
 </Button>
 ))}
 </div>
 </Card>
 )}

 {/* Save Button */}
 <div className="flex justify-end">
 <Button type="submit" disabled={saving}>
 <Save className="mr-2 h-icon-xs w-icon-xs" />
 {saving ? 'Saving...' : 'Save Changes'}
 </Button>
 </div>
 </form>
 );
}
