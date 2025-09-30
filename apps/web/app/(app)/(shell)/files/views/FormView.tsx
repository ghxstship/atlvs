"use client";

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  Trash2,
  Share,
  MoreHorizontal,
} from 'lucide-react';
import { Card, Button, Input, Select, DropdownMenu, Badge, Textarea } from '@ghxstship/ui';
import type { DigitalAsset } from '../types';

interface FormViewProps {
  files: DigitalAsset[];
  onView: (file: DigitalAsset) => void;
  onEdit: (file: DigitalAsset) => void;
  onDownload: (file: DigitalAsset) => void;
  onDelete: (file: DigitalAsset) => void;
  onShare: (file: DigitalAsset) => void;
  onUpdateFile: (fileId: string, updates: Partial<DigitalAsset>) => void;
  formatFileSize: (bytes: number) => string;
  getCategoryIcon: (category: string) => React.ComponentType<any>;
}

export default function FormView({
  files,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onShare,
  onUpdateFile,
  formatFileSize,
  getCategoryIcon,
}: FormViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>({});

  // Filter files
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = !searchQuery ||
        file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [files, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(files.map(f => f.category))];
    return cats.sort();
  }, [files]);

  // Handle form field changes
  const handleFieldChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save form changes
  const handleSave = (fileId: string) => {
    if (Object.keys(formData).length > 0) {
      onUpdateFile(fileId, formData);
      setFormData({});
      setEditingFile(null);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({});
    setEditingFile(null);
  };

  // Start editing a file
  const startEditing = (file: DigitalAsset) => {
    setEditingFile(file.id);
    setFormData({
      title: file.title,
      description: file.description || '',
      category: file.category,
      access_level: file.access_level,
      tags: file.tags || [],
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <Select.Trigger className="w-40">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Categories</Select.Item>
                {categories.map(category => (
                  <Select.Item key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {filteredFiles.length} files
        </div>
      </div>

      {/* Forms List */}
      <div className="space-y-4">
        {filteredFiles.map((file) => {
          const CategoryIcon = getCategoryIcon(file.category);
          const isEditing = editingFile === file.id;

          return (
            <Card key={file.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <CategoryIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{file.title}</h3>
                    <p className="text-sm text-gray-500">
                      {file.category} • {formatFileSize(file.file_size || 0)} • {file.access_level}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={file.status === 'active' ? 'default' : 'secondary'}>
                    {file.status}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item onClick={() => onView(file)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onClick={() => startEditing(file)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onClick={() => onDownload(file)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onClick={() => onShare(file)}>
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item
                        onClick={() => onDelete(file)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="Enter file title"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {file.title}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  {isEditing ? (
                    <Select
                      value={formData.category || ''}
                      onValueChange={(value) => handleFieldChange('category', value)}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select category" />
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
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-sm capitalize">
                      {file.category}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Enter file description"
                      rows={3}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-sm min-h-[60px]">
                      {file.description || 'No description provided'}
                    </div>
                  )}
                </div>

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level *
                  </label>
                  {isEditing ? (
                    <Select
                      value={formData.access_level || ''}
                      onValueChange={(value) => handleFieldChange('access_level', value)}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select access level" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="public">Public</Select.Item>
                        <Select.Item value="team">Team</Select.Item>
                        <Select.Item value="restricted">Restricted</Select.Item>
                        <Select.Item value="private">Private</Select.Item>
                      </Select.Content>
                    </Select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-sm capitalize">
                      {file.access_level}
                    </div>
                  )}
                </div>

                {/* File Size (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Size
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    {formatFileSize(file.file_size || 0)}
                  </div>
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  {isEditing ? (
                    <Input
                      value={(formData.tags || []).join(', ')}
                      onChange={(e) => handleFieldChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                      placeholder="Enter tags separated by commas"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {file.tags && file.tags.length > 0
                        ? file.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="mr-1 mb-1">
                              {tag}
                            </Badge>
                          ))
                        : 'No tags'
                      }
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metadata
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Created:</span> {new Date(file.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Modified:</span> {new Date(file.updated_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Created by:</span> {file.created_by}
                      </div>
                      <div>
                        <span className="font-medium">MIME Type:</span> {file.mime_type || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSave(file.id)}>
                    Save Changes
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload some files to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
}
