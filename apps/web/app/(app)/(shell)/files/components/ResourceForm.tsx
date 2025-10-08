'use client';


import { X, Upload, FileText, BookOpen, GraduationCap, File, Clipboard, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Card, Button } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';

export type ResourceType = 'policy' | 'guide' | 'training' | 'template' | 'procedure' | 'featured';
export type ResourceStatus = 'draft' | 'under_review' | 'published' | 'archived';
export type ResourceVisibility = 'public' | 'private' | 'team' | 'role_based';

export interface ResourceFormResource {
 id: string;
 title: string;
 description?: string | null;
 type: ResourceType;
 category: string;
 status: ResourceStatus;
 visibility?: ResourceVisibility;
 tags?: string[];
 version?: string;
 language?: string;
 is_featured?: boolean;
 file_url?: string | null;
 file_size?: number | null;
 file_type?: string | null;
 download_count?: number;
 view_count?: number;
}


interface ResourceFormProps {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
 resource?: ResourceFormResource | null;
}

interface ResourceFormData {
 title: string;
 description: string;
 type: ResourceType;
 category: string;
 status: ResourceStatus;
 visibility: ResourceVisibility;
 tags: string;
 version: string;
 language: string;
 isFeatured: boolean;
}

type ResourceFormErrors = Partial<Record<keyof ResourceFormData | 'file' | 'submit', string>>;

const resourceTypeOptions = [
 { value: 'policy', label: 'Policy', icon: FileText },
 { value: 'guide', label: 'Guide', icon: BookOpen },
 { value: 'training', label: 'Training', icon: GraduationCap },
 { value: 'template', label: 'Template', icon: File },
 { value: 'procedure', label: 'Procedure', icon: Clipboard },
 { value: 'featured', label: 'Featured', icon: Star }
];

const statusOptions = [
 { value: 'draft', label: 'Draft' },
 { value: 'under_review', label: 'Under Review' },
 { value: 'published', label: 'Published' },
 { value: 'archived', label: 'Archived' }
];

const visibilityOptions = [
 { value: 'public', label: 'Public' },
 { value: 'private', label: 'Private' },
 { value: 'team', label: 'Team Only' },
 { value: 'role_based', label: 'Role Based' }
];

const defaultFormData: ResourceFormData = {
 title: '',
 description: '',
 type: 'policy',
 category: '',
 status: 'draft',
 visibility: 'public',
 tags: '',
 version: '1.0',
 language: 'en',
 isFeatured: false
};

export default function ResourceForm({ isOpen, onClose, onSuccess, resource }: ResourceFormProps) {
 const [formData, setFormData] = useState<ResourceFormData>({ ...defaultFormData });
 const [file, setFile] = useState<File | null>(null);
 const [uploading, setUploading] = useState(false);
 const [errors, setErrors] = useState<ResourceFormErrors>({});

 const supabase = useMemo(() => createBrowserClient(), []);

 useEffect(() => {
 if (!resource) {
 setFormData({ ...defaultFormData });
 setFile(null);
 setErrors({});
 return;
 }

 setFormData({
 title: resource.title ?? '',
 description: resource.description ?? '',
 type: (resource.type ?? 'policy') as ResourceType,
 category: resource.category ?? '',
 status: (resource.status ?? 'draft') as ResourceStatus,
 visibility: (resource.visibility ?? 'public') as ResourceVisibility,
 tags: resource.tags?.join(', ') ?? '',
 version: resource.version ?? '1.0',
 language: resource.language ?? 'en',
 isFeatured: Boolean(resource.is_featured)
 });
 setFile(null);
 setErrors({});
 }, [resource]);

 const updateField = useCallback(<K extends keyof ResourceFormData>(field: K, value: ResourceFormData[K]) => {
 setFormData((previous) => ({ ...previous, [field]: value }));
 setErrors((previous) => {
 if (!(field in previous)) {
 return previous;
 }
 const next = { ...previous };
 delete next[field];
 return next;
 });
 }, []);

 const validateForm = useCallback((): ResourceFormErrors => {
 const validation: ResourceFormErrors = {};

 if (!formData.title.trim()) {
 validation.title = 'Title is required';
 }

 if (!formData.category.trim()) {
 validation.category = 'Category is required';
 }

 if (!resource && !file) {
 validation.file = 'File is required for new resources';
 }

 setErrors(validation);
 return validation;
 }, [file, formData.category, formData.title, resource]);

 const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
 const selectedFile = event.target.files?.[0] ?? null;
 setFile(selectedFile);
 if (selectedFile) {
 setErrors((previous) => {
 if (!previous.file) {
 return previous;
 }
 const next = { ...previous };
 delete next.file;
 return next;
 });
 }
 }, []);

 const uploadFile = useCallback(
 async (selectedFile: File): Promise<{ url: string; size: number; type: string } | null> => {
 try {
 const fileExt = selectedFile.name.split('.').pop();
 const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
 const filePath = `resources/${fileName}`;

 const { error: uploadError } = await supabase.storage.from('resources').upload(filePath, selectedFile);

 if (uploadError) {
 console.error('Upload error:', uploadError);
 return null;
 }

 const { data } = supabase.storage.from('resources').getPublicUrl(filePath);

 return {
 url: data.publicUrl,
 size: selectedFile.size,
 type: selectedFile.type
 };
 } catch (error) {
 console.error('File upload error:', error);
 return null;
 }
 },
 [supabase]
 );

 const handleSubmit = useCallback(
 async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();

 const validation = validateForm();
 if (Object.keys(validation).length > 0) {
 return;
 }

 setUploading(true);

 try {
 let fileUrl = resource?.file_url ?? null;
 let fileSize = resource?.file_size ?? null;
 let fileType = resource?.file_type ?? null;

 if (file) {
 const uploaded = await uploadFile(file);
 if (!uploaded) {
 setErrors((previous) => ({ ...previous, file: 'Failed to upload file' }));
 setUploading(false);
 return;
 }
 fileUrl = uploaded.url;
 fileSize = uploaded.size;
 fileType = uploaded.type;
 }

 const payload = {
 title: formData.title.trim(),
 description: formData.description.trim() || null,
 type: formData.type,
 category: formData.category.trim(),
 status: formData.status,
 visibility: formData.visibility,
 tags: formData.tags
 .split(',')
 .map((tag) => tag.trim())
 .filter(Boolean),
 version: formData.version,
 language: formData.language,
 is_featured: formData.isFeatured,
 file_url: fileUrl,
 file_size: fileSize,
 file_type: fileType,
 download_count: resource?.download_count ?? 0,
 view_count: resource?.view_count ?? 0
 };

 const mutation = resource
 ? supabase.from('resources').update(payload).eq('id', resource.id)
 : supabase.from('resources').insert([payload]);

 const { error: mutationError } = await mutation;

 if (mutationError) {
 console.error('Database error:', mutationError);
 setErrors((previous) => ({ ...previous, submit: 'Failed to save resource' }));
 return;
 }

 setErrors({});
 onSuccess();
 onClose();
 } catch (error) {
 console.error('Submit error:', error);
 setErrors((previous) => ({ ...previous, submit: 'An unexpected error occurred' }));
 } finally {
 setUploading(false);
 }
 },
 [file, formData, onClose, onSuccess, resource, supabase, uploadFile, validateForm]
 );

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-md">
 <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between p-lg border-b">
 <h2 className="text-heading-4">
 {resource ? 'Edit Resource' : 'Add New Resource'}
 </h2>
 <Button onClick={onClose}>
 <X className="w-icon-xs h-icon-xs" />
 </Button>
 </div>

 <form onSubmit={handleSubmit} className="p-lg stack-lg">
 {/* Title */}
 <div>
 <label className="block text-body-sm form-label mb-sm">Title *</label>
 <input
 type="text"
 className="w-full px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
 value={formData.title}
 onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('title', event.target.value)}
 placeholder="Enter resource title"
 />
 {errors.title && <p className="color-destructive text-body-sm mt-xs">{errors.title}</p>}
 </div>

 {/* Description */}
 <div>
 <label className="block text-body-sm form-label mb-sm">Description</label>
 <textarea
 className="w-full px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
 rows={3}
 value={formData.description}
 onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateField('description', event.target.value)}
 placeholder="Enter resource description"
 />
 </div>

 {/* Type and Category */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Type *</label>
 <select
 className="w-full px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
 value={formData.type}
 onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField('type', event.target.value as ResourceType)}
 >
 {resourceTypeOptions.map(option => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-sm">Category *</label>
 <input
 type="text"
 className="w-full px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
 value={formData.category}
 onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('category', event.target.value)}
 placeholder="e.g., HR, safety, Operations"
 />
 {errors.category && <p className="color-destructive text-body-sm mt-xs">{errors.category}</p>}
 </div>
 </div>

 {/* Status and Visibility */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Status</label>
 <select
 className="w-full px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
 value={formData.status}
 onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField('status', event.target.value as ResourceStatus)}
 >
 {statusOptions.map(option => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-body-sm form-label mb-sm">Visibility</label>
 <select
 className="w-full px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
 value={formData.visibility}
 onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField('visibility', event.target.value as ResourceVisibility)}
 >
 {visibilityOptions.map(option => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>
 </div>

 {/* Version and Language */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-sm">Version</label>
 <input
 type="text"
 className="w-full px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
 value={formData.version}
 onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('version', event.target.value)}
 placeholder="1.0"
 />
 </div>

 <div>
 <label className="block text-body-sm form-label mb-sm">Language</label>
 <select
 className="w-full px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
 value={formData.language}
 onChange={(event: ChangeEvent<HTMLSelectElement>) => updateField('language', event.target.value)}
 >
 <option value="en">English</option>
 <option value="es">Spanish</option>
 <option value="fr">French</option>
 <option value="de">German</option>
 <option value="pt">Portuguese</option>
 </select>
 </div>
 </div>

 {/* Tags */}
 <div>
 <label className="block text-body-sm form-label mb-sm">Tags</label>
 <input
 type="text"
 className="w-full px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
 value={formData.tags}
 onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('tags', event.target.value)}
 placeholder="Enter tags separated by commas"
 />
 <p className="text-body-sm color-muted mt-xs">Separate multiple tags with commas</p>
 </div>

 {/* File Upload */}
 <div>
 <label className="block text-body-sm form-label mb-sm">
 File {!resource && '*'}
 </label>
 <div className="border-2 border-dashed border-border rounded-md p-md">
 <input
 type="file"
 onChange={handleFileChange}
 className="w-full"
 accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
 />
 {file && (
 <p className="text-body-sm color-muted mt-sm">
 Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
 </p>
 )}
 {resource?.file_url && !file && (
 <p className="text-body-sm color-muted mt-sm">
 Current file: {resource.file_url.split('/').pop()}
 </p>
 )}
 </div>
 {errors.file && <p className="color-destructive text-body-sm mt-xs">{errors.file}</p>}
 </div>

 {/* Featured */}
 <div className="flex items-center cluster-sm">
 <input
 type="checkbox"
 
 checked={formData.isFeatured}
 onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('isFeatured', event.target.checked)}
 className="rounded border-border color-accent focus:ring-primary"
 />
 <label htmlFor="is_featured" className="text-body-sm form-label">
 Mark as featured resource
 </label>
 </div>

 {/* Error Messages */}
 {errors.submit && (
 <div className="bg-destructive/10 border border-destructive/20 rounded-md p-sm">
 <p className="color-destructive text-body-sm">{errors.submit}</p>
 </div>
 )}

 {/* Actions */}
 <div className="flex justify-end cluster-sm pt-md border-t">
 <Button type="button" variant="outline" onClick={onClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={uploading}>
 {uploading ? (
 <>
 <div className="w-icon-xs h-icon-xs border-2 border-background/30 border-t-background rounded-full animate-spin mr-sm"></div>
 {resource ? 'Updating...' : 'Creating...'}
 </>
 ) : (
 <>
 <Upload className="w-icon-xs h-icon-xs mr-sm" />
 {resource ? 'Update Resource' : 'Create Resource'}
 </>
 )}
 </Button>
 </div>
 </form>
 </Card>
 </div>
 );
}
