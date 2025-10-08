'use client';

import { Upload, X, FileText, Image, Video, Music, FileCode, File } from "lucide-react";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import { Button, Input, Textarea, Select, Badge } from '@ghxstship/ui';
import { FilesService } from '../lib/files-service';
import type { DigitalAsset, CreateAssetData, FileCategory, FileStatus, AccessLevel } from '../types';

const createAssetSchema = z.object({
 title: z.string().min(1, 'Title is required'),
 description: z.string().optional(),
 content: z.string().optional(),
 category: z.enum([
 'document',
 'image', 
 'video',
 'audio',
 'drawing',
 'specification',
 'report',
 'template',
 'policy',
 'contract',
 'other'
 ]),
 project_id: z.string().optional(),
 tags: z.array(z.string()).default([]),
 status: z.enum(['active', 'archived', 'processing', 'error']).default('active'),
 access_level: z.enum(['public', 'team', 'restricted', 'private']).default('team'),
 version: z.string().default('1.0.0'),
 language: z.string().default('en'),
 file_url: z.string().url().optional(),
 file_size: z.number().optional(),
 file_type: z.string().optional(),
 is_featured: z.boolean().default(false),
 is_pinned: z.boolean().default(false),
 metadata: z.record(z.unknown()).optional()
});

type CreateAssetFormData = z.infer<typeof createAssetSchema>;

interface CreateAssetClientProps {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
 editingAsset?: DigitalAsset | null;
}

const categoryIcons = {
 document: FileText,
 image: Image,
 video: Video,
 audio: Music,
 drawing: FileCode,
 specification: FileText,
 report: FileText,
 template: File,
 policy: FileText,
 contract: FileText,
 other: File
};

const categoryOptions = [
 { value: 'document', label: 'Document' },
 { value: 'image', label: 'Image' },
 { value: 'video', label: 'Video' },
 { value: 'audio', label: 'Audio' },
 { value: 'drawing', label: 'Drawing' },
 { value: 'specification', label: 'Specification' },
 { value: 'report', label: 'Report' },
 { value: 'template', label: 'Template' },
 { value: 'policy', label: 'Policy' },
 { value: 'contract', label: 'Contract' },
 { value: 'other', label: 'Other' },
];

const statusOptions = [
 { value: 'active', label: 'Active' },
 { value: 'archived', label: 'Archived' },
 { value: 'processing', label: 'Processing' },
 { value: 'error', label: 'Error' },
];

const accessLevelOptions = [
 { value: 'public', label: 'Public' },
 { value: 'team', label: 'Team' },
 { value: 'restricted', label: 'Restricted' },
 { value: 'private', label: 'Private' },
];

export default function CreateAssetClient({ 
 isOpen, 
 onClose, 
 onSuccess, 
 editingAsset 
}: CreateAssetClientProps) {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [tagInput, setTagInput] = useState('');
 const [uploadedFile, setUploadedFile] = useState<File | null>(null);

 const filesService = new FilesService();

 const form = useForm<CreateAssetFormData>({
 resolver: zodResolver(createAssetSchema),
 defaultValues: editingAsset ? {
 title: editingAsset.title,
 description: editingAsset.description || '',
 content: editingAsset.content || '',
 category: editingAsset.category,
 project_id: editingAsset.project_id || '',
 tags: editingAsset.tags || [],
 status: editingAsset.status,
 access_level: editingAsset.access_level,
 version: editingAsset.version || '1.0.0',
 language: editingAsset.language || 'en',
 file_url: editingAsset.file_url || '',
 is_featured: editingAsset.is_featured || false,
 is_pinned: editingAsset.is_pinned || false,
 metadata: editingAsset.metadata || {}
 } : {
 title: '',
 description: '',
 content: '',
 category: 'document',
 tags: [],
 status: 'active',
 access_level: 'team',
 version: '1.0.0',
 language: 'en',
 is_featured: false,
 is_pinned: false
 }
 });

 const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = form;
 const watchedTags = watch('tags');

 const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (file) {
 setUploadedFile(file);
 
 // Auto-detect category based on file type
 const fileType = file.type;
 let category: FileCategory = 'other';
 
 if (fileType.startsWith('image/')) category = 'image';
 else if (fileType.startsWith('video/')) category = 'video';
 else if (fileType.startsWith('audio/')) category = 'audio';
 else if (fileType.includes('pdf') || fileType.includes('document')) category = 'document';
 
 setValue('category', category);
 setValue('file_type', fileType);
 setValue('file_size', file.size);
 
 // Set title from filename if empty
 if (!getValues('title')) {
 setValue('title', file.name.replace(/\.[^/.]+$/, ''));
 }
 }
 };

 const handleAddTag = () => {
 if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
 setValue('tags', [...watchedTags, tagInput.trim()]);
 setTagInput('');
 }
 };

 const handleRemoveTag = (tagToRemove: string) => {
 setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
 };

 const onSubmit = async (data: CreateAssetFormData) => {
 try {
 setLoading(true);
 setError(null);

 // TODO: Handle file upload to storage service here
 // For now, we'll use the file URL if provided
 let fileUrl = data.file_url;
 
 if (uploadedFile && !fileUrl) {
 // In a real implementation, upload to Supabase Storage or similar
 // fileUrl = await uploadFileToStorage(uploadedFile);
 }

 const payload: CreateAssetData = {
 ...data,
 file_url: fileUrl,
 tags: data.tags || []
 };

 if (editingAsset) {
 await filesService.updateAsset(editingAsset.id, payload);
 } else {
 await filesService.createAsset(payload);
 }

 onSuccess();
 onClose();
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to save asset');
 } finally {
 setLoading(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md">
 <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between p-lg border-b border-border">
 <h2 className="text-heading-3">
 {editingAsset ? 'Edit Asset' : 'Create Asset'}
 </h2>
 <Button variant="ghost" size="sm" onClick={onClose}>
 <X className="w-icon-xs h-icon-xs" />
 </Button>
 </div>

 <form onSubmit={handleSubmit(onSubmit)} className="p-lg space-y-lg">
 {error && (
 <div className="p-md bg-destructive/10 border border-destructive/20 rounded-md">
 <p className="text-sm text-destructive">{error}</p>
 </div>
 )}

 {/* File Upload */}
 <div>
 <label className="block text-sm font-medium mb-sm">File Upload</label>
 <div className="border-2 border-dashed border-border rounded-lg p-lg text-center">
 <input
 type="file"
 onChange={handleFileUpload}
 className="hidden"
 
 accept="*/*"
 />
 <label htmlFor="file-upload" className="cursor-pointer">
 <Upload className="w-icon-lg h-icon-lg mx-auto mb-sm text-muted-foreground" />
 <p className="text-sm text-muted-foreground">
 {uploadedFile ? uploadedFile.name : 'Click to upload a file or drag and drop'}
 </p>
 </label>
 </div>
 </div>

 {/* Basic Information */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-sm">Title *</label>
 <Input
 {...register('title')}
 placeholder="Asset title"
 />
 </div>

 <div>
 <label className="block text-sm font-medium mb-sm">Category *</label>
 <Select
 {...register('category')}
 options={categoryOptions}
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium mb-sm">Description</label>
 <Textarea
 {...register('description')}
 placeholder="Asset description"
 rows={3}
 />
 </div>

 <div>
 <label className="block text-sm font-medium mb-sm">Content</label>
 <Textarea
 {...register('content')}
 placeholder="Asset content or notes"
 rows={4}
 />
 </div>

 {/* Settings */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <div>
 <label className="block text-sm font-medium mb-sm">Status</label>
 <Select
 {...register('status')}
 options={statusOptions}
 />
 </div>

 <div>
 <label className="block text-sm font-medium mb-sm">Access Level</label>
 <Select
 {...register('access_level')}
 options={accessLevelOptions}
 />
 </div>

 <div>
 <label className="block text-sm font-medium mb-sm">Version</label>
 <Input
 {...register('version')}
 placeholder="1.0.0"
 />
 </div>
 </div>

 {/* Tags */}
 <div>
 <label className="block text-sm font-medium mb-sm">Tags</label>
 <div className="flex gap-sm mb-sm">
 <Input
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 placeholder="Add a tag"
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
 />
 <Button type="button" onClick={handleAddTag} variant="outline">
 Add
 </Button>
 </div>
 <div className="flex flex-wrap gap-xs">
 {watchedTags.map((tag, index) => (
 <Badge key={index} variant="secondary" className="flex items-center gap-xs">
 {tag}
 <button
 type="button"
 onClick={() => handleRemoveTag(tag)}
 className="ml-xs hover:text-destructive"
 >
 <X className="w-3 h-3" />
 </button>
 </Badge>
 ))}
 </div>
 </div>

 {/* Advanced Options */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-sm font-medium mb-sm">Project ID</label>
 <Input
 {...register('project_id')}
 placeholder="Optional project association"
 />
 </div>

 <div>
 <label className="block text-sm font-medium mb-sm">Language</label>
 <Input
 {...register('language')}
 placeholder="en"
 />
 </div>
 </div>

 {/* File URL (if not uploading) */}
 {!uploadedFile && (
 <div>
 <label className="block text-sm font-medium mb-sm">File URL</label>
 <Input
 {...register('file_url')}
 placeholder="https://example.com/file.pdf"
 type="url"
 />
 </div>
 )}

 {/* Checkboxes */}
 <div className="flex gap-lg">
 <label className="flex items-center gap-sm">
 <input
 type="checkbox"
 {...register('is_featured')}
 className="rounded border-border"
 />
 <span className="text-sm">Featured</span>
 </label>
 <label className="flex items-center gap-sm">
 <input
 type="checkbox"
 {...register('is_pinned')}
 className="rounded border-border"
 />
 <span className="text-sm">Pinned</span>
 </label>
 </div>

 {/* Actions */}
 <div className="flex justify-end gap-sm pt-lg border-t border-border">
 <Button type="button" variant="outline" onClick={onClose}>
 Cancel
 </Button>
 <Button type="submit" loading={loading}>
 {editingAsset ? 'Update Asset' : 'Create Asset'}
 </Button>
 </div>
 </form>
 </div>
 </div>
 );
}
