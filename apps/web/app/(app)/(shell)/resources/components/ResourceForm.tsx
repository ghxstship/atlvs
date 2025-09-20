'use client';


import React, { useState } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { X, Upload, FileText, BookOpen, GraduationCap, File, Clipboard, Star } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';

interface ResourceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource?;
}

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

export default function ResourceForm({ isOpen, onClose, onSuccess, resource }: ResourceFormProps) {
  const [formData, setFormData] = useState({
    title: resource?.title || '',
    description: resource?.description || '',
    type: resource?.type || 'policy',
    category: resource?.category || '',
    status: resource?.status || 'draft',
    visibility: resource?.visibility || 'public',
    tags: resource?.tags?.join(', ') || '',
    version: resource?.version || '1.0',
    language: resource?.language || 'en',
    is_featured: resource?.is_featured || false
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const supabase = createBrowserClient();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!resource && !file) {
      newErrors.file = 'File is required for new resources';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `resources/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    
    try {
      let fileUrl = resource?.file_url;
      let fileSize = resource?.file_size;
      let fileType = resource?.file_type;

      if (file) {
        fileUrl = await uploadFile(file);
        if (!fileUrl) {
          setErrors({ file: 'Failed to upload file' });
          setUploading(false);
          return;
        }
        fileSize = file.size;
        fileType = file.type;
      }

      const resourceData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        category: formData.category.trim(),
        status: formData.status,
        visibility: formData.visibility,
        tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        version: formData.version,
        language: formData.language,
        is_featured: formData.is_featured,
        file_url: fileUrl,
        file_size: fileSize,
        file_type: fileType,
        download_count: resource?.download_count || 0,
        view_count: resource?.view_count || 0
      };

      let result;
      if (resource) {
        // Update existing resource
        result = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', resource.id);
      } else {
        // Create new resource
        result = await supabase
          .from('resources')
          .insert([resourceData]);
      }

      if (result.error) {
        console.error('Database error:', result.error);
        setErrors({ submit: 'Failed to save resource' });
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-md">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-lg border-b">
          <h2 className="text-heading-4">
            {resource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <Button onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-lg stack-lg">
          {/* Title */}
          <div>
            <label className="block text-body-sm form-label mb-sm">Title *</label>
            <input
              type="text"
              className="w-full  px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter resource title"
            />
            {errors.title && <p className="color-destructive text-body-sm mt-xs">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-body-sm form-label mb-sm">Description</label>
            <textarea
              className="w-full  px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter resource description"
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label mb-sm">Type *</label>
              <select
                className="w-full  px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.type}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, type: e.target.value }))}
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
                className="w-full  px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.category}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., HR, Safety, Operations"
              />
              {errors.category && <p className="color-destructive text-body-sm mt-xs">{errors.category}</p>}
            </div>
          </div>

          {/* Status and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label mb-sm">Status</label>
              <select
                className="w-full  px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.status}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, status: e.target.value }))}
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
                className="w-full  px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.visibility}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
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
                className="w-full  px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.version}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0"
              />
            </div>

            <div>
              <label className="block text-body-sm form-label mb-sm">Language</label>
              <select
                className="w-full  px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.language}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-body-sm form-label mb-sm">Tags</label>
            <input
              type="text"
              className="w-full  px-md py-sm border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
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
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
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
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-sm"></div>
                  {resource ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-sm" />
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
