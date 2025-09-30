"use client";

import React, { useState, useMemo } from 'react';
import {
  Eye,
  Edit,
  Download,
  Trash2,
  Share,
  MoreHorizontal,
  FileText,
  Image,
  Video,
  Music,
  File,
  Calendar,
  Clock,
} from 'lucide-react';
import { Card, Button, Checkbox, DropdownMenu, Badge } from '@ghxstship/ui';
import type { DigitalAsset } from '../types';

interface CardViewProps {
  files: DigitalAsset[];
  selectedFiles: Set<string>;
  onSelectFile: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (file: DigitalAsset) => void;
  onEdit: (file: DigitalAsset) => void;
  onDownload: (file: DigitalAsset) => void;
  onDelete: (file: DigitalAsset) => void;
  onShare: (file: DigitalAsset) => void;
  onBulkAction: (action: string, files: DigitalAsset[]) => void;
  formatFileSize: (bytes: number) => string;
  getCategoryIcon: (category: string) => React.ComponentType<any>;
  getAccessIcon: (level: string) => React.ComponentType<any>;
}

export default function CardView({
  files,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onShare,
  onBulkAction,
  formatFileSize,
  getCategoryIcon,
  getAccessIcon,
}: CardViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [itemsPerRow, setItemsPerRow] = useState(4);

  // Get category-specific styling
  const getCategoryStyles = (category: string) => {
    const styles = {
      document: 'border-blue-200 bg-blue-50',
      image: 'border-green-200 bg-green-50',
      video: 'border-purple-200 bg-purple-50',
      audio: 'border-yellow-200 bg-yellow-50',
      drawing: 'border-indigo-200 bg-indigo-50',
      specification: 'border-pink-200 bg-pink-50',
      report: 'border-orange-200 bg-orange-50',
      template: 'border-cyan-200 bg-cyan-50',
      policy: 'border-red-200 bg-red-50',
      other: 'border-gray-200 bg-gray-50',
    };
    return styles[category as keyof typeof styles] || styles.other;
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'archived':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Format relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const fileDate = new Date(date);
    const diffInMs = now.getTime() - fileDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  // Bulk actions
  const selectedFileObjects = files.filter(file => selectedFiles.has(file.id));

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {/* Bulk Actions Bar */}
        {selectedFiles.size > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedFiles.size} file(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkAction('download', selectedFileObjects)}
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkAction('share', selectedFileObjects)}
                >
                  Share
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onBulkAction('delete', selectedFileObjects)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Select All */}
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={files.length > 0 && files.every(file => selectedFiles.has(file.id))}
              onCheckedChange={onSelectAll}
            />
            <span className="text-sm font-medium">Select All</span>
          </div>
          <div className="text-sm text-gray-500">
            {files.length} files
          </div>
        </div>

        {/* List Items */}
        {files.map((file) => {
          const CategoryIcon = getCategoryIcon(file.category);
          const AccessIcon = getAccessIcon(file.access_level);

          return (
            <Card
              key={file.id}
              className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${getCategoryStyles(file.category)}`}
              onClick={() => onView(file)}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <Checkbox
                  checked={selectedFiles.has(file.id)}
                  onCheckedChange={() => onSelectFile(file.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />

                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <CategoryIcon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {file.title}
                      </h3>
                      {file.description && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {file.description}
                        </p>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenu.Trigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-2"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content align="end">
                        <DropdownMenu.Item onClick={() => onView(file)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => onEdit(file)}>
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

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CategoryIcon className="w-3 h-3" />
                      <span className="capitalize">{file.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AccessIcon className="w-3 h-3" />
                      <span className="capitalize">{file.access_level}</span>
                    </div>
                    <span>{formatFileSize(file.file_size || 0)}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(file.updated_at)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {file.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {file.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{file.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Status */}
                  <div className="mt-2">
                    <Badge variant={getStatusVariant(file.status)} className="text-xs">
                      {file.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // Grid View
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">View:</label>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
          {viewMode === 'grid' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Columns:</label>
              {[2, 3, 4, 6].map((cols) => (
                <Button
                  key={cols}
                  variant={itemsPerRow === cols ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setItemsPerRow(cols)}
                >
                  {cols}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedFiles.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedFiles.size} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction('download', selectedFileObjects)}
            >
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction('share', selectedFileObjects)}
            >
              Share
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onBulkAction('delete', selectedFileObjects)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div
        className={`grid gap-4 ${
          itemsPerRow === 2 ? 'grid-cols-1 md:grid-cols-2' :
          itemsPerRow === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
          itemsPerRow === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
        }`}
      >
        {files.map((file) => {
          const CategoryIcon = getCategoryIcon(file.category);
          const AccessIcon = getAccessIcon(file.access_level);

          return (
            <Card
              key={file.id}
              className={`relative p-4 hover:shadow-lg transition-all cursor-pointer ${getCategoryStyles(file.category)}`}
              onClick={() => onView(file)}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedFiles.has(file.id)}
                  onCheckedChange={() => onSelectFile(file.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Actions Menu */}
              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item onClick={() => onView(file)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => onEdit(file)}>
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

              {/* File Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <CategoryIcon className="w-8 h-8 text-gray-600" />
                </div>
              </div>

              {/* File Info */}
              <div className="text-center">
                <h3 className="font-medium text-gray-900 truncate mb-1">
                  {file.title}
                </h3>

                {file.description && (
                  <p className="text-sm text-gray-600 truncate mb-3">
                    {file.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <CategoryIcon className="w-3 h-3" />
                    <span className="capitalize">{file.category}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <AccessIcon className="w-3 h-3" />
                    <span className="capitalize">{file.access_level}</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {formatFileSize(file.file_size || 0)}
                  </div>

                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(file.updated_at)}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-3">
                  <Badge variant={getStatusVariant(file.status)}>
                    {file.status}
                  </Badge>
                </div>

                {/* Tags */}
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-3">
                    {file.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {file.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{file.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {files.length === 0 && (
        <div className="text-center py-12">
          <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">Upload some files to get started.</p>
        </div>
      )}
    </div>
  );
}
