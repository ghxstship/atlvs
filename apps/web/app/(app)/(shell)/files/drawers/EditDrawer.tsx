"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Tag,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Button,
  LegacyInput,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
} from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DigitalAsset } from '../types';

const editFileSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  category: z.enum(['document', 'image', 'video', 'audio', 'drawing', 'specification', 'report', 'template', 'policy', 'other']),
  access_level: z.enum(['public', 'team', 'restricted', 'private']),
  tags: z.array(z.string()).max(20, 'Maximum 20 tags allowed').optional(),
});

type EditFileForm = z.infer<typeof editFileSchema>;

interface EditDrawerProps {
  file: DigitalAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fileId: string, data: EditFileForm) => Promise<void>;
  formatFileSize: (bytes: number) => string;
  getCategoryIcon: (category: string) => React.ComponentType<any>;
  getAccessIcon: (level: string) => React.ComponentType<any>;
}

export default function EditDrawer({
  file,
  isOpen,
  onClose,
  onSave,
  formatFileSize,
  getCategoryIcon,
  getAccessIcon,
}: EditDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
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
    if (file) {
      reset({
        title: file.title,
        description: file.description || '',
        category: file.category as EditFileForm['category'],
        access_level: file.access_level as EditFileForm['access_level'],
        tags: file.tags || [],
      });
      setTagInput('');
    }
  }, [file, reset]);

  if (!isOpen || !file) return null;

  const CategoryIcon = getCategoryIcon(file.category);
  const AccessIcon = getAccessIcon(file.access_level);

  const handleFormSubmit = async (data: EditFileForm) => {
    setIsLoading(true);
    try {
      await onSave(file.id, data);
      onClose();
    } catch (error) {
      console.error('Failed to save file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const nextTag = tagInput.trim();
    if (nextTag && !watchedTags.includes(nextTag)) {
      setValue('tags', [...watchedTags, nextTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="relative ml-auto w-full max-w-2xl bg-white shadow-xl transform transition-transform">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <CategoryIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit File</h2>
                <p className="text-sm text-gray-500">
                  {file.category} • {formatFileSize(file.file_size || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => reset()}
                disabled={!isDirty}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <LegacyInput
                  {...register('title')}
                  placeholder="Enter file title"
                  className={errors.title ? 'border-red-300' : ''}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Select
                    value={watch('category')}
                    onValueChange={(value) => setValue('category', value as EditFileForm['category'])}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-300' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="drawing">Drawing</SelectItem>
                      <SelectItem value="specification">Specification</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
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
                    onValueChange={(value) => setValue('access_level', value as EditFileForm['access_level'])}
                  >
                    <SelectTrigger className={errors.access_level ? 'border-red-300' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.access_level && (
                    <p className="mt-1 text-sm text-red-600">{errors.access_level.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <LegacyInput
                      value={tagInput}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTagInput(event.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || watchedTags.includes(tagInput.trim())}
                      size="sm"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                          onClick={() => handleRemoveTag(tag)}
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

              <div className="my-6 h-[1px] w-full bg-border" role="separator" aria-hidden="true" />

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">File Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">File Size:</span>
                    <span className="ml-2 text-gray-900">{formatFileSize(file.file_size || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">File Type:</span>
                    <span className="ml-2 text-gray-900">{file.file_type || 'Unknown'}</span>
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
                  <div className="col-span-2">
                    <span className="text-gray-500">Access:</span>
                    <span className="ml-2 inline-flex items-center gap-2 text-gray-900">
                      <AccessIcon className="h-4 w-4" />
                      {file.access_level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
              >
                {isLoading ? (
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
          </div>
        </form>
      </div>
    </div>
  );
}
