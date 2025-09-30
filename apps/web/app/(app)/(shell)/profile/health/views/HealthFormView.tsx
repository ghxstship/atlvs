'use client';

import { Save, Plus, X, Calendar, User, FileText, Shield, Bell } from "lucide-react";
import { useState } from 'react';
import {
 Button,
 Card,
 Input,
 Label,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Textarea,
 Badge,
 Switch,
} from '@ghxstship/ui';
import type { HealthRecord, HealthRecordFormData } from '../types';
import {
 RECORD_TYPE_LABELS,
 SEVERITY_LABELS,
 CATEGORY_LABELS,
 PRIVACY_LABELS,
 COMMON_TAGS,
 formatDate,
 getRecordTypeIcon,
} from '../types';

interface HealthFormViewProps {
 record: HealthRecord | null;
 formData: HealthRecordFormData;
 formErrors: Record<string, string>;
 loading: boolean;
 saving: boolean;
 onFieldChange: (field: keyof HealthRecordFormData, value: unknown) => void;
 onSave: () => void;
}

export default function HealthFormView({
 record,
 formData,
 formErrors,
 loading,
 saving,
 onFieldChange,
 onSave,
}: HealthFormViewProps) {
 const [tagInput, setTagInput] = useState('');

 const handleAddTag = () => {
 if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
 onFieldChange('tags', [...formData.tags, tagInput.trim()]);
 setTagInput('');
 }
 };

 const handleRemoveTag = (tag: string) => {
 onFieldChange('tags', formData.tags.filter(t => t !== tag));
 };

 const handleCommonTagClick = (tag: string) => {
 if (!formData.tags.includes(tag)) {
 onFieldChange('tags', [...formData.tags, tag]);
 }
 };

 if (loading) {
 return (
 <Card className="p-6">
 <div className="space-y-4">
 {[...Array(8)].map((_, i) => (
 <div key={i} className="space-y-2">
 <div className="h-4 w-24 bg-muted animate-pulse rounded" />
 <div className="h-10 bg-muted animate-pulse rounded" />
 </div>
 ))}
 </div>
 </Card>
 );
 }

 return (
 <div className="space-y-6">
 <Card className="p-6">
 <div className="space-y-6">
 <div>
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
 <FileText className="h-5 w-5" />
 Basic Information
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="record_type">
 Record Type <span className="text-destructive">*</span>
 </Label>
 <Select
 value={formData.record_type}
 onValueChange={(value) => onFieldChange('record_type', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(RECORD_TYPE_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 <span className="flex items-center gap-2">
 <span>{getRecordTypeIcon(value as unknown)}</span>
 {label}
 </span>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="title">
 Title <span className="text-destructive">*</span>
 </Label>
 <Input
 
 value={formData.title}
 onChange={(e) => onFieldChange('title', e.target.value)}
 placeholder="Enter record title"
 className={formErrors.title ? 'border-destructive' : ''}
 />
 {formErrors.title && (
 <p className="text-sm text-destructive">{formErrors.title}</p>
 )}
 </div>

 <div className="space-y-2 md:col-span-2">
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 value={formData.description}
 onChange={(e) => onFieldChange('description', e.target.value)}
 placeholder="Detailed description of the health record..."
 rows={3}
 />
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
 <Calendar className="h-5 w-5" />
 Dates & Timeline
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="date_recorded">
 Date Recorded <span className="text-destructive">*</span>
 </Label>
 <Input
 
 type="date"
 value={formData.date_recorded}
 onChange={(e) => onFieldChange('date_recorded', e.target.value)}
 className={formErrors.date_recorded ? 'border-destructive' : ''}
 />
 {formErrors.date_recorded && (
 <p className="text-sm text-destructive">{formErrors.date_recorded}</p>
 )}
 </div>

 <div className="space-y-2">
 <Label htmlFor="expiry_date">Expiry Date</Label>
 <Input
 
 type="date"
 value={formData.expiry_date}
 onChange={(e) => onFieldChange('expiry_date', e.target.value)}
 className={formErrors.expiry_date ? 'border-destructive' : ''}
 />
 {formErrors.expiry_date && (
 <p className="text-sm text-destructive">{formErrors.expiry_date}</p>
 )}
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
 <User className="h-5 w-5" />
 Provider Information
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="provider">Healthcare Provider</Label>
 <Input
 
 value={formData.provider}
 onChange={(e) => onFieldChange('provider', e.target.value)}
 placeholder="Dr. Smith, General Hospital"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="provider_contact">Provider Contact</Label>
 <Input
 
 value={formData.provider_contact}
 onChange={(e) => onFieldChange('provider_contact', e.target.value)}
 placeholder="Phone, email, or address"
 />
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-lg font-semibold mb-4">Classification</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="space-y-2">
 <Label htmlFor="severity">Severity Level</Label>
 <Select
 value={formData.severity}
 onValueChange={(value) => onFieldChange('severity', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="category">Category</Label>
 <Select
 value={formData.category}
 onValueChange={(value) => onFieldChange('category', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 {label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label htmlFor="privacy_level">
 Privacy Level <span className="text-destructive">*</span>
 </Label>
 <Select
 value={formData.privacy_level}
 onValueChange={(value) => onFieldChange('privacy_level', value)}
 >
 <SelectTrigger >
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(PRIVACY_LABELS).map(([value, label]) => (
 <SelectItem key={value} value={value}>
 <span className="flex items-center gap-2">
 <Shield className="h-4 w-4" />
 {label}
 </span>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-lg font-semibold mb-4">Tags & Notes</h3>
 <div className="space-y-4">
 <div className="space-y-2">
 <Label>Tags</Label>
 <div className="flex gap-2">
 <Input
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 placeholder="Add a tag..."
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
 />
 <Button type="button" onClick={handleAddTag} size="sm">
 <Plus className="h-4 w-4" />
 </Button>
 </div>
 
 {formData.tags.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-2">
 {formData.tags.map((tag) => (
 <Badge key={tag} variant="secondary" className="gap-1">
 {tag}
 <button
 type="button"
 onClick={() => handleRemoveTag(tag)}
 className="ml-1 hover:text-destructive"
 >
 <X className="h-3 w-3" />
 </button>
 </Badge>
 ))}
 </div>
 )}

 <div className="mt-2">
 <p className="text-sm text-muted-foreground mb-2">Common tags:</p>
 <div className="flex flex-wrap gap-1">
 {COMMON_TAGS.slice(0, 10).map((tag) => (
 <Badge
 key={tag}
 variant="outline"
 className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
 onClick={() => handleCommonTagClick(tag)}
 >
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="notes">Notes</Label>
 <Textarea
 
 value={formData.notes}
 onChange={(e) => onFieldChange('notes', e.target.value)}
 placeholder="Additional notes, observations, or instructions..."
 rows={4}
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="document_url">Document URL</Label>
 <Input
 
 type="url"
 value={formData.document_url}
 onChange={(e) => onFieldChange('document_url', e.target.value)}
 placeholder="https://example.com/document.pdf"
 className={formErrors.document_url ? 'border-destructive' : ''}
 />
 {formErrors.document_url && (
 <p className="text-sm text-destructive">{formErrors.document_url}</p>
 )}
 </div>
 </div>
 </div>

 <div className="space-y-4 pt-4 border-t">
 <h3 className="text-lg font-semibold flex items-center gap-2">
 <Bell className="h-5 w-5" />
 Settings
 </h3>
 
 <div className="flex items-center justify-between">
 <div className="space-y-0.5">
 <Label htmlFor="is_active">Active Record</Label>
 <p className="text-sm text-muted-foreground">
 Whether this record is currently active/relevant
 </p>
 </div>
 <Switch
 
 checked={formData.is_active}
 onCheckedChange={(checked) => onFieldChange('is_active', checked)}
 />
 </div>

 <div className="flex items-center justify-between">
 <div className="space-y-0.5">
 <Label htmlFor="reminder_enabled">Expiry Reminders</Label>
 <p className="text-sm text-muted-foreground">
 Get notified before this record expires
 </p>
 </div>
 <Switch
 
 checked={formData.reminder_enabled}
 onCheckedChange={(checked) => onFieldChange('reminder_enabled', checked)}
 />
 </div>

 {formData.reminder_enabled && (
 <div className="space-y-2 ml-4">
 <Label htmlFor="reminder_days_before">Remind me (days before expiry)</Label>
 <Input
 
 type="number"
 min="1"
 max="365"
 value={formData.reminder_days_before}
 onChange={(e) => onFieldChange('reminder_days_before', parseInt(e.target.value) || 30)}
 className={`w-32 ${formErrors.reminder_days_before ? 'border-destructive' : ''}`}
 />
 {formErrors.reminder_days_before && (
 <p className="text-sm text-destructive">{formErrors.reminder_days_before}</p>
 )}
 </div>
 )}
 </div>

 <div className="flex justify-end pt-4 border-t">
 <Button onClick={onSave} disabled={saving}>
 <Save className="mr-2 h-4 w-4" />
 {saving ? 'Saving...' : record ? 'Update Record' : 'Create Record'}
 </Button>
 </div>
 </div>
 </Card>

 {record && (
 <Card className="p-4 bg-muted/50">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">
 Created: {formatDate(record.created_at)}
 </span>
 {record.updated_at !== record.created_at && (
 <span className="text-muted-foreground">
 Updated: {formatDate(record.updated_at)}
 </span>
 )}
 </div>
 </Card>
 )}
 </div>
 );
}
