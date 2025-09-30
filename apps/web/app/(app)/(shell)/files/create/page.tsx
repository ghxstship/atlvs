"use client";

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  File,
  X,
  Save,
  Plus,
  Tag,
} from 'lucide-react';
import { Button, Input, Textarea, Select, Progress, Badge } from '@ghxstship/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { filesMutationsService } from '../lib/mutations';
import { filesApiService } from '../lib/api';
import type { CreateAssetInput } from '../lib/validations';

const createFileSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  category: z.enum(['document', 'image', 'video', 'audio', 'drawing', 'specification', 'report', 'template', 'policy', 'other']),
  access_level: z.enum(['public', 'team', 'restricted', 'private']),
  tags: z.array(z.string()).max(20, 'Maximum 20 tags allowed').optional(),
  folder_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
});

type CreateFileForm = z.infer<typeof createFileSchema>;

export default function CreateFilePage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<CreateAssetInput[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [orgId, setOrgId] = useState<string>(''); // This would come from context
  const [userId, setUserId] = useState<string>(''); // This would come from context

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFileForm>({
    resolver: zodResolver(createFileSchema),
    defaultValues: {
      category: 'other',
      access_level: 'private',
      tags: [],
    },
  });

  const watchedTags = watch('tags') || [];

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);

    // Auto-detect category based on file type
    files.forEach(file => {
      const category = detectFileCategory(file);
      if (files.length === 1) {
        setValue('category', category);
      }
    });
  };

  // Detect file category based on MIME type
  const detectFileCategory = (file: File): CreateAssetInput['category'] => {
    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'report';

    return 'other';
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const onSubmit = async (data: CreateFileForm) => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const newUploadedFiles: CreateAssetInput[] = [];

    try {
      for (const file of selectedFiles) {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const filePath = `uploads/${fileName}`;

        // Upload file to storage
        await filesApiService.uploadFile(file, filePath, orgId);

        // Create file record
        const fileData: CreateAssetInput = {
          title: selectedFiles.length === 1 ? data.title : file.name,
          description: selectedFiles.length === 1 ? data.description : '',
          category: data.category,
          tags: data.tags || [],
          access_level: data.access_level,
          folder_id: data.folder_id,
          project_id: data.project_id,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        };

        const createdFile = await filesMutationsService.createFile(fileData, orgId, userId);
        newUploadedFiles.push(fileData);

        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100,
        }));
      }

      setUploadedFiles(newUploadedFiles);

      // Redirect after successful upload
      setTimeout(() => {
        router.push('/files');
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons = {
      document: FileText,
      image: Image,
      video: Video,
      audio: Music,
      other: File,
    };
    return icons[category as keyof typeof icons] || File;
  };

  if (uploadedFiles.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-gray-600 mb-4">
            {uploadedFiles.length} file(s) uploaded successfully
          </p>
          <Button onClick={() => router.push('/files')} className="w-full">
            View Files
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
            <p className="text-gray-600 mt-1">Add new files to your digital asset library</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Files to Upload
              </label>

              {selectedFiles.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports all file types up to 100MB each
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFiles.map((file, index) => {
                    const CategoryIcon = getCategoryIcon(detectFileCategory(file));
                    const progress = uploadProgress[file.name] || 0;

                    return (
                      <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <CategoryIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>

                          {isUploading && (
                            <div className="mt-2">
                              <Progress value={progress} className="h-1" />
                              <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add More Files
                  </Button>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload-additional"
                  />
                </div>
              )}
            </div>

            {/* File Details (only show for single file uploads) */}
            {selectedFiles.length === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Category */}
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

                {/* Description */}
                <div className="md:col-span-2">
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

                {/* Access Level */}
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

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>

                    {watchedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {watchedTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={selectedFiles.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
