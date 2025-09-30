"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  RotateCcw,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button, Input, Textarea, Select, Badge } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import EditDrawer from '../../drawers/EditDrawer';
import { filesQueriesService } from '../../lib/queries';
import { filesApiService } from '../../lib/api';
import type { DigitalAsset } from '../../types';

const editFileSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  category: z.enum(['document', 'image', 'video', 'audio', 'drawing', 'specification', 'report', 'template', 'policy', 'other']),
  access_level: z.enum(['public', 'team', 'restricted', 'private']),
  tags: z.array(z.string()).max(20, 'Maximum 20 tags allowed').optional(),
  folder_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
});

type EditFileForm = z.infer<typeof editFileSchema>;

export default function EditFilePage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.id as string;

  const [file, setFile] = useState<DigitalAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>(''); // Would come from context
  const [userId, setUserId] = useState<string>(''); // Would come from context
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditFileForm>({
    resolver: zodResolver(editFileSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      access_level: 'private',
      tags: [],
    },
  });

  const watchedTags = watch('tags') || [];

  useEffect(() => {
    if (fileId) {
      loadFile();
    }
  }, [fileId]);

  const loadFile = async () => {
    try {
      setIsLoading(true);
      const fileData = await filesQueriesService.getFileById(fileId, orgId);
      setFile(fileData);

      // Reset form with file data
      reset({
        title: fileData.title,
        description: fileData.description || '',
        category: fileData.category as any,
        access_level: fileData.access_level as any,
        tags: fileData.tags || [],
        folder_id: fileData.folder_id,
        project_id: fileData.project_id,
      });
    } catch (err) {
      console.error('Failed to load file:', err);
      setError('File not found or access denied');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EditFileForm) => {
    if (!file) return;

    setIsSaving(true);
    try {
      await filesApiService.updateFile(file.id, data, userId);
      router.push(`/files/${file.id}`);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    router.push(`/files/${fileId}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      document: FileText,
      image: FileText, // Would use Image icon in real implementation
      video: FileText, // Would use Video icon in real implementation
      audio: FileText, // Would use Music icon in real implementation
      other: FileText,
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const getAccessIcon = (level: string) => {
    return Eye; // Simplified
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">File Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested file could not be found.'}</p>
          <Button onClick={() => router.push('/files')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Files
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(file.category);
  const AccessIcon = getAccessIcon(file.access_level);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <CategoryIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Edit File</h1>
                    <p className="text-sm text-gray-500">
                      {file.category} • {formatFileSize(file.file_size || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={file.status === 'active' ? 'default' : 'secondary'}>
                  {file.status}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show Preview
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* File Preview */}
                {showPreview && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Current Preview</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <CategoryIcon className="w-8 h-8 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.title}</p>
                        <p className="text-sm text-gray-500">
                          {file.category} • {formatFileSize(file.file_size || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="Enter file title"
                    className={errors.title ? 'border-red-300' : ''}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    {...register('description')}
                    placeholder="Enter file description"
                    rows={3}
                    className={errors.description ? 'border-red-300' : ''}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Category and Access Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <Select
                      value={watch('category')}
                      onValueChange={(value: unknown) => setValue('category', value)}
                    >
                      <Select.Trigger className={errors.category ? 'border-red-300' : ''}>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="document">Document</Select.Item>
                        <Select.Item value="image">Image</Select.Item>
                        <Select.Item value="video">Video</Select.Item>
                        <Select.Item value="audio">Audio</Select.Item>
                        <Select.Item value="drawing">Drawing</Select.Item>
                        <Select.Item value="specification">Specification</Select.Item>
                        <Select.Item value="report">Report</Select.Item>
                        <Select.Item value="template">Template</Select.Item>
                        <Select.Item value="policy">Policy</Select.Item>
                        <Select.Item value="other">Other</Select.Item>
                      </Select.Content>
                    </Select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Level *
                    </label>
                    <Select
                      value={watch('access_level')}
                      onValueChange={(value: unknown) => setValue('access_level', value)}
                    >
                      <Select.Trigger className={errors.access_level ? 'border-red-300' : ''}>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="public">Public</Select.Item>
                        <Select.Item value="team">Team</Select.Item>
                        <Select.Item value="restricted">Restricted</Select.Item>
                        <Select.Item value="private">Private</Select.Item>
                      </Select.Content>
                    </Select>
                    {errors.access_level && (
                      <p className="mt-1 text-sm text-red-600">{errors.access_level.message}</p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-3">
                    {/* Tag Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              setValue('tags', [...watchedTags, input.value.trim()]);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement;
                          if (input?.value.trim()) {
                            setValue('tags', [...watchedTags, input.value.trim()]);
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Current Tags */}
                    {watchedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {watchedTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                            onClick={() => setValue('tags', watchedTags.filter((_, i) => i !== index))}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}

                    {errors.tags && (
                      <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={!isDirty || isSaving}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !isDirty}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* File Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">File Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 text-gray-900">{formatFileSize(file.file_size || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-500">MIME Type:</span>
                  <span className="ml-2 text-gray-900">{file.mime_type || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Modified:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(file.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Created by:</span>
                  <span className="ml-2 text-gray-900">{file.created_by}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={file.status === 'active' ? 'default' : 'secondary'}>
                    {file.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category</span>
                  <Badge variant="outline">{file.category}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Access</span>
                  <Badge variant="outline">{file.access_level}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
